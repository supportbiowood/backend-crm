const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const depositInvoiceModel = require("../models/depositInvoice.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const salesInvoiceModel = require("../models/salesInvoice.model");
const paymentReceiptModel = require("../models/paymentReceipt.model");
const paymentChannelModel = require("../models/paymentChannel.model");

const itemValidation = require("../utils/item");
const calculate = require("../utils/calculate");
const { genDocumentId } = require("../utils/generate");

const depositInvoiceTemplate = require("../templates/depositInvoice");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const AccountJournal = require("../models/accountJournal.model");
const accountJournalController = require('../controllers/accountJournal.controller');
const { accountConfig } = require('../configs/accountConfig');

const documentName = ActivityRefTypeEnum.DEPOSIT_INVOICE;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;


exports.getAll = async (req, res) => {
    try {
        const result = await depositInvoiceModel.getAll();

        return res.send({
            status: "success",
            data: result.reverse(),
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getByDocumentId = async (req, res) => {
    try {
        const result = await depositInvoiceModel.getByDocumentId(req.params.document_id);

        let paymentReceiptList = await paymentReceiptModel.getByRefTypeAndRefDocumentId("deposit_invoice", result.deposit_invoice_document_id);

        for (let paymentReceipt of paymentReceiptList) {
            if (paymentReceipt.payment_channel_id !== null) {
                let paymentChannelResult = await paymentChannelModel.getById(paymentReceipt.payment_channel_id);
                paymentReceipt.payment_channel_type = paymentChannelResult.payment_channel_type;
                paymentReceipt.payment_channel_info = paymentChannelResult.payment_channel_info;
            } else {
                paymentReceipt.payment_channel_type = "check";
                paymentReceipt.payment_channel_info = null;
            }
        }

        result.payment_channel_list = paymentReceiptList;

        if (result.sales_invoice_document_id) {
            let salesInvoiceResult = await salesInvoiceModel.getByDocumentId(result.sales_invoice_document_id);
            result.sales_invoice = salesInvoiceResult || null;
        }


        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getSalesInvoiceList = async (req, res) => {
    try {
        let result = [];
        let salesInvoiceListResult = await salesInvoiceModel.getByContactId(req.params.contact_id);

        for (let salesInvoice of salesInvoiceListResult) {
            let amountToPay = await calculate.amountToPayOfSalesAccount(salesInvoice.sales_invoice_document_id);

            if (amountToPay !== 0) {
                let data = {
                    sales_invoice_id: salesInvoice.sales_invoice_id,
                    sales_invoice_document_id: salesInvoice.sales_invoice_document_id,
                    issue_date: salesInvoice.sales_invoice_issue_date,
                    net_amount: salesInvoice.total_amount,
                    amount_to_pay: amountToPay,
                };
                result.push(data);
            }
        }

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.deposit_invoice_template_remark_id === undefined || req.body.deposit_invoice_template_remark_id === "") {
        req.body.deposit_invoice_template_remark_id = null;
    }

    if (req.body.deposit_invoice_remark === undefined || req.body.deposit_invoice_remark === "") {
        req.body.deposit_invoice_remark = null;
    }

    try {
        const newDepositInvoiceData = new depositInvoiceModel(req.body);
        itemValidation.validateItemDepositInvoice(req.body.deposit_invoice_data);
        const genDIDocumentIdResult = await genDocumentId("DI", "deposit_invoice");
        newDepositInvoiceData.deposit_invoice_document_id = genDIDocumentIdResult.document_id;
        newDepositInvoiceData.deposit_invoice_status = "draft";

        const result = await depositInvoiceModel.create(newDepositInvoiceData, req.user);
        //add documentId to result data
        result.documentId = genDIDocumentIdResult.document_id;

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                genDIDocumentIdResult.document_id,
                documentCategory,
                "สร้าง",
                req.user);
        }

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.update = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.deposit_invoice_template_remark_id === undefined || req.body.deposit_invoice_template_remark_id === "") {
        req.body.deposit_invoice_template_remark_id = null;
    }

    if (req.body.deposit_invoice_remark === undefined || req.body.deposit_invoice_remark === "") {
        req.body.deposit_invoice_remark = null;
    }

    try {
        if (req.body.deposit_invoice_status === undefined || req.body.deposit_invoice_status === null || req.body.deposit_invoice_status === "") {
            throw new Error(`deposit_invoice_status is not value`);
        }

        const newDepositInvoiceData = new depositInvoiceModel(req.body);
        itemValidation.validateItemDepositInvoice(req.body.deposit_invoice_data);
        if (req.body.deposit_invoice_approveby !== null && req.body.deposit_invoice_approveby !== undefined) {
            newDepositInvoiceData.deposit_invoice_approveby = req.body.deposit_invoice_approveby;
        }
        if (req.body.deposit_invoice_approveby_employee !== null && req.body.deposit_invoice_approveby_employee !== undefined) {
            newDepositInvoiceData.deposit_invoice_approveby_employee = JSON.stringify(req.body.deposit_invoice_approveby_employee);
        }

        const result = await depositInvoiceModel.updateByDocumentId(req.params.document_id, newDepositInvoiceData, req.user);

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.deposit_invoice_id,
                documentName,
                req.body.deposit_invoice_document_id,
                documentCategory,
                "แก้ไข",
                req.user);
        }

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.deposit_invoice_template_remark_id === undefined || req.body.deposit_invoice_template_remark_id === "") {
        req.body.deposit_invoice_template_remark_id = null;
    }

    if (req.body.deposit_invoice_remark === undefined || req.body.deposit_invoice_remark === "") {
        req.body.deposit_invoice_remark = null;
    }

    try {
        req.body.deposit_invoice_status = "wait_payment";
        itemValidation.validateItemDepositInvoice(req.body.deposit_invoice_data);

        if (req.body.deposit_invoice_id === undefined) {
            const newDepositInvoiceData = new depositInvoiceModel(req.body);
            const genDIDocumentIdResult = await genDocumentId("DI", "deposit_invoice");
            newDepositInvoiceData.deposit_invoice_document_id = genDIDocumentIdResult.document_id;
            newDepositInvoiceData.deposit_invoice_approveby = req.user.employee_id;
            newDepositInvoiceData.deposit_invoice_approveby_employee = JSON.stringify(req.user);

            const result = await depositInvoiceModel.create(newDepositInvoiceData, req.user);

            //add documentId to result data
            result.documentId = genDIDocumentIdResult.document_id;

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDIDocumentIdResult.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDIDocumentIdResult.document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newDepositInvoiceData = new depositInvoiceModel(req.body);
            itemValidation.validateItemDepositInvoice(req.body.deposit_invoice_data);
            newDepositInvoiceData.deposit_invoice_approveby = req.user.employee_id;
            newDepositInvoiceData.deposit_invoice_approveby_employee = JSON.stringify(req.user);

            const result = await depositInvoiceModel.update(req.body.deposit_invoice_id, newDepositInvoiceData, req.user);

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.deposit_invoice_id,
                    documentName,
                    req.body.deposit_invoice_document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.copyDocument = async (req, res) => {
    try {
        const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(req.params.document_id);
        if (depositInvoiceResult !== undefined) {
            let result = {
                billing_info: depositInvoiceResult.billing_info,
                deposit_invoice_data: depositInvoiceResult.deposit_invoice_data,
                deposit_invoice_template_remark_id: depositInvoiceResult.deposit_invoice_template_remark_id,
                deposit_invoice_remark: depositInvoiceResult.deposit_invoice_remark,
                total_amount: depositInvoiceResult.total_amount,
                sale_list: depositInvoiceResult.sale_list
            };
            return res.send({
                status: "success",
                data: result,
            });
        } else {
            throw new Error("ไม่พบเอกสาร");
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.generatePaymentReceiptData = async (req, res) => {
    try {
        const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(req.params.document_id);

        if (depositInvoiceResult !== undefined) {
            let result = {
                ref_type: "deposit_invoice",
                ref_document_id: depositInvoiceResult.deposit_invoice_document_id,
                billing_info: depositInvoiceResult.billing_info,
                payment_receipt_data: {
                    document_id: depositInvoiceResult.deposit_invoice_document_id,
                    issue_date: depositInvoiceResult.deposit_invoice_issue_date,
                    received_amount: depositInvoiceResult.total_amount
                },
                total_amount: depositInvoiceResult.total_amount
            };
            return res.send({
                status: 'success',
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร ${req.params.deposit_invoice_document_id}`);
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.genDocument = async (req, res) => {
    try {
        const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(
            req.params.document_id
        );

        if (depositInvoiceResult !== undefined) {
            depositInvoiceResult.deposit_invoice_issue_date = moment(depositInvoiceResult.deposit_invoice_issue_date).format("DD/MM/YYYY");

            const pdf_name = `${depositInvoiceResult.deposit_invoice_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                depositInvoiceTemplate(depositInvoiceResult),
                {
                    format: "A4",
                    directory: ".",
                    filename: pdf_path,
                }
            );

            return res.sendFile(pdf_path, async (err) => {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        await fs.unlinkSync(pdf_path);
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        } else {
            return res.status(400).send({
                status: "error",
                message: "ไม่มีเอกสารฉบับนี้",
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.applyToSalesInvoice = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    try {
        const result = await depositInvoiceModel.updateByDocumentId(req.params.document_id,
            {
                deposit_invoice_status: "closed",
                sales_invoice_document_id: req.body.sales_invoice_document_id,
                deposit_invoice_info: JSON.stringify(req.body.deposit_invoice_info)
            },
            req.user);

        const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(req.params.document_id);
        //create project activity
        if (depositInvoiceResult.billing_info) {
            await addDocumentActivity(
                depositInvoiceResult.billing_info.project_id,
                depositInvoiceResult.deposit_invoice_id,
                documentName,
                depositInvoiceResult.deposit_invoice_document_id,
                documentCategory,
                `นำใบแจ้งหนี้มัดจำ ผูกกับ ใบแจ้งหนี้เลขที่เอกสาร ${req.body.sales_invoice_document_id}`,
                req.user);

            const newAccountJournalData = new AccountJournal(
                {
                    "account_journal_ref_document_id": req.body.sales_invoice_document_id,
                    "account_journal_ref_type": ActivityRefTypeEnum.SALES_INVOICE,
                    "transactions": [
                        {
                            "account_transaction_type": "debit",
                            "account_id": accountConfig.unearned_revenue,
                            "amount" : depositInvoiceResult.total_amount,
                        },
                        {
                            "account_transaction_type": "credit",
                            "account_id": accountConfig.accounts_receivable,
                            "amount" : depositInvoiceResult.total_amount,
                        },
                        {
                            "account_transaction_type": "debit",
                            "account_id": accountConfig.cost_of_good_sold,
                            "amount" : depositInvoiceResult.total_amount,
                        },
                        {
                            "account_transaction_type": "credit",
                            "account_id": accountConfig.inventory_asset,
                            "amount" : depositInvoiceResult.total_amount,
                        }
                    ]
                }
            );
    
            await accountJournalController.internalUpdateAccountJournal(depositInvoiceResult.deposit_invoice_document_id, newAccountJournalData, req.user);
        }

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
        console.trace(error);
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(req.params.document_id);

        if (depositInvoiceResult !== undefined) {

            let paymentReceiptListResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("deposit_invoice", depositInvoiceResult.deposit_inovice_document_id);

            paymentReceiptListResult = await paymentReceiptListResult.filter((rt) => rt.payment_receipt_status !== "cancelled");

            if (paymentReceiptListResult.length === 0) {
                const result = await depositInvoiceModel.updateByDocumentId(req.params.document_id, { deposit_invoice_status: "cancelled" }, req.user);

                //create project activity
                if (depositInvoiceResult.billing_info) {
                    await addDocumentActivity(
                        depositInvoiceResult.billing_info.project_id,
                        depositInvoiceResult.deposit_invoice_id,
                        documentName,
                        depositInvoiceResult.deposit_invoice_document_id,
                        documentCategory,
                        "ยกเลิก",
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result
                });
            } else {
                throw new Error(`กรุณายกเลิกเอกสารที่เกี่ยวข้อง`);
            }

        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};