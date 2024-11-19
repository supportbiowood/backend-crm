const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const salesInvoiceModel = require("../models/salesInvoice.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const quotationModel = require("../models/quotation.model");
const billingNoteModel = require("../models/billingNote.model");
const paymentReceiptModel = require("../models/paymentReceipt.model");
const salesOrderModel = require("../models/salesOrder.model");
const depositInvoiceModel = require("../models/depositInvoice.model");
const creditNoteModel = require("../models/creditNote.model");

const calculate = require("../utils/calculate");
const { genDocumentId } = require("../utils/generate");
const itemValidation = require("../utils/item");

const salesInvoiceTemplate = require("../templates/salesInvoice");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const AccountJournal = require("../models/accountJournal.model");
const accountJournalController = require('../controllers/accountJournal.controller');
const { accountConfig } = require('../configs/accountConfig');

const documentName = ActivityRefTypeEnum.SALES_INVOICE;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await salesInvoiceModel.getAll();

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

exports.getByContactId = async (req, res) => {
    try {
        const result = [];
        const salesInvoiceListResult = await salesInvoiceModel.getByContactId(req.params.contact_id);

        for (let salesInvoice of salesInvoiceListResult) {
            let amountToPay = await calculate.amountToPayOfSalesAccount(salesInvoice.sales_invoice_document_id);

            if (amountToPay !== 0) {
                let data = {
                    sales_invoice_id: salesInvoice.sales_invoice_id,
                    sales_invoice_document_id: salesInvoice.sales_invoice_document_id,
                    issue_date: salesInvoice.sales_invoice_issue_date,
                    total_amount: salesInvoice.total_amount,
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

exports.getByDocumentId = async (req, res) => {
    try {
        const result = await salesInvoiceModel.getByDocumentId(req.params.document_id);

        /**
         * If has document then do this below
         */
        if (result !== undefined && result !== null) {
            result.billing_note_list =
                await billingNoteModel.getBySalesInvoiceDocumentId(
                    result.sales_invoice_document_id
                );

            let depositInvoiceList = await depositInvoiceModel.getBySalesInvoiceDocumentId(result.sales_invoice_document_id) || [];
            let creditNoteList = await creditNoteModel.getBySalesInvoiceDocumentId(result.sales_invoice_document_id) || [];
            let paymentReceiptList = await paymentReceiptModel.getByRefTypeAndRefDocumentId("sales_invoice", result.sales_invoice_document_id) || [];

            result.deposit_invoice_list = await depositInvoiceList.filter((di) => di.deposit_invoice_status !== 'cancelled');
            result.credit_note_list = await creditNoteList.filter((cn) => cn.credit_note_status !== 'cancelled');
            result.payment_receipt_list = await paymentReceiptList.filter((rt) => rt.payment_receipt_status !== 'cancelled');
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

    if (
        req.body.sales_invoice_template_remark_id === "" ||
        req.body.sales_invoice_template_remark_id === undefined
    ) {
        req.body.sales_invoice_template_remark_id = null;
    }

    if (
        req.body.sales_invoice_remark === "" ||
        req.body.sales_invoice_remark === undefined
    ) {
        req.body.sales_invoice_remark = null;
    }
    try {
        const newSalesInvoiceData = new salesInvoiceModel(req.body);
        itemValidation.validateItemSale(newSalesInvoiceData.sales_invoice_data);
        const genDocumentIdResult = await genDocumentId("SI", "sales_invoice");
        newSalesInvoiceData.sales_invoice_document_id = genDocumentIdResult.document_id;
        newSalesInvoiceData.sales_invoice_status = "draft";
        newSalesInvoiceData.sales_invoice_stage = "sales_order";
        delete newSalesInvoiceData["sales_invoice_approveby"];
        delete newSalesInvoiceData["sales_invoice_approveby_employee"];

        const result = await salesInvoiceModel.create(newSalesInvoiceData, req.user);

        //add documentId to result data
        result.documentId = genDocumentIdResult.document_id;

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                genDocumentIdResult.document_id,
                documentCategory,
                "สร้าง",
                req.user);
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

exports.update = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    if (
        req.body.sales_invoice_template_remark_id === "" ||
        req.body.sales_invoice_template_remark_id === undefined
    ) {
        req.body.sales_invoice_template_remark_id = null;
    }

    if (
        req.body.sales_invoice_remark === "" ||
        req.body.sales_invoice_remark === undefined
    ) {
        req.body.sales_invoice_remark = null;
    }
    try {
        if (req.body.sales_invoice_status === undefined || req.body.sales_invoice_status === null || req.body.sales_invoice_status === "") {
            throw new Error(`sales_invoice_status is not value`);
        }

        const newSalesInvoiceData = new salesInvoiceModel(req.body);
        itemValidation.validateItemSale(newSalesInvoiceData.sales_invoice_data);
        newSalesInvoiceData.billing_info = JSON.stringify(
            newSalesInvoiceData.billing_info
        );
        newSalesInvoiceData.sales_invoice_data = JSON.stringify(
            newSalesInvoiceData.sales_invoice_data
        );
        newSalesInvoiceData.sale_list = JSON.stringify(
            newSalesInvoiceData.sale_list
        );
        if (req.body.sales_invoice_approveby !== null && req.body.sales_invoice_approveby !== undefined) {
            newSalesInvoiceData.sales_invoice_approveby = req.body.sales_invoice_approveby;
        }
        if (req.body.sales_invoice_approveby_employee !== null && req.body.sales_invoice_approveby_employee !== undefined) {
            newSalesInvoiceData.sales_invoice_approveby_employee = JSON.stringify(req.body.sales_invoice_approveby_employee);
        }

        const result = await salesInvoiceModel.updateByDocumentId(
            req.params.document_id,
            newSalesInvoiceData,
            req.user
        );

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.sales_invoice_id,
                documentName,
                req.body.sales_invoice_document_id,
                documentCategory,
                "แก้ไข",
                req.user);
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

exports.waitApprove = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (
        req.body.sales_invoice_template_remark_id === "" ||
        req.body.sales_invoice_template_remark_id === undefined
    ) {
        req.body.sales_invoice_template_remark_id = null;
    }

    if (
        req.body.sales_invoice_remark === "" ||
        req.body.sales_invoice_remark === undefined
    ) {
        req.body.sales_invoice_remark = null;
    }

    try {
        req.body.sales_invoice_status = "wait_approve";

        if (req.body.sales_invoice_id === undefined) {
            const newSalesInvoiceData = new salesInvoiceModel(req.body);
            itemValidation.validateItemSale(newSalesInvoiceData.sales_invoice_data);
            const genDocumentIdResult = await genDocumentId("SI", "sales_invoice");
            newSalesInvoiceData.sales_invoice_document_id = genDocumentIdResult.document_id;
            newSalesInvoiceData.sales_invoice_stage = "sales_order";
            delete newSalesInvoiceData["sales_invoice_approveby"];
            delete newSalesInvoiceData["sales_invoice_approveby_employee"];

            const result = await salesInvoiceModel.create(newSalesInvoiceData, req.user);

            //add documentId to result data
            result.documentId = genDocumentIdResult.document_id;

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "รออนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        } else {
            const newSalesInvoiceData = new salesInvoiceModel(req.body);
            itemValidation.validateItemSale(newSalesInvoiceData.sales_invoice_data);
            newSalesInvoiceData.sales_invoice_stage = "sales_order";
            newSalesInvoiceData.billing_info = JSON.stringify(
                newSalesInvoiceData.billing_info
            );
            newSalesInvoiceData.sales_invoice_data = JSON.stringify(
                newSalesInvoiceData.sales_invoice_data
            );
            newSalesInvoiceData.sale_list = JSON.stringify(
                newSalesInvoiceData.sale_list
            );
            const result = await salesInvoiceModel.updateByDocumentId(
                req.body.sales_invoice_document_id,
                newSalesInvoiceData,
                req.user
            );

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.sales_invoice_id,
                    documentName,
                    req.body.sales_invoice_document_id,
                    documentCategory,
                    "รออนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
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

    if (
        req.body.sales_invoice_template_remark_id === "" ||
        req.body.sales_invoice_template_remark_id === undefined
    ) {
        req.body.sales_invoice_template_remark_id = null;
    }

    if (
        req.body.sales_invoice_remark === "" ||
        req.body.sales_invoice_remark === undefined
    ) {
        req.body.sales_invoice_remark = null;
    }

    const mysql = await db.getConnection();
    await mysql.beginTransaction();

    try {
        req.body.sales_invoice_status = "wait_payment";

        if (req.body.sales_invoice_id === undefined) {
            const newSalesInvoiceData = new salesInvoiceModel(req.body);
            itemValidation.validateItemSale(newSalesInvoiceData.sales_invoice_data);
            const genDocumentIdResult = await genDocumentId("SI", "sales_invoice");
            newSalesInvoiceData.sales_invoice_document_id = genDocumentIdResult.document_id;
            newSalesInvoiceData.sales_invoice_stage = "invoice";
            newSalesInvoiceData.sales_invoice_approveby = req.user.employee_id;
            newSalesInvoiceData.sales_invoice_approveby_employee = JSON.stringify(req.user);

            const result = await salesInvoiceModel.create(newSalesInvoiceData, req.user);

            //add documentId to result data
            result.documentId = genDocumentIdResult.document_id;

            if (req.body.sales_order_document_id !== null && req.body.sales_order_document_id !== "") {
                const salesOrderResult = await salesOrderModel.getByDocumentId(req.body.sales_order_document_id);

                if (salesOrderResult.sales_order_status !== "closed") {
                    await salesOrderModel.update(salesOrderResult.sales_order_id, { sales_order_status: "closed", sales_order_stage: "invoice" }, req.user);
                    if (salesOrderResult.quotation_document_id !== null && salesOrderResult.quotation_document_id !== "") {
                        await quotationModel.updateByDocumentId(salesOrderResult.quotation_document_id, { quotation_stage: "invoice" }, req.user);
                    }
                }
            }

            const newAccountJournalData = new AccountJournal(
                {
                    "account_journal_ref_document_id": genDocumentIdResult.document_id,
                    "account_journal_ref_type": documentName,
                    "transactions": [
                        {
                            "account_transaction_type": "debit",
                            "account_id": accountConfig.accounts_receivable,
                            "amount" : newSalesInvoiceData.total_amount,
                        },
                        {
                            "account_transaction_type": "credit",
                            "account_id": accountConfig.sales,
                            "amount" : newSalesInvoiceData.total_amount,
                        }
                    ]
                }
            );

            await accountJournalController.internalCreateAccountJournal(newAccountJournalData, req.user);

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        } else {
            const newSalesInvoiceData = new salesInvoiceModel(req.body);
            itemValidation.validateItemSale(newSalesInvoiceData.sales_invoice_data);
            newSalesInvoiceData.sales_invoice_stage = "invoice";
            newSalesInvoiceData.billing_info = JSON.stringify(newSalesInvoiceData.billing_info);
            newSalesInvoiceData.sales_invoice_data = JSON.stringify(newSalesInvoiceData.sales_invoice_data);
            newSalesInvoiceData.sale_list = JSON.stringify(newSalesInvoiceData.sale_list);
            newSalesInvoiceData.sales_invoice_approveby = req.user.employee_id;
            newSalesInvoiceData.sales_invoice_approveby_employee = JSON.stringify(req.user);

            const result = await salesInvoiceModel.updateByDocumentId(
                req.body.sales_invoice_document_id,
                newSalesInvoiceData,
                req.user
            );

            if (req.body.sales_order_document_id !== null && req.body.sales_order_document_id !== "") {
                const salesOrderResult = await salesOrderModel.getByDocumentId(req.body.sales_order_document_id);

                if (salesOrderResult.sales_order_status !== "closed") {
                    await salesOrderModel.update(salesOrderResult.sales_order_id, { sales_order_status: "closed", sales_order_stage: "invoice" }, req.user);
                    if (salesOrderResult.quotation_document_id !== null && salesOrderResult.quotation_document_id !== "") {
                        await quotationModel.updateByDocumentId(salesOrderResult.quotation_document_id, { quotation_stage: "invoice" }, req.user);
                    }
                }
            }

            const newAccountJournalData = new AccountJournal(
                {
                    "account_journal_ref_document_id": req.body.req.body.sales_invoice_document_id,
                    "account_journal_ref_type": documentName,
                    "transactions": [
                        {
                            "account_transaction_type": "debit",
                            "account_id": accountConfig.accounts_receivable,
                            "amount" : newSalesInvoiceData.total_amount,
                        },
                        {
                            "account_transaction_type": "credit",
                            "account_id": accountConfig.sales,
                            "amount" : newSalesInvoiceData.total_amount,
                        }
                    ]
                }
            );

            await accountJournalController.internalCreateAccountJournal(newAccountJournalData, req.user);

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.sales_invoice_id,
                    documentName,
                    req.body.sales_invoice_document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.notApprove = async (req, res) => {
    try {
        const result = await salesInvoiceModel.updateByDocumentId(req.params.document_id, { sales_invoice_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null }, req.user);

        const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(req.params.document_id);

        //create project activity
        if (salesInvoiceResult.billing_info) {
            await addDocumentActivity(
                salesInvoiceResult.billing_info.project_id,
                salesInvoiceResult.sales_invoice_id,
                documentName,
                salesInvoiceResult.sales_invoice_document_id,
                documentCategory,
                req.body.not_approve_reason || "ไม่อนุมัติ",
                req.user);
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
exports.copyDocument = async (req, res) => {
    try {
        const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(req.params.document_id);
        if (salesInvoiceResult !== undefined) {
            let result = {
                sales_order_document_id: salesInvoiceResult.sales_order_document_id,
                billing_info: salesInvoiceResult.billing_info,
                sale_list: salesInvoiceResult.sale_list,
                sales_invoice_data: salesInvoiceResult.sales_invoice_data,
                sales_invoice_template_remark_id:
                    salesInvoiceResult.sales_invoice_template_remark_id,
                sales_invoice_remark: salesInvoiceResult.sales_invoice_remark,
                shipping_cost: salesInvoiceResult.shipping_cost,
                additional_discount: salesInvoiceResult.additional_discount,
                vat_exempted_amount: salesInvoiceResult.vat_exempted_amount,
                vat_0_amount: salesInvoiceResult.vat_0_amount,
                vat_7_amount: salesInvoiceResult.vat_7_amount,
                vat_amount: salesInvoiceResult.vat_amount,
                net_amount: salesInvoiceResult.net_amount,
                withholding_tax: salesInvoiceResult.withholding_tax,
                total_amount: salesInvoiceResult.total_amount,
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
exports.genDocument = async (req, res) => {
    try {
        const salesInvoiceData = await salesInvoiceModel.getByDocumentId(
            req.params.document_id
        );

        if (salesInvoiceData !== undefined) {
            salesInvoiceData.sales_invoice_issue_date = moment(
                salesInvoiceData.sales_invoice_issue_date
            ).format("DD/MM/YYYY");
            salesInvoiceData.sales_invoice_due_date = moment(
                salesInvoiceData.sales_invoice_due_date
            ).format("DD/MM/YYYY");
            salesInvoiceData.billing_info.address =
                salesInvoiceData.billing_info.address === ""
                    ? "-"
                    : salesInvoiceData.billing_info.address;
            const pdf_name = `${salesInvoiceData.sales_invoice_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                salesInvoiceTemplate(salesInvoiceData),
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

exports.generatePaymentReceiptData = async (req, res) => {
    try {
        const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(
            req.params.document_id
        );
        if (salesInvoiceResult !== undefined) {

            if (salesInvoiceResult.sales_invoice_status !== "payment_complete") {
                let amount_to_pay = await calculate.amountToPayOfSalesAccount(salesInvoiceResult.sales_invoice_document_id);

                if (amount_to_pay === 0) {
                    throw new Error("รอการชำระจากใบวางบิล");
                }

                let result = {
                    payment_receipt_document_id: null,
                    ref_type: "sales_invoice",
                    ref_document_id: salesInvoiceResult.sales_invoice_document_id,
                    billing_info: salesInvoiceResult.billing_info,
                    payment_receipt_data: [
                        {
                            document_id: salesInvoiceResult.sales_invoice_document_id,
                            issue_date: salesInvoiceResult.sales_invoice_issue_date,
                            due_date: salesInvoiceResult.sales_invoice_due_date,
                            total_amount: salesInvoiceResult.total_amount,
                            amount_to_pay: amount_to_pay,
                            // received_amount: 0, tempolarly set it to amount to pay
                            received_amount: amount_to_pay,
                        },
                    ],

                    withholding_tax: calculate.withHoldingTaxSaleInvoice(salesInvoiceResult)

                };
                return res.send({
                    status: "success",
                    data: result
                });
            } else {
                throw new Error("ชำระแล้ว");
            }
        } else {
            throw new Error(
                `ไม่พบหมายเลขเอกสาร ${req.params.sales_invoice_document_id}`
            );
        }
    } catch (error) {
        // console.trace(error)
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.delete = async (req, res) => {

    const mysql = await db.getConnection();

    await mysql.beginTransaction();

    try {
        const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(req.params.document_id);

        if (salesInvoiceResult !== undefined) {
            let billingNoteListResult = await billingNoteModel.getBySalesInvoiceDocumentId(salesInvoiceResult.sales_invoice_document_id);
            billingNoteListResult = await billingNoteListResult.filter((bn) => bn.billing_note_status !== "cancelled");

            let paymentReceiptListResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("sales_invoice", salesInvoiceResult.sales_invoice_document_id);
            paymentReceiptListResult = await paymentReceiptListResult.filter((rt) => rt.payment_receipt_status !== "cancelled");

            let depositInvoiceListResult = await depositInvoiceModel.getBySalesInvoiceDocumentId(salesInvoiceResult.sales_invoice_document_id);
            depositInvoiceListResult = await depositInvoiceListResult.filter((di) => di.deposit_invoice_status !== "cancelled");

            let creditNoteListResult = await creditNoteModel.getBySalesInvoiceDocumentId(salesInvoiceResult.sales_invoice_document_id);
            creditNoteListResult = await creditNoteListResult.filter((cn) => cn.credit_note_status !== "cancelled");

            if (creditNoteListResult.length === 0 && depositInvoiceListResult.length === 0 && paymentReceiptListResult.length === 0 && billingNoteListResult.length === 0) {

                const result = await salesInvoiceModel.updateByDocumentId(req.params.document_id, { sales_invoice_status: "cancelled" }, req.user);

                //create project activity
                if (salesInvoiceResult.billing_info) {
                    await addDocumentActivity(
                        salesInvoiceResult.billing_info.project_id,
                        salesInvoiceResult.sales_invoice_id,
                        documentName,
                        salesInvoiceResult.sales_invoice_document_id,
                        documentCategory,
                        "ยกเลิก",
                        req.user);
                }

                if (salesInvoiceResult.sales_order_document_id !== null && salesInvoiceResult.sales_order_document_id !== "") {
                    let salesInvoiceListResult = await salesInvoiceModel.getAllBySalesOrderDocumentId(salesInvoiceResult.sales_invoice_document_id);
                    salesInvoiceListResult = await salesInvoiceListResult.filter((si) => si.sales_invoice_status !== "cancelled");

                    if (salesInvoiceListResult.length === 0) {
                        await salesOrderModel.updateByDocumentId(salesInvoiceResult.sales_order_document_id, { sales_order_status: "approved", sales_order_stage: "sales_order" }, req.user);

                        const salesOrderResult = await salesOrderModel.getByDocumentId(salesInvoiceResult.sales_order_document_id);

                        if (salesOrderResult.quotation_document_id !== null && salesOrderResult.quotation_document_id !== "") {
                            await quotationModel.updateByDocumentId(salesOrderResult.quotation_document_id, { quotation_stage: "sales_order" }, req.user);
                        }
                    }
                }

                await mysql.commit();
                await mysql.release();
                return res.send({
                    status: "success",
                    data: result
                });
            }
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }
    } catch (error) {
        await mysql.rollback();
        await mysql.release();
        console.log("Rollback successful");
        console.dir(error, { depth: null });

        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
