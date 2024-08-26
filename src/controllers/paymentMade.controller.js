const moment = require("moment");
const db = require("../utils/database");
const fs = require("fs");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const paymentMadeModel = require("../models/paymentMade.model");
const paymentChannelModel = require("../models/paymentChannel.model");
const paymentChannelController = require("../controllers/paymentChannel.controller");
const combinedPaymentModel = require("../models/combinedPayment.model");
const purchaseInvoiceModel = require("../models/purchaseInvoice.model");
const expensesModel = require("../models/expenses.model");
const attachmentModel = require("../models/attachment.model");

const { genDocumentId } = require("../utils/generate");

const paymentMadeTemplate = require("../templates/paymentMade");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.PAYMENT_MADE;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await paymentMadeModel.getAll();

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
exports.getByDocumentId = async (req, res) => {
    try {
        const result = await paymentMadeModel.getByDocumentId(req.params.document_id);

        result.attachment_list = await attachmentModel.getByRefId(result.payment_made_id, "payment_made");
        result.attachment_remark = result.attachment_list.length !== 0 ? result.attachment_list[0].attachment_remark : null;

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

    if (req.body.payment_channel_id === undefined || req.body.payment_channel_id === "") {
        req.body.payment_channel_id = null;
    }

    if (req.body.check_info === undefined || req.body.check_info === "") {
        req.body.check_info = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }
    /** check if payment_made_template_remark_id is not included in payload 
     *  or doesn't include any text just in case */
    if (!req.body.payment_made_template_remark_id || req.body.payment_made_template_remark_id === "") {
        req.body.payment_made_template_remark_id = null;
    }
    if (!req.body.payment_made_remark || req.body.payment_made_remark === "") {
        req.body.payment_made_remark = null;
    }

    if (!req.body.withholding_tax) {
        req.body.withholding_tax = null;
    }

    try {

        if (req.body.payment_channel_id === null && req.body.payment_channel_type !== "check") {
            const newPaymentChannelData = new paymentChannelModel(req.body);
            const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
            req.body.payment_channel_id = paymentChannelResult.insertId;
        }

        const newPaymentMadeData = new paymentMadeModel(req.body);
        const genPMDocumentId = await genDocumentId("PM", "payment_made");
        newPaymentMadeData.payment_made_document_id = genPMDocumentId.document_id;
        newPaymentMadeData.payment_made_status = "draft";
        newPaymentMadeData.withholding_tax = JSON.stringify(newPaymentMadeData.withholding_tax);
        const result = await paymentMadeModel.create(newPaymentMadeData, req.user);

        //add documentId to result data
        result.documentId = genPMDocumentId.document_id;

        //create attachment
        for (let attachment of req.body.attachment_list) {
            const newAttachmentData = new attachmentModel(attachment);
            newAttachmentData.attachment_type = "payment_made";
            newAttachmentData.ref_id = result.insertId;
            newAttachmentData.attachment_remark = req.body.attachment_remark;

            await attachmentModel.create(newAttachmentData, req.user);
        }

        await addDocumentActivity(
            null,
            result.insertId,
            documentName,
            genPMDocumentId.document_id,
            documentCategory,
            "สร้าง",
            req.user);

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

    if (req.body.payment_channel_id === undefined || req.body.payment_channel_id === "") {
        req.body.payment_channel_id = null;
    }

    if (req.body.check_info === undefined || req.body.check_info === "") {
        req.body.check_info = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }
    /** check if payment_made_template_remark_id is not included in payload 
      * or doesn't include any text just in case */
    if (!req.body.payment_made_template_remark_id || req.body.payment_made_template_remark_id === "") {
        req.body.payment_made_template_remark_id = null;
    }
    if (!req.body.payment_made_remark || req.body.payment_made_remark === "") {
        req.body.payment_made_remark = null;
    }

    if (!req.body.withholding_tax) {
        req.body.withholding_tax = null;
    }

    try {
        if (req.body.payment_made_status === undefined || req.body.payment_made_status === null || req.body.payment_made_status === "") {
            throw new Error(`payment_made_status is not value`);
        }

        if (req.body.payment_channel_id === null && req.body.payment_channel_type !== "check") {
            const newPaymentChannelData = new paymentChannelModel(req.body);
            const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
            req.body.payment_channel_id = paymentChannelResult.insertId;
        }

        const newPaymentMadeData = new paymentMadeModel(req.body);
        newPaymentMadeData.vendor_info = JSON.stringify(newPaymentMadeData.vendor_info);
        newPaymentMadeData.payment_made_data = JSON.stringify(newPaymentMadeData.payment_made_data);
        newPaymentMadeData.withholding_tax = JSON.stringify(newPaymentMadeData.withholding_tax);

        if (req.body.payment_made_approveby !== null && req.body.payment_made_approveby !== undefined) {
            newPaymentMadeData.payment_made_approveby = req.body.payment_made_approveby;
        }
        if (req.body.payment_made_approveby_employee !== null && req.body.payment_made_approveby_employee !== undefined) {
            newPaymentMadeData.payment_made_approveby_employee = JSON.stringify(req.body.payment_made_approveby_employee);
        }

        const result = await paymentMadeModel.updateByDocumentId(req.params.document_id, newPaymentMadeData, req.user);

        //get attachment of this payment receipt
        let oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_made_id, "payment_made");

        if (oldAttachmentList.length !== 0) {
            if (oldAttachmentList[0].attachment_remark !== req.body.attachment_remark) {
                await attachmentModel.updateAllRemarkByAttachmentTypeAndRefId("payment_made", req.body.payment_made_id, req.body.attachment_remark);
                oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_made_id, "payment_made");
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
            newAttachmentData.attachment_type = "payment_made";
            newAttachmentData.ref_id = req.body.payment_made_id;
            newAttachmentData.attachment_remark = req.body.attachment_remark;

            await attachmentModel.create(newAttachmentData, req.user);
        }

        await addDocumentActivity(
            null,
            req.body.payment_made_id,
            documentName,
            req.body.payment_made_document_id,
            documentCategory,
            "แก้ไข",
            req.user);

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

    if (req.body.payment_channel_id === undefined || req.body.payment_channel_id === "") {
        req.body.payment_channel_id = null;
    }

    if (req.body.check_info === undefined || req.body.check_info === "") {
        req.body.check_info = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    /** check if payment_made_template_remark_id is not included in payload 
     * or doesn't include any text just in case 
     */
    if (!req.body.payment_made_template_remark_id || req.body.payment_made_template_remark_id === "") {
        req.body.payment_made_template_remark_id = null;
    }
    if (!req.body.payment_made_remark || req.body.payment_made_remark === "") {
        req.body.payment_made_remark = null;
    }

    if (!req.body.withholding_tax) {
        req.body.withholding_tax = null;
    }

    try {
        let result;

        req.body.payment_made_status = 'payment_complete';

        if (req.body.payment_channel_id === null && req.body.payment_channel_type !== "check") {
            const newPaymentChannelData = new paymentChannelModel(req.body);
            const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
            req.body.payment_channel_id = paymentChannelResult.insertId;
        }

        if (req.body.payment_made_id === undefined) {
            const newPaymentMadeData = new paymentMadeModel(req.body);
            const genPMDocumentId = await genDocumentId("PM", "payment_made");
            newPaymentMadeData.payment_made_document_id = genPMDocumentId.document_id;
            newPaymentMadeData.payment_made_approveby = req.user.employee_id;
            newPaymentMadeData.payment_made_approveby_employee = JSON.stringify(req.user);
            newPaymentMadeData.withholding_tax = JSON.stringify(newPaymentMadeData.withholding_tax);

            result = await paymentMadeModel.create(newPaymentMadeData, req.user);

            //add documentId to result data
            result.documentId = genPMDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPMDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPMDocumentId.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);
            //create attachment
            for (let attachment of req.body.attachment_list) {
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "payment_made";
                newAttachmentData.ref_id = result.insertId;
                newAttachmentData.attachment_remark = req.body.attachment_remark;

                await attachmentModel.create(newAttachmentData, req.user);
            }
        }

        if (req.body.payment_made_id !== undefined) {
            const newPaymentMadeData = new paymentMadeModel(req.body);
            newPaymentMadeData.vendor_info = JSON.stringify(newPaymentMadeData.vendor_info);
            newPaymentMadeData.payment_made_data = JSON.stringify(newPaymentMadeData.payment_made_data);
            newPaymentMadeData.payment_made_approveby = req.user.employee_id;
            newPaymentMadeData.payment_made_approveby_employee = JSON.stringify(req.user);
            newPaymentMadeData.withholding_tax = JSON.stringify(newPaymentMadeData.withholding_tax);

            result = await paymentMadeModel.update(req.body.payment_made_id, newPaymentMadeData, req.user);

            result.documentId = req.body.payment_made_document_id;

            await addDocumentActivity(
                null,
                req.body.payment_made_id,
                documentName,
                req.body.payment_made_document_id,
                documentCategory,
                "อนุมัติ",
                req.user);
            //get attachment of this payment receipt
            let oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_made_id, "payment_made");

            if (oldAttachmentList.length !== 0) {
                if (oldAttachmentList[0].attachment_remark !== req.body.attachment_remark) {
                    await attachmentModel.updateAllRemarkByAttachmentTypeAndRefId("payment_made", req.body.payment_made_id, req.body.attachment_remark);
                    oldAttachmentList = await attachmentModel.getByRefId(req.body.payment_made_id, "payment_made");
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
                newAttachmentData.attachment_type = "payment_made";
                newAttachmentData.ref_id = req.body.payment_made_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;

                await attachmentModel.create(newAttachmentData, req.user);
            }

        }


        const paymentMadeResult = await paymentMadeModel.getByDocumentId(result.documentId);
        result.ref_document_id = paymentMadeResult.ref_document_id;
        if (paymentMadeResult.ref_type === "purchase_invoice") {
            const allPaymentMadeOfPaymentInvoice = await paymentMadeModel.getByRefTypeAndRefDocumentId("purchase_invoice", result.ref_document_id);
            const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(paymentMadeResult.ref_document_id);

            /**
             * calculate total paid amount of all payment_made related 
             */
            let paidAmount = 0;
            for (let paymentMade of allPaymentMadeOfPaymentInvoice) {
                paidAmount = paidAmount + paymentMade.total_amount;
            }
            /**
             * if paid amount ___NOT___ enough to pay the total price -> set status to partial payment
             */
            if (paidAmount < purchaseInvoiceResult.total_amount) {
                await purchaseInvoiceModel.update(
                    purchaseInvoiceResult.purchase_invoice_id,
                    { purchase_invoice_status: "partial_payment" },
                    req.user);
            }
            if (paidAmount >= purchaseInvoiceResult.total_amount) {
                await purchaseInvoiceModel.update(
                    purchaseInvoiceResult.purchase_invoice_id,
                    { purchase_invoice_status: "payment_complete" },
                    req.user);
            }

        } else if (paymentMadeResult.ref_type === "combined_payment") {
            //query combined payment data
            const combinedPaymentResult = await combinedPaymentModel.getByDocumentId(paymentMadeResult.ref_document_id);

            //update combined payment status to payment_complete
            await combinedPaymentModel.update(combinedPaymentResult.combined_payment_id, { combined_payment_status: "payment_complete" }, req.user);

            //loop check purchase invoice that amount_to_ptay = billing_amount. it will change status to "payment_complete"
            // let piCompleteList = await combinedPaymentResult.document_list.filter((document) => document.total_amount === document.billing_amount);

            //update purchase invoice to status "payment_complete"
            for (let piDocument of combinedPaymentResult.document_list) {
                let purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(piDocument.document_id);

                await purchaseInvoiceModel.update(purchaseInvoiceResult.purchase_invoice_id, { purchase_invoice_status: "payment_complete" }, req.user);
            }
        } else if (paymentMadeResult.ref_type === "expenses") {
            //query expenses data
            const expensesResult = await expensesModel.getByDocumentId(paymentMadeResult.ref_document_id);

            //update expenses status to payment_complete
            await expensesModel.update(expensesResult.expenses_id, { expenses_status: "payment_complete" }, req.user);
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
exports.copyDocument = async (req, res) => {
    try {
        const paymentMadeResult = await paymentMadeModel.getByDocumentId(req.params.document_id);

        if (paymentMadeResult !== undefined) {
            let result = {
                ref_type: paymentMadeResult.ref_type,
                ref_document_id: paymentMadeResult.ref_document_id,
                external_ref_document_id: paymentMadeResult.external_ref_document_id,
                vendor_info: paymentMadeResult.vendor_info,
                payment_channel_id: paymentMadeResult.payment_channel_id,
                check_info: paymentMadeResult.check_info,
                payment_made_data: paymentMadeResult.payment_made_data,
                total_amount: paymentMadeResult.total_amount,
                payment_made_template_remark_id: paymentMadeResult.payment_made_template_remark_id,
                payment_made_remark: paymentMadeResult.payment_made_remark,
                withholding_tax: paymentMadeResult.withholding_tax
            };

            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }
    } catch (error) {
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const paymentMadeResult = await paymentMadeModel.getByDocumentId(req.params.document_id);

        if (paymentMadeResult !== undefined) {
            paymentMadeResult.payment_made_issue_date = moment(paymentMadeResult.payment_made_issue_date).format("DD/MM/YYYY");
            paymentMadeResult.payment_made_due_date = moment(paymentMadeResult.payment_made_due_date).format("DD/MM/YYYY");

            const pdf_name = `${paymentMadeResult.payment_made_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                paymentMadeTemplate(paymentMadeResult),
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
        const paymentMadeResult = await paymentMadeModel.getByDocumentId(req.params.document_id);

        if (paymentMadeResult !== undefined) {
            //if payment made status is payment complete sdf
            if (paymentMadeResult.payment_made_status === "payment_complete") {
                //change status of purchase invoice
                if (paymentMadeResult.ref_type === "purchase_invoice") {
                    const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(paymentMadeResult.ref_document_id);

                    //if purchase invoice status = payment_complete will change status to wait_payment.
                    if (purchaseInvoiceResult.purchase_invoice_status === "payment_complete" && paymentMadeResult.payment_made_status === "payment_complete") {
                        await purchaseInvoiceModel.update(purchaseInvoiceResult.purchase_invoice_id, { purchase_invoice_status: "wait_payment" }, req.user);
                    }
                }
                //change status of combined payment
                if (paymentMadeResult.ref_type === "combined_payment") {

                    const combinedPaymentResult = await combinedPaymentModel.getByDocumentId(paymentMadeResult.ref_document_id);

                    //loop change status purchase invoice on combined payment to status = wait_payment
                    for (let purchaseInvoice of combinedPaymentResult.document_list) {
                        let purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(purchaseInvoice.document_id);

                        //if purchase invoice status = payment_complete will change it.
                        if (purchaseInvoiceResult.purchase_invoice_status === "payment_complete" && paymentMadeResult.payment_made_status === "payment_complete") {
                            await purchaseInvoiceModel.update(purchaseInvoiceResult.purchase_invoice_id, { purchase_invoice_status: "wait_payment" }, req.user);
                        }
                    }

                    //change status combined payment = wait_payment
                    await combinedPaymentModel.update(combinedPaymentResult.combined_payment_id, { combined_payment_status: "wait_payment" }, req.user);
                }
                //change status of expenses
                if (paymentMadeResult.ref_type === "expenses") {
                    const expensesResult = await expensesModel.getByDocumentId(paymentMadeResult.ref_document_id);

                    //if expenses status = payment_complete will change status to wait_payment
                    if (expensesResult.expenses_status === "payment_complete" && paymentMadeResult.payment_made_status === "payment_complete") {
                        await expensesModel.update(expensesResult.expenses_id, { expenses_status: "wait_payment" }, req.user);
                    }
                }
                //void payment made document
                const result = await paymentMadeModel.updateByDocumentId(req.params.document_id, { payment_made_status: "cancelled" }, req.user);

                if (paymentMadeResult) {
                    await addDocumentActivity(
                        null,
                        paymentMadeResult.payment_made_id,
                        documentName,
                        paymentMadeResult.payment_made_document_id,
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
            }

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