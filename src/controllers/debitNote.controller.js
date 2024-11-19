const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const debitNoteModel = require("../models/debitNote.model");
const paymentChannelModel = require("../models/paymentChannel.model");
const paymentChannelController = require("../controllers/paymentChannel.controller");
const purchaseInvoiceModel = require("../models/purchaseInvoice.model");
const purchaseReturnModel = require("../models/purchaseReturn.model");

const { genDocumentId } = require("../utils/generate");

const debitNoteTemplate = require("../templates/debitNote");

const itemValidation = require("../utils/item");
const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.DEBIT_NOTE;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await debitNoteModel.getAll();

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
        const result = await debitNoteModel.getByDocumentId(req.params.document_id);

        if (result.ref_document_id !== null && result.ref_type === "purchase_invoice") {
            result.purchase_invoice = await purchaseInvoiceModel.getByDocumentId(result.ref_document_id);
        } else {
            result.purchase_invoice = null;

            if (result.payment_channel_id !== null) {
                let paymentChannelResult = await paymentChannelModel.getById(result.payment_channel_id);
                result.payment_channel_type = paymentChannelResult.payment_channel_type;
                result.payment_channel_info = paymentChannelResult.payment_channel_info;
            } else {
                result.payment_channel_type = null;
                result.payment_channel_info = null;
            }
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

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.debit_note_template_remark_id === undefined || req.body.debit_note_template_remark_id === "") {
        req.body.debit_note_template_remark_id = null;
    }

    if (req.body.debit_note_remark === undefined || req.body.debit_note_remark === "") {
        req.body.debit_note_remark = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.debit_note_data);
        const newDebitNoteData = new debitNoteModel(req.body);
        const genDNDocumentId = await genDocumentId("DN", "debit_note");
        newDebitNoteData.debit_note_document_id = genDNDocumentId.document_id;
        newDebitNoteData.debit_note_status = "draft";

        const result = await debitNoteModel.create(newDebitNoteData, req.user);

        //add documentId to result data
        result.documentId = genDNDocumentId.document_id;

        await addDocumentActivity(
            null,
            result.insertId,
            documentName,
            genDNDocumentId.document_id,
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

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.debit_note_template_remark_id === undefined || req.body.debit_note_template_remark_id === "") {
        req.body.debit_note_template_remark_id = null;
    }

    if (req.body.debit_note_remark === undefined || req.body.debit_note_remark === "") {
        req.body.debit_note_remark = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.debit_note_data);
        const newDebitNoteData = new debitNoteModel(req.body);
        newDebitNoteData.vendor_info = JSON.stringify(newDebitNoteData.vendor_info);
        newDebitNoteData.debit_note_data = JSON.stringify(newDebitNoteData.debit_note_data);

        const result = await debitNoteModel.updateByDocumentId(req.params.document_id, newDebitNoteData, req.user);

        await addDocumentActivity(
            null,
            req.body.debit_note_id,
            documentName,
            req.body.combined_payment_document_id,
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
exports.waitApprove = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.debit_note_template_remark_id === undefined || req.body.debit_note_template_remark_id === "") {
        req.body.debit_note_template_remark_id = null;
    }

    if (req.body.debit_note_remark === undefined || req.body.debit_note_remark === "") {
        req.body.debit_note_remark = null;
    }

    if (!req.body.ref_document_id || req.body.ref_document_id === "") {
        req.body.ref_document_id = null;
    }
    if (!req.body.ref_type || req.body.ref_type === "") {
        req.body.ref_type = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.debit_note_data);
        req.body.debit_note_status = "wait_approve";
        
        if (req.body.debit_note_id === undefined) {
            const newDebitNoteData = new debitNoteModel(req.body);
            const genDNDocumentId = await genDocumentId("DN", "debit_note");
            newDebitNoteData.debit_note_document_id = genDNDocumentId.document_id;

            const result = await debitNoteModel.create(newDebitNoteData, req.user);

            //add documentId to result data
            result.documentId = genDNDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genDNDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genDNDocumentId.document_id,
                documentCategory,
                "รออนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newDebitNoteData = new debitNoteModel(req.body);
            newDebitNoteData.vendor_info = JSON.stringify(newDebitNoteData.vendor_info);
            newDebitNoteData.debit_note_data = JSON.stringify(newDebitNoteData.debit_note_data);

            const result = await debitNoteModel.update(req.body.debit_note_id, newDebitNoteData, req.user);

            await addDocumentActivity(
                null,
                req.body.combined_payment_id,
                documentName,
                req.body.combined_payment_document_id,
                documentCategory,
                "รออนุมัติ",
                req.user);

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
exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.debit_note_template_remark_id === undefined || req.body.debit_note_template_remark_id === "") {
        req.body.debit_note_template_remark_id = null;
    }

    if (req.body.debit_note_remark === undefined || req.body.debit_note_remark === "") {
        req.body.debit_note_remark = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.debit_note_data);
        req.body.debit_note_status = "approved";

        if (req.body.debit_note_id === undefined) {
            const newDebitNoteData = new debitNoteModel(req.body);
            const genDNDocumentId = await genDocumentId("DN", "debit_note");
            newDebitNoteData.debit_note_document_id = genDNDocumentId.document_id;
            newDebitNoteData.debit_note_approveby = req.user.employee_id;
            newDebitNoteData.debit_note_approveby_employee = JSON.stringify(req.user);

            const result = await debitNoteModel.create(newDebitNoteData, req.user);

            //add documentId to result data
            result.documentId = genDNDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genDNDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genDNDocumentId.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newDebitNoteData = new debitNoteModel(req.body);
            newDebitNoteData.vendor_info = JSON.stringify(newDebitNoteData.vendor_info);
            newDebitNoteData.debit_note_data = JSON.stringify(newDebitNoteData.debit_note_data);
            newDebitNoteData.debit_note_approveby = req.user.employee_id;
            newDebitNoteData.debit_note_approveby_employee = JSON.stringify(req.user);

            const result = await debitNoteModel.update(req.body.debit_note_id, newDebitNoteData, req.user);

            await addDocumentActivity(
                null,
                req.body.combined_payment_id,
                documentName,
                req.body.combined_payment_document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

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
        const result = await debitNoteModel.updateByDocumentId(
            req.params.document_id,
            { debit_note_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null },
            req.user
        );

        const debitNoteResult = await debitNoteModel.getByDocumentId(req.params.document_id);

        if (debitNoteResult) {
            await addDocumentActivity(
                null,
                debitNoteResult.combined_payment_id,
                documentName,
                debitNoteResult.combined_payment_document_id,
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
exports.updatePayment = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        if (req.body.ref_document_id !== undefined && req.body.ref_document_id !== null && req.body.ref_type === "purchase_invoice") {

            let data = {
                debit_note_status: "closed",
                debit_note_info: JSON.stringify(req.body.debit_note_info),
                debit_note_type: req.body.debit_note_type
            };

            const result = await debitNoteModel.updateByDocumentId(req.params.document_id, data, req.user);

            //create project activity
            await addDocumentActivity(
                null,
                req.body.debit_note_id,
                documentName,
                req.body.debit_note_document_id,
                documentCategory,
                "ปิดใบลดหนี้",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {

            if ((req.body.debit_note_info.payment_channel_id === undefined || req.body.debit_note_info.payment_channel_id === null) && req.body.debit_note_info.payment_channel_type !== "check") {
                const newPaymentChannelData = new paymentChannelModel(req.body);
                const paymentChannelResult = await paymentChannelController.internalCreate(newPaymentChannelData, req.user);
                req.body.payment_channel_id = paymentChannelResult.insertId;
            }

            let data = {
                debit_note_status: "closed",
                payment_channel_id: req.body.payment_channel_id,
                check_info: JSON.stringify(req.body.check_info) || null,
                debit_note_info: JSON.stringify(req.body.debit_note_info) || null,
                debit_note_type: req.body.debit_note_type
            };

            const result = await debitNoteModel.updateByDocumentId(req.params.document_id, data, req.user);

            //create project activity
            await addDocumentActivity(
                null,
                req.body.debit_note_id,
                documentName,
                req.body.debit_note_document_id,
                documentCategory,
                "ปิดใบลดหนี้",
                req.user);

            return res.send({
                status: "succes",
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
        const debitNoteResult = await debitNoteModel.getByDocumentId(req.params.document_id);

        if (debitNoteResult !== undefined) {
            let result = {
                ref_document_id: debitNoteResult.ref_document_id,
                ref_type: debitNoteResult.ref_type,
                external_ref_document_id: debitNoteResult.external_ref_document_id,
                vendor_info: debitNoteResult.vendor_info,
                debit_note_reason: debitNoteResult.debit_note_reason,
                debit_note_data: debitNoteResult.debit_note_data,
                debit_note_template_remark_id: debitNoteResult.debit_note_template_remark_id,
                debit_note_remark: debitNoteResult.debit_note_remark,
                shipping_cost: debitNoteResult.shipping_cost,
                additional_discount: debitNoteResult.additional_discount,
                vat_exempted_amount: debitNoteResult.vat_exempted_amount,
                total_amount: debitNoteResult.total_amount,
                vat_0_amount: debitNoteResult.vat_0_amount,
                vat_7_amount: debitNoteResult.vat_7_amount,
                vat_amount: debitNoteResult.vat_amount,
                net_amount: debitNoteResult.net_amount,
                withholding_tax: debitNoteResult.withholding_tax,
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
            status: "error",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const debitNoteResult = await debitNoteModel.getByDocumentId(req.params.document_id);

        if (debitNoteResult !== undefined) {
            debitNoteResult.debit_note_issue_date = moment(debitNoteResult.debit_note_issue_date).format("DD/MM/YYYY");
            const pdf_name = `${debitNoteResult.debit_note_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                debitNoteTemplate(debitNoteResult),
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
        const debitNoteResult = await debitNoteModel.getByDocumentId(req.params.document_id);

        if (debitNoteResult !== undefined) {

            //if apply debit note to purchase invoice will check status if payment complete will change it back to wait payment
            if (debitNoteResult.ref_document_id !== null && debitNoteResult.ref_type === "purchase_invoice") {
                const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(debitNoteResult.ref_document_id);


                if (purchaseInvoiceResult.purchase_invoice_status === "payment_complete") {
                    await purchaseInvoiceModel.update(purchaseInvoiceResult.purchase_invoice_id, { purchase_invoice_status: "wait_payment" }, req.user);
                }
            }

            //change status purchase return status to approved
            if (debitNoteResult.ref_document_id !== null && debitNoteResult.ref_type === "purchase_return") {
                const purchaseReturnResult = await purchaseReturnModel.getByDocumentId(debitNoteResult.ref_document_id);

                if (purchaseReturnResult.purchase_return_status === "closed") {
                    await purchaseReturnModel.update(purchaseReturnResult.purchase_return_id, { purchase_return_status: "approved" }, req.user);
                }
            }

            const result = await debitNoteModel.updateByDocumentId(req.params.document_id, { debit_note_status: "cancelled" }, req.user);

            if (debitNoteResult) {
                await addDocumentActivity(
                    null,
                    debitNoteResult.debit_note_id,
                    documentName,
                    debitNoteResult.debit_note_document_id,
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