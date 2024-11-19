const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const creditNoteModel = require("../models/creditNote.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const paymentChannelModel = require("../models/paymentChannel.model");
const paymentChannelController = require("../controllers/paymentChannel.controller");
const salesReturnModel = require("../models/salesReturn.model");
const salesInvoiceModel = require("../models/salesInvoice.model");

const creditNoteTemplate = require("../templates/creditNote");

const { genDocumentId } = require("../utils/generate");

const itemValidation = require("../utils/item");
const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const AccountJournal = require("../models/accountJournal.model");
const accountJournalController = require('../controllers/accountJournal.controller');
const { accountConfig } = require('../configs/accountConfig');

const documentName = ActivityRefTypeEnum.CREDIT_NOTE;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await creditNoteModel.getAll();

        return res.send({
            status: "success",
            data: result.reverse()
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.getByDocumentId = async (req, res) => {
    try {
        const result = await creditNoteModel.getByDocumentId(req.params.document_id);

        if (result.sales_invoice_document_id !== null) {
            result.sales_invoice = await salesInvoiceModel.getByDocumentId(result.sales_invoice_document_id);
        } else {
            result.sales_invoice = null;
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
exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.credit_note_template_remark_id === undefined || req.body.credit_note_template_remark_id === "") {
        req.body.credit_note_template_remark_id = null;
    }

    if (req.body.credit_note_remark === undefined || req.body.credit_note_remark === "") {
        req.body.credit_note_remark = null;
    }

    try {
        itemValidation.validateItemSale(req.body.credit_note_data);
        const newCreditNoteData = new creditNoteModel(req.body);
        const genCNDocumentId = await genDocumentId("CN", "credit_note");
        newCreditNoteData.credit_note_document_id = genCNDocumentId.document_id;
        newCreditNoteData.credit_note_status = "draft";

        const result = await creditNoteModel.create(newCreditNoteData, req.user);

        result.documentId = genCNDocumentId.document_id;

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                genCNDocumentId.document_id,
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

    if (req.body.credit_note_template_remark_id === undefined || req.body.credit_note_template_remark_id === "") {
        req.body.credit_note_template_remark_id = null;
    }

    if (req.body.credit_note_remark === undefined || req.body.credit_note_remark === "") {
        req.body.credit_note_remark = null;
    }

    try {
        itemValidation.validateItemSale(req.body.credit_note_data);
        if (req.body.credit_note_status === undefined || req.body.credit_note_status === null || req.body.credit_note_status === "") {
            throw new Error(`credit_note_status is not value`);
        }

        const newCreditNoteData = new creditNoteModel(req.body);

        const result = await creditNoteModel.updateByDocumentId(req.params.document_id, newCreditNoteData, req.user);

        //create project activity
        if (req.body.billing_info.project_id) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                newCreditNoteData.credit_note_document_id,
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
            status: "success",
            message: `${error}`
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

    if (req.body.credit_note_template_remark_id === undefined || req.body.credit_note_template_remark_id === "") {
        req.body.credit_note_template_remark_id = null;
    }

    if (req.body.credit_note_remark === undefined || req.body.credit_note_remark === "") {
        req.body.credit_note_remark = null;
    }

    try {
        itemValidation.validateItemSale(req.body.credit_note_data);
        req.body.credit_note_status = "wait_approve";

        if (!req.body.credit_note_document_id || req.body.credit_note_document_id === null || req.body.credit_note_document_id.length <= 1) {
            const newCreditNoteData = new creditNoteModel(req.body);
            const genCNDocumentId = await genDocumentId("CN", "credit_note");
            newCreditNoteData.credit_note_document_id = genCNDocumentId.document_id;

            const result = await creditNoteModel.create(newCreditNoteData, req.user);

            result.documentId = genCNDocumentId.document_id;

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genCNDocumentId.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genCNDocumentId.document_id,
                    documentCategory,
                    "รออนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newCreditNoteData = new creditNoteModel(req.body);
            newCreditNoteData.credit_note_document_id = req.body.credit_note_document_id;
            const result = await creditNoteModel.update(req.body.credit_note_document_id, newCreditNoteData, req.user);

            //create project activity
            if (req.body.billing_info.project_id) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.credit_note_id,
                    documentName,
                    req.body.credit_note_document_id,
                    documentCategory,
                    "รออนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        }
    } catch (error) {
        console.trace(error);
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

    if (req.body.credit_note_template_remark_id === undefined || req.body.credit_note_template_remark_id === "") {
        req.body.credit_note_template_remark_id = null;
    }

    if (req.body.credit_note_remark === undefined || req.body.credit_note_remark === "") {
        req.body.credit_note_remark = null;
    }

    try {
        req.body.credit_note_status = "approved";

        if (req.body.credit_note_id === undefined) {
            const newCreditNoteData = new creditNoteModel(req.body);
            const genCNDocumentId = await genDocumentId("CN", "credit_note");
            newCreditNoteData.credit_note_document_id = genCNDocumentId.document_id;
            newCreditNoteData.credit_note_approveby = req.user.employee_id;
            newCreditNoteData.credit_note_approveby_employee = JSON.stringify(req.user);

            const result = await creditNoteModel.create(newCreditNoteData, req.user);

            result.documentId = genCNDocumentId.document_id;

            const salesReturnResult = await salesReturnModel.getByDocumentId(req.body.sales_return_document_id);

            if (salesReturnResult && salesReturnResult.sales_return_status !== 'closed') {
                await salesReturnModel.update(salesReturnResult.sales_return_id, { sales_return_status: "closed" }, req.user);
            }

            if (req.body.billing_info.project_id) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genCNDocumentId.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genCNDocumentId.document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            const newAccountJournalData = new AccountJournal(
                {
                    "account_journal_ref_document_id": genCNDocumentId.document_id,
                    "account_journal_ref_type": documentName,
                    "transactions": [
                        {
                            "account_transaction_type": "debit",
                            "account_id": accountConfig.sales,
                            "amount" : newCreditNoteData.total_amount,
                        },
                        {
                            "account_transaction_type": "credit",
                            "account_id": accountConfig.accounts_receivable,
                            "amount" : newCreditNoteData.total_amount,
                        }
                    ]
                }
            );

            await accountJournalController.internalCreateAccountJournal(newAccountJournalData, req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newCreditNoteData = new creditNoteModel(req.body);
            newCreditNoteData.credit_note_approveby = req.user.employee_id;
            newCreditNoteData.credit_note_approveby_employee = JSON.stringify(req.user);

            const result = await creditNoteModel.update(req.body.credit_note_id, newCreditNoteData, req.user);

            const salesReturnResult = await salesReturnModel.getByDocumentId(req.body.sales_return_document_id);

            if (salesReturnResult && salesReturnResult.sales_return_status !== 'closed') {
                await salesReturnModel.update(salesReturnResult.sales_return_id, { sales_return_status: "closed" }, req.user);
            }

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

            const newAccountJournalData = new AccountJournal(
                {
                    "account_journal_ref_document_id": req.body.credit_note_document_id,
                    "account_journal_ref_type": documentName,
                    "transactions": [
                        {
                            "account_transaction_type": "debit",
                            "account_id": accountConfig.sales,
                            "amount" : newCreditNoteData.total_amount,
                        },
                        {
                            "account_transaction_type": "credit",
                            "account_id": accountConfig.accounts_receivable,
                            "amount" : newCreditNoteData.total_amount,
                        }
                    ]
                }
            );

            await accountJournalController.internalCreateAccountJournal(newAccountJournalData, req.user);


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
exports.notApprove = async (req, res) => {
    try {
        const result = await creditNoteModel.updateByDocumentId(
            req.params.document_id,
            { credit_note_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null },
            req.user
        );

        const creditNoteResult = await creditNoteModel.getByDocumentId(req.params.document_id);

        //create project activity
        if (creditNoteResult.billing_info.project_id) {
            await addDocumentActivity(
                creditNoteResult.billing_info.project_id,
                creditNoteResult.sales_invoice_id,
                documentName,
                creditNoteResult.sales_invoice_document_id,
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
        const creditNoteResult = await creditNoteModel.getByDocumentId(req.params.document_id);
        if (creditNoteResult !== undefined) {
            let result = {
                billing_info: creditNoteResult.billing_info,
                credit_note_reason: creditNoteResult.credit_note_reason,
                credit_note_data: creditNoteResult.credit_note_data,
                credit_note_template_remark_id: creditNoteResult.credit_note_template_remark_id,
                credit_note_remark: creditNoteResult.credit_note_remark,
                shipping_cost: creditNoteResult.shipping_cost,
                additional_discount: creditNoteResult.additional_discount,
                vat_exempted_amount: creditNoteResult.vat_exempted_amount,
                vat_0_amount: creditNoteResult.vat_0_amount,
                vat_7_amount: creditNoteResult.vat_7_amount,
                vat_amount: creditNoteResult.vat_amount,
                net_amount: creditNoteResult.net_amount,
                withholding_tax: creditNoteResult.withholding_tax,
                total_amount: creditNoteResult.total_amount
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
exports.updatePayment = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        /**
         * if has sales invoice reference then set status of this credit_note to closed
         */
        if (req.body.sales_invoice_document_id && req.body.sales_invoice_document_id !== null) {
            let data = {
                credit_note_status: "closed",
                sales_invoice_document_id: req.body.sales_invoice_document_id,
                credit_note_info: req.body.credit_note_info,
                credit_note_type: req.body.credit_note_type
            };

            const result = await creditNoteModel.updateByDocumentId(req.params.document_id, data, req.user);

           

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.credit_note_id,
                    documentName,
                    req.body.credit_note_document_id,
                    documentCategory,
                    "ปิดใบลดหนี้",
                    req.user);
            }

            const creditNote = await creditNoteModel.getByDocumentId(req.params.document_id);

            if (creditNote) {
                const newAccountJournalData = new AccountJournal(
                    {
                        "account_journal_ref_document_id": req.params.document_id,
                        "account_journal_ref_type": ActivityRefTypeEnum.SALES_INVOICE,
                        "transactions": [
                            {
                                "account_transaction_type": "debit",
                                "account_id": accountConfig.accounts_receivable,
                                "amount" : creditNote.total_amount,
                            },
                            {
                                "account_transaction_type": "credit",
                                "account_id": accountConfig.sales,
                                "amount" : creditNote.total_amount,
                            }
                        ]
                    }
                );
                await accountJournalController.internalUpdateAccountJournal(req.params.document_id, newAccountJournalData, req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {

            /**
             * if paid by check aka no payment channel
             * 
             */
            if (
                (req.body.credit_note_info.payment_channel_id === undefined || req.body.credit_note_info.payment_channel_id === null)
                && req.body.credit_note_info.payment_channel_type !== "check") {
                const newPaymentChannelData = new paymentChannelModel(req.body.credit_note_info);
                const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
                req.body.credit_note_info.payment_channel_id = paymentChannelResult.insertId;
            }
            let data = {
                credit_note_status: "closed",
                credit_note_type: req.body.credit_note_type,
                credit_note_info: req.body.credit_note_info
            };

            const result = await creditNoteModel.updateByDocumentId(req.params.document_id, data, req.user);

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.credit_note_id,
                    documentName,
                    req.body.credit_note_document_id,
                    documentCategory,
                    "ปิดใบลดหนี้",
                    req.user);
            }

            const creditNote = await creditNoteModel.getByDocumentId(req.params.document_id);

            if (creditNote) {
                const newAccountJournalData = new AccountJournal(
                    {
                        "account_journal_ref_document_id": req.params.document_id,
                        "account_journal_ref_type": ActivityRefTypeEnum.SALES_INVOICE,
                        "transactions": [
                            {
                                "account_transaction_type": "debit",
                                "account_id": accountConfig.accounts_receivable,
                                "amount" : creditNote.total_amount,
                            },
                            {
                                "account_transaction_type": "credit",
                                "account_id": accountConfig.sales,
                                "amount" : creditNote.total_amount,
                            }
                        ]
                    }
                );
                await accountJournalController.internalUpdateAccountJournal(req.params.document_id, newAccountJournalData, req.user);
            }

            return res.send({
                status: "succes",
                data: result
            });
        }
    } catch (error) {
        console.trace(error);
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const creditNoteResult = await creditNoteModel.getByDocumentId(req.params.document_id);

        if (creditNoteResult !== undefined) {
            creditNoteResult.credit_note_issue_date = moment(creditNoteResult.credit_note_issue_date).format("DD/MM/YYYY");
            const pdf_name = `${creditNoteResult.credit_note_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                creditNoteTemplate(creditNoteResult),
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
exports.delete = async (req, res) => {

    const mysql = await db.getConnection();

    await mysql.beginTransaction();

    try {
        const creditNoteResult = await creditNoteModel.getByDocumentId(req.params.document_id);
        if (creditNoteResult !== undefined) {

            if (creditNoteResult.sales_invoice_document_id !== null) {
                const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(creditNoteResult.sales_invoice_document_id);

                if (salesInvoiceResult.sales_invoice_status === "payment_complete") {
                    await salesInvoiceModel.updateByDocumentId(creditNoteResult.sales_invoice_document_id, { sales_invoice_status: "wait_payment" }, req.user);
                }
            }

            const salesReturnResult = await salesReturnModel.getByDocumentId(creditNoteResult.sales_return_document_id);

            if (salesReturnResult && salesReturnResult.sales_return_status === "closed") {
                await salesReturnModel.update(salesReturnResult.sales_return_id, { sales_return_status: "approved" }, req.user);
            }

            const result = await creditNoteModel.updateByDocumentId(req.params.document_id, { credit_note_status: "cancelled" }, req.user);

            if (creditNoteResult && creditNoteResult.billing_info.project_id) {
                await addDocumentActivity(
                    creditNoteResult.billing_info.project_id,
                    creditNoteResult.credit_note_id,
                    documentName,
                    creditNoteResult.credit_note_document_id,
                    documentCategory,
                    "ยกเลิก",
                    req.user);
            }

            await mysql.commit();
            await mysql.release();
            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }

    } catch (error) {

        console.log("Rollback successful");
        console.dir(error, { depth: null });

        await mysql.rollback();
        await mysql.release();

        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};