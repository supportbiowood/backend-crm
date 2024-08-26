const moment = require("moment");
const db = require("../utils/database");
const fs = require("fs");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const runningDocumentIdModel = require("../models/runningDocumentId.model");
const paymentReceiptModel = require("../models/paymentReceipt.model");
const paymentChannelModel = require("../models/paymentChannel.model");
const paymentChannelController = require("../controllers/paymentChannel.controller");
const salesInvoiceModel = require("../models/salesInvoice.model");
const billingNoteModel = require("../models/billingNote.model");
const quotationModel = require("../models/quotation.model");
const depositInvoiceModel = require("../models/depositInvoice.model");
const salesOrderModel = require("../models/salesOrder.model");
const attachmentModel = require("../models/attachment.model");

const calculate = require("../utils/calculate");
const { genDocumentId } = require("../utils/generate");

const paymentReceiptTemplate = require("../templates/paymentReceipt");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const AccountJournal = require("../models/accountJournal.model");
const accountJournalController = require('../controllers/accountJournal.controller');
const { accountConfig } = require('../configs/accountConfig');

const documentName = ActivityRefTypeEnum.PAYMENT_RECEIPT;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await paymentReceiptModel.getAll();

        for (let paymentReceipt of result) {
            if (paymentReceipt.payment_channel_id !== null) {
                let paymentChannelResult = await paymentChannelModel.getById(
                    paymentReceipt.payment_channel_id
                );
                paymentReceipt.payment_channel_type =
                    paymentChannelResult.payment_channel_type;
                paymentReceipt.payment_channel_info =
                    paymentChannelResult.payment_channel_info;
            } else {
                paymentReceipt.payment_channel_type = "check";
                paymentReceipt.payment_channel_info = null;
            }
        }

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
        const result = await paymentReceiptModel.getByDocumentId(req.params.document_id);
        let newAmountToPay;
        if (result.ref_type === "sales_invoice") {
            newAmountToPay = await calculate.amountToPayOfSalesAccount(result.ref_document_id);
        }
        if (
            result.ref_type === "sales_invoice" &&
            result.payment_receipt_status !== "payment_complete"
        ) {
            for (let document of result.payment_receipt_data) {
                if (document.amount_to_pay !== newAmountToPay) {
                    document.amount_to_pay = newAmountToPay;
                }
            }
        }

        if (result.payment_channel_id !== null) {
            let paymentChannelResult = await paymentChannelModel.getById(
                result.payment_channel_id
            );
            result.payment_channel_type = paymentChannelResult.payment_channel_type;
            result.payment_channel_info = paymentChannelResult.payment_channel_info;
        } else {
            result.payment_channel_type = "check";
            result.payment_channel_info = null;
        }

        if (result.ref_type === "deposit_invoice") {
            const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(result.ref_document_id);
            // const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(depositInvoiceResult.sales_invoice_document_id);
            result.deposit_invoice = depositInvoiceResult || null;
        }

        result.attachment_list = await attachmentModel.getByRefId(result.payment_receipt_id, "payment_receipt");
        result.attachment_remark = result.attachment_list.length !== 0 ? result.attachment_list[0].attachment_remark : null;

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
        req.body.payment_channel_id === undefined ||
        req.body.payment_channel_id === ""
    ) {
        req.body.payment_channel_id = null;
    }

    if (req.body.check_info === undefined || req.body.check_info === "") {
        req.body.check_info = null;
    }

    /** check if payment_receipt_remark not included in payload just in case */
    if (!req.body.payment_receipt_template_remark_id || req.body.payment_receipt_template_remark_id === "") {
        req.body.payment_receipt_template_remark_id = null;
    }
    if (!req.body.payment_receipt_remark || req.body.payment_receipt_remark === "") {
        req.body.payment_receipt_remark = null;
    }
    if (!req.body.withholding_tax) {
        req.body.withholding_tax = null;
    }
    try {
        if (
            req.body.payment_channel_id === null &&
            req.body.payment_channel_type !== "check"
        ) {
            const newPaymentChannelData = new paymentChannelModel(req.body);
            const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
            req.body.payment_channel_id = paymentChannelResult.insertId;
        }
        req.body.withholding_tax = JSON.stringify(req.body.withholding_tax);
        const newPaymentReceiptData = new paymentReceiptModel(req.body);
        const genPaymentDocumentIdResult = await genDocumentId("RT", "receipt");
        newPaymentReceiptData.payment_receipt_document_id = genPaymentDocumentIdResult.document_id;
        newPaymentReceiptData.payment_receipt_status = "draft";
        newPaymentReceiptData.payment_receipt_stage = "invoice";

        const result = await paymentReceiptModel.create(newPaymentReceiptData, req.user);

        //add documentId to result data
        result.documentId = genPaymentDocumentIdResult.document_id;

        //prepare data of project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                genPaymentDocumentIdResult.document_id,
                documentCategory,
                "สร้าง",
                req.user);
        }

        //create attachment
        for (let attachment of req.body.attachment_list) {
            const newAttachmentData = new attachmentModel(attachment);
            newAttachmentData.attachment_type = "payment_receipt";
            newAttachmentData.ref_id = result.insertId;
            newAttachmentData.attachment_remark = req.body.attachment_remark;

            await attachmentModel.create(newAttachmentData, req.user);
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
        req.body.payment_channel_id === undefined ||
        req.body.payment_channel_id === ""
    ) {
        req.body.payment_channel_id = null;
    }

    if (req.body.check_info === undefined || req.body.check_info === "") {
        req.body.check_info = null;
    }

    if (!req.body.withholding_tax) {
        req.body.withholding_tax = null;
    }

    /** check if payment_receipt_remark not included in payload just in case */
    if (!req.body.payment_receipt_template_remark_id || req.body.payment_receipt_template_remark_id === "") {
        req.body.payment_receipt_template_remark_id = null;
    }
    if (!req.body.payment_receipt_remark || req.body.payment_receipt_remark === "") {
        req.body.payment_receipt_remark = null;
    }

    try {
        if (req.body.payment_receipt_status === undefined || req.body.payment_receipt_status === null || req.body.payment_receipt_status === "") {
            throw new Error(`payment_receipt_status is not value`);
        }

        if (req.body.payment_channel_id === null && req.body.payment_channel_type !== "check") {
            const newPaymentChannelData = new paymentChannelModel(req.body);
            const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
            req.body.payment_channel_id = paymentChannelResult.insertId;
        }

        const newPaymentReceiptData = new paymentReceiptModel(req.body);
        newPaymentReceiptData.billing_info = JSON.stringify(newPaymentReceiptData.billing_info);
        newPaymentReceiptData.payment_receipt_data = JSON.stringify(newPaymentReceiptData.payment_receipt_data);
        newPaymentReceiptData.withholding_tax = JSON.stringify(newPaymentReceiptData.withholding_tax);

        if (newPaymentReceiptData.check_info !== null) {
            newPaymentReceiptData.check_info = JSON.stringify(newPaymentReceiptData.check_info);
        }

        if (req.body.payment_receipt_approveby !== null && req.body.payment_receipt_approveby !== undefined) {
            newPaymentReceiptData.payment_receipt_approveby = req.body.payment_receipt_approveby;
        }
        if (req.body.payment_receipt_approveby_employee !== null && req.body.payment_receipt_approveby_employee !== undefined) {
            newPaymentReceiptData.payment_receipt_approveby_employee = JSON.stringify(req.body.payment_receipt_approveby_employee);
        }

        const result = await paymentReceiptModel.updateByDocumentId(req.params.document_id, newPaymentReceiptData, req.user);


        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.payment_receipt_id,
                documentName,
                req.body.payment_receipt_document_id,
                documentCategory,
                "แก้ไข",
                req.user);
        }

        //get attachment of this payment receipt
        let oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_receipt_id, "payment_receipt");

        if (oldAttachmentList.length !== 0) {
            if (oldAttachmentList[0].attachment_remark !== req.body.attachment_remark) {
                await attachmentModel.updateAllRemarkByAttachmentTypeAndRefId("payment_receipt", req.body.payment_receipt_id, req.body.attachment_remark);
                oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_receipt_id, "payment_receipt");
            }
        }

        let deleteAttachmentList = [];
        //loop get delete_attachment_list
        for (let oldAttachment of oldAttachmentList) {
            let hasAttachment = false;
            for (let attachmentReq of req.body.attachment_list) {
                if (oldAttachment.attachment_id === attachmentReq.attachment_id) {
                    hasAttachment = true;
                    break;
                }
            }
            if (!hasAttachment) {
                deleteAttachmentList.push(oldAttachment);
            }
        }

        //delete attachment don't have in req.body.attachment_list
        for (let attachment of deleteAttachmentList) {
            await attachmentModel.delete(attachment.attachment_id);
        }

        let newAttachmentList = req.body.attachment_list.filter((attachment) => attachment.attachment_id === undefined);

        //create attachment
        for (let attachment of newAttachmentList) {
            const newAttachmentData = new attachmentModel(attachment);
            newAttachmentData.attachment_type = "payment_receipt";
            newAttachmentData.ref_id = req.body.payment_receipt_id;
            newAttachmentData.attachment_remark = req.body.attachment_remark;

            await attachmentModel.create(newAttachmentData, req.user);
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

exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    const mysql = await db.getConnection();
    await mysql.beginTransaction();

    try {

        let result = {};

        req.body.payment_receipt_status = "payment_complete";
        /** check if payment_receipt_remark not included in payload just in case */
        if (!req.body.payment_receipt_template_remark_id || req.body.payment_receipt_template_remark_id === "") {
            req.body.payment_receipt_template_remark_id = null;
        }
        if (!req.body.payment_receipt_remark || req.body.payment_receipt_remark === "") {
            req.body.payment_receipt_remark = null;
        }
        // create new payment channel if customer doesn't have any channel
        if (req.body.payment_channel_id === null && req.body.payment_channel_type !== "check") {
            const newPaymentChannelData = new paymentChannelModel(req.body);
            const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
            req.body.payment_channel_id = paymentChannelResult.insertId;
        }
        if (!req.body.withholding_tax) {
            req.body.withholding_tax = null;
        }

        const paymentChannel = await paymentReceiptModel.getById(req.body.payment_channel_id);
        /**
         * create payment receipt if it's a new payment
         */
        if (req.body.payment_receipt_id === undefined) {
            const newPaymentReceiptData = new paymentReceiptModel(req.body);
            const genPaymentDocumentIdResult = await genDocumentId("RT", "receipt");
            newPaymentReceiptData.payment_receipt_document_id = genPaymentDocumentIdResult.document_id;
            newPaymentReceiptData.payment_receipt_stage = "payment";
            newPaymentReceiptData.payment_receipt_approveby = req.user.employee_id;
            newPaymentReceiptData.payment_receipt_approveby_employee = JSON.stringify(req.user);
            newPaymentReceiptData.withholding_tax = JSON.stringify(newPaymentReceiptData.withholding_tax);
            const paymentReceiptResult = await paymentReceiptModel.create(newPaymentReceiptData, req.user);

            //add documentId to result data
            result.documentId = genPaymentDocumentIdResult.document_id;
            result.insertId = paymentReceiptResult.insertId;

            if (paymentChannel.payment_channel_account_id) {
                const newAccountJournalData = new AccountJournal(
                    {
                        "account_journal_ref_document_id": genPaymentDocumentIdResult.document_id,
                        "account_journal_ref_type": documentName,
                        "transactions": [
                            {
                                "account_transaction_type": "debit",
                                "account_id": paymentChannel.payment_channel_account_id,
                                "amount" : newPaymentReceiptData.total_amount,
                            },
                            {
                                "account_transaction_type": "credit",
                                "account_id": accountConfig.accounts_receivable,
                                "amount" : newPaymentReceiptData.total_amount,
                            }
                        ]
                    }
                );
                await accountJournalController.internalCreateAccountJournal(newAccountJournalData, req.user);
            }

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genPaymentDocumentIdResult.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genPaymentDocumentIdResult.document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }
            //create attachment
            for (let attachment of req.body.attachment_list) {
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "payment_receipt";
                newAttachmentData.ref_id = paymentReceiptResult.insertId;
                newAttachmentData.attachment_remark = req.body.attachment_remark;

                await attachmentModel.create(newAttachmentData, req.user);
            }
        }

        if (req.body.payment_receipt_id !== undefined) {
            const newPaymentReceiptData = new paymentReceiptModel(req.body);
            newPaymentReceiptData.payment_receipt_stage = "payment";
            newPaymentReceiptData.billing_info = JSON.stringify(newPaymentReceiptData.billing_info);
            newPaymentReceiptData.payment_receipt_data = JSON.stringify(newPaymentReceiptData.payment_receipt_data);
            newPaymentReceiptData.check_info = newPaymentReceiptData.check_info !== null ? newPaymentReceiptData.check_info = JSON.stringify(newPaymentReceiptData.check_info) : null;
            newPaymentReceiptData.payment_receipt_approveby = req.user.employee_id;
            newPaymentReceiptData.payment_receipt_approveby_employee = JSON.stringify(req.user);
            newPaymentReceiptData.withholding_tax = JSON.stringify(newPaymentReceiptData.withholding_tax);
            await paymentReceiptModel.update(req.body.payment_receipt_id, newPaymentReceiptData, req.user);

            result.documentId = req.body.payment_receipt_document_id;

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.payment_receipt_id,
                    documentName,
                    req.body.payment_receipt_document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            //get attachment of this payment receipt
            let oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_receipt_id, "payment_receipt");

            if (oldAttachmentList.length !== 0) {
                if (oldAttachmentList[0].attachment_remark !== req.body.attachment_remark) {
                    await attachmentModel.updateAllRemarkByAttachmentTypeAndRefId("payment_receipt", req.body.payment_receipt_id, req.body.attachment_remark);
                    oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_receipt_id, "payment_receipt");
                }
            }

            let deleteAttachmentList = [];
            //loop get delete_attachment_list
            for (let oldAttachment of oldAttachmentList) {
                let hasAttachment = false;
                for (let attachmentReq of req.body.attachment_list) {
                    if (oldAttachment.attachment_id === attachmentReq.attachment_id) {
                        hasAttachment = true;
                        break;
                    }
                }
                if (!hasAttachment) {
                    deleteAttachmentList.push(oldAttachment);
                }
            }

            //delete attachment don't have in req.body.attachment_list
            for (let attachment of deleteAttachmentList) {
                await attachmentModel.delete(attachment.attachment_id);
            }

            let newAttachmentList = req.body.attachment_list.filter((attachment) => attachment.attachment_id === undefined);

            //create attachment
            for (let attachment of newAttachmentList) {

                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "payment_receipt";
                newAttachmentData.ref_id = req.body.payment_receipt_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;

                await attachmentModel.create(newAttachmentData, req.user);
            }

            if (paymentChannel.payment_channel_account_id) {
                const newAccountJournalData = new AccountJournal(
                    {
                        "account_journal_ref_document_id": req.body.payment_receipt_document_id,
                        "account_journal_ref_type": documentName,
                        "transactions": [
                            {
                                "account_transaction_type": "debit",
                                "account_id": paymentChannel.payment_channel_account_id,
                                "amount" : newPaymentReceiptData.total_amount,
                            },
                            {
                                "account_transaction_type": "credit",
                                "account_id": accountConfig.accounts_receivable,
                                "amount" : newPaymentReceiptData.total_amount,
                            }
                        ]
                    }
                );

                await accountJournalController.internalCreateAccountJournal(newAccountJournalData, req.user);
            }
        }

        result.ref_document_id = req.body.ref_document_id;

        const paymentReceiptResult = await paymentReceiptModel.getByDocumentId(result.documentId);
        if (paymentReceiptResult.ref_type === ActivityRefTypeEnum.SALES_INVOICE) {

            const allPaymentReceiptOfSaleInvoiceResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("sales_invoice", req.body.ref_document_id);
            const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(paymentReceiptResult.ref_document_id);

            /**
             * calculate all paid amount
             */
            let paidAmount = 0;
            for (let paymentReceipt of allPaymentReceiptOfSaleInvoiceResult) {
                paidAmount = paidAmount + paymentReceipt.total_amount;
            }

            /* if total paid amount __NOT__ enough to pay the sale_invoice -> set status of sale_invoice to partial payment */
            if (paidAmount < salesInvoiceResult.total_amount) {
                await salesInvoiceModel.updateByDocumentId(result.ref_document_id, { sales_invoice_status: "partial_payment", sales_invoice_stage: "payment" }, req.user);
            }
            /* if total paid amount is ____enought____ to pay -> set status of sale_invoice payment complete */
            if (paidAmount >= salesInvoiceResult.total_amount) {
                await salesInvoiceModel.updateByDocumentId(result.ref_document_id, { sales_invoice_status: "payment_complete", sales_invoice_stage: "payment" }, req.user);
                //prepare data of project activity
                if (salesInvoiceResult.billing_info) {
                    await addDocumentActivity(
                        salesInvoiceResult.billing_info.project_id,
                        salesInvoiceResult.sales_invoice_id,
                        ActivityRefTypeEnum.SALES_INVOICE,
                        salesInvoiceResult.sales_invoice_document_id,
                        documentCategory,
                        "ชำระใบแจ้งหนี้แล้ว",
                        req.user);
                }
                await quotationModel.updateByDocumentId(salesInvoiceResult.quotation_document_id, { quotation_stage: "payment" }, req.user);

                const newAccountJournalData = new AccountJournal(
                    {
                        "account_journal_ref_document_id": salesInvoiceResult.sales_invoice_document_id,
                        "account_journal_ref_type": ActivityRefTypeEnum.SALES_INVOICE,
                        "transactions": [
                            {
                                "account_transaction_type": "debit",
                                "account_id": accountConfig.cost_of_good_sold,
                                "amount" : paidAmount,
                            },
                            {
                                "account_transaction_type": "credit",
                                "account_id": accountConfig.inventory_asset,
                                "amount" : paidAmount,
                            }
                        ]
                    }
                );
    
                await accountJournalController.internalUpdateAccountJournal(salesInvoiceResult.sales_invoice_document_id, newAccountJournalData, req.user);
            }

        } else if (paymentReceiptResult.ref_type === ActivityRefTypeEnum.BILLING_NOTE) {
            //query billingNote from database by ref_document_id [billing_note_document_id]
            const billingNoteResult = await billingNoteModel.getByDocumentId(paymentReceiptResult.ref_document_id);

            //update billingNote status from draft to "payment_complete"
            await billingNoteModel.update(billingNoteResult.billing_note_id, { billing_note_status: "payment_complete" }, req.user);

            //  create project activity
            if (billingNoteResult.billing_info) {
                await addDocumentActivity(
                    billingNoteResult.billing_info.project_id,
                    billingNoteResult.sales_invoice_id,
                    ActivityRefTypeEnum.BILLING_NOTE,
                    billingNoteResult.sales_invoice_document_id,
                    documentCategory,
                    "ชำระใบวางบิลแล้ว",
                    req.user);
            }

            //update sales_invoice to status "payment_complete"
            for (let siDocument of billingNoteResult.document_list) {
                let salesInvoiceResult = await salesInvoiceModel.getByDocumentId(siDocument.document_id);

                await salesInvoiceModel.updateByDocumentId(siDocument.document_id, { sales_invoice_status: "payment_complete", sales_invoice_stage: "payment" }, req.user);

                //  create project activity
                if (salesInvoiceResult.billing_info) {
                    await addDocumentActivity(
                        salesInvoiceResult.billing_info.project_id,
                        salesInvoiceResult.sales_invoice_id,
                        ActivityRefTypeEnum.SALES_INVOICE,
                        salesInvoiceResult.sales_invoice_document_id,
                        documentCategory,
                        "ชำระใบแจ้งหนี้แล้ว",
                        req.user);
                }

                await quotationModel.updateByDocumentId(salesInvoiceResult.quotation_document_id, { quotation_stage: "payment" }, req.user);

                const newAccountJournalData = new AccountJournal(
                    {
                        "account_journal_ref_document_id": salesInvoiceResult.sales_invoice_document_id,
                        "account_journal_ref_type": documentName,
                        "transactions": [
                            {
                                "account_transaction_type": "debit",
                                "account_id": accountConfig.cost_of_good_sold,
                                "amount" : salesInvoiceResult.total_amount,
                            },
                            {
                                "account_transaction_type": "credit",
                                "account_id": accountConfig.inventory_asset,
                                "amount" : salesInvoiceResult.total_amount,
                            }
                        ]
                    }
                );
    
                await accountJournalController.internalUpdateAccountJournal(salesInvoiceResult.sales_invoice_document_id, newAccountJournalData, req.user);
            }
        } else if (paymentReceiptResult.ref_type === ActivityRefTypeEnum.DEPOSIT_INVOICE) {
            await depositInvoiceModel.updateByDocumentId(paymentReceiptResult.ref_document_id, { deposit_invoice_status: "payment_complete" }, req.user);

            const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(paymentReceiptResult.ref_document_id);

            //  create project activity
            if (depositInvoiceResult.billing_info) {
                await addDocumentActivity(
                    depositInvoiceResult.billing_info.project_id,
                    depositInvoiceResult.deposit_invoice_id,
                    ActivityRefTypeEnum.SALES_INVOICE,
                    depositInvoiceResult.deposit_invoice_document_id,
                    documentCategory,
                    "ชำระใบแจ้งหนี้มัดจำแล้ว",
                    req.user);
            }
        }
        await mysql.commit();
        await mysql.release();
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        console.trace("approve payment receipt error happen trace -: ", error);

        await mysql.rollback();
        await mysql.release();
        console.log("Rollback successful");
        console.dir(error, { depth: null });

        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.genDocument = async (req, res) => {

    try {
        const paymentReceiptData = await paymentReceiptModel.getByDocumentId(req.params.document_id);

        if (paymentReceiptData !== undefined) {
            paymentReceiptData.issue_date = moment(paymentReceiptData.issue_date).format("DD/MM/YYYY");
            // paymentReceiptData.billing_info.address = paymentReceiptData.billing_info.address === "" ? "-" : paymentReceiptData.billing_info.address;

            const pdf_name = `${paymentReceiptData.payment_receipt_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                paymentReceiptTemplate(paymentReceiptData),
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

exports.copyDocument = async (req, res) => {
    try {
        const paymentReceiptResult = await paymentReceiptModel.getByDocumentId(req.params.document_id);
        if (paymentReceiptResult !== undefined) {
            let result = {
                ref_type: paymentReceiptResult.ref_type,
                billing_info: paymentReceiptResult.billing_info,
                ref_document_id: paymentReceiptResult.ref_document_id,
                payment_channel_id: paymentReceiptResult.payment_channel_id,
                check_info: paymentReceiptResult.check_info,
                payment_receipt_data: paymentReceiptResult.payment_receipt_data,
                total_amount: paymentReceiptResult.total_amount,
                payment_channel_type: paymentReceiptResult.payment_channel_type,
                payment_channel_info: paymentReceiptResult.payment_channel_info,
                payment_receipt_template_remark_id: paymentReceiptResult.payment_receipt_template_remark_id,
                payment_receipt_remark: paymentReceiptResult.payment_receipt_remark,
                withholding_tax: paymentReceiptResult.withholding_tax
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

exports.delete = async (req, res) => {
    const mysql = await db.getConnection();

    await mysql.beginTransaction();

    try {
        //query quotation from database
        const paymentReceiptResult = await paymentReceiptModel.getByDocumentId(req.params.document_id);
        if (paymentReceiptResult !== undefined) {
            const result = await paymentReceiptModel.updateByDocumentId(req.params.document_id, { payment_receipt_status: "cancelled" }, req.user);

            if (paymentReceiptResult.billing_info) {
                await addDocumentActivity(
                    paymentReceiptResult.billing_info.project_id,
                    paymentReceiptResult.payment_receipt_id,
                    documentName,
                    paymentReceiptResult.payment_receipt_document_id,
                    documentCategory,
                    "ยกเลิกใบการชำระเงิน",
                    req.user);
            }

            //check if payment receipt ref type is sales invoice will change sales invoice status
            // from payment_complete to wait_payment
            if (paymentReceiptResult.ref_type === "sales_invoice") {
                const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(paymentReceiptResult.ref_document_id);

                let paymentReceiptListAllResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("sales_invoice", paymentReceiptResult.ref_document_id);
                let paymentReceiptListResult = await paymentReceiptListAllResult.filter((rt) => rt.payment_receipt_status !== "cancelled");
                if (paymentReceiptListResult.length !== 0) {
                    //if sales invoice status is payment complete will change status to wait payment and change stage to invoice
                    if (salesInvoiceResult.sales_invoice_status === "payment_complete" && paymentReceiptResult.payment_receipt_status === "payment_complete") {
                        if (paymentReceiptListAllResult.length > paymentReceiptListResult.length) {
                            await salesInvoiceModel.update(salesInvoiceResult.sales_invoice_id, { sales_invoice_status: "partial_payment", sales_invoice_stage: "invoice" }, req.user);

                        } else {
                            await salesInvoiceModel.update(salesInvoiceResult.sales_invoice_id, { sales_invoice_status: "wait_payment", sales_invoice_stage: "invoice" }, req.user);
                            //if sales invoice have sales order document id will change sales order stage back to invoice
                            if (salesInvoiceResult.sales_order_document_id !== null && salesInvoiceResult.sales_order_document_id !== "") {
                                const salesOrderResult = await salesOrderModel.getByDocumentId(salesInvoiceResult.sales_invoice_document_id);

                                //change sales order stage to invoice
                                await salesOrderModel.update(salesOrderResult.sales_order_id, { sales_order_stage: "invoice" }, req.user);

                                //if sales order have quotation document id will change quotation stage back to invoice
                                if (salesOrderResult.quotation_document_id !== null && salesOrderResult.quotation_document_id !== "") {
                                    const quotationResult = await quotationModel.getByDocumentId(salesOrderResult.sales_order_document_id);

                                    //change quotation stage to invoice
                                    await quotationModel.update(quotationResult.quotation_id, { quotation_stage: "invoice" }, req.user);
                                }
                            }
                        }
                    }
                }
            }

            //check if payment receipt ref type is billing note will change billing note status
            //from payment_complete to wait_complete
            if (paymentReceiptResult.ref_type === "billing_note") {
                const billingNoteResult = await billingNoteModel.getByDocumentId(paymentReceiptResult.ref_document_id);

                let paymentReceiptListResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("billing_note", paymentReceiptResult.ref_document_id);
                paymentReceiptListResult = await paymentReceiptListResult.filter((rt) => rt.payment_receipt_status !== "cancelled");

                if (paymentReceiptListResult.length !== 0) {
                    if (billingNoteResult.billing_note_status === "payment_complete" && paymentReceiptResult.payment_receipt_status === "payment_complete") {
                        await billingNoteModel.update(billingNoteResult.billing_note_id, { billing_note_status: "wait_payment" }, req.user);
                    }
                }
            }

            //check if payment receipt ref type is deposit invoice will change sales invoice status
            // from payment_complete to wait_complete
            if (paymentReceiptResult.ref_type === "deposit_invoice") {
                const depositInvoiceResult = await depositInvoiceModel.getByDocumentId(paymentReceiptResult.ref_document_id);
                let paymentReceiptListResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("deposit_invoice", paymentReceiptResult.ref_document_id);
                paymentReceiptListResult = await paymentReceiptListResult.filter((rt) => rt.payment_receipt_status !== "cancelled");

                if (paymentReceiptListResult.length !== 0) {
                    if ((depositInvoiceResult.deposit_invoice_status === "payment_complete" || depositInvoiceResult.deposit_invoice_status === "closed") && paymentReceiptResult.payment_receipt_status === "payment_complete") {
                        //change deposit invoice status = wait_payment and set sales_invoice_document_id = null
                        await depositInvoiceModel.update(depositInvoiceResult.deposit_invoice_id, { deposit_invoice_status: "wait_payment", sales_invoice_document_id: null }, req.user);

                        if (depositInvoiceResult.deposit_invoice_status === "closed") {
                            const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(depositInvoiceResult.sales_invoice_document_id);

                            if (salesInvoiceResult.sales_invoice_status === "payment_complete") {
                                await salesInvoiceModel.update(salesInvoiceResult.sales_invoice_id, { sales_invoice_status: "wait_payment" }, req.user);
                            }
                        }
                    }
                }
            }

            await mysql.commit();
            await mysql.release();

            return res.send({
                status: "status",
                data: result,
            });
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }
    } catch (error) {
        mysql.rollback();
        console.log("Rollback successful");
        console.dir(error, { depth: null });

        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};