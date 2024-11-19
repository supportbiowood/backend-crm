const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const purchaseReturnModel = require("../models/purchaseReturn.model");
const debitNoteModel = require("../models/debitNote.model");

const { genDocumentId } = require("../utils/generate");
const itemValidation = require("../utils/item");

const purchaseReturnTemplate = require("../templates/purchaseReturn");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.PURCHASE_RETURN;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await purchaseReturnModel.getAll();

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
        const result = await purchaseReturnModel.getByDocumentId(req.params.document_id);

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

    if (req.body.purchase_return_template_remark_id === undefined || req.body.purchase_return_template_remark_id === "") {
        req.body.purchase_return_template_remark_id = null;
    }

    if (req.body.purchase_return_remark === undefined || req.body.purchase_return_remark === "") {
        req.body.purchase_return_remark = null;
    }

    try {
        const newPurchaseReturnData = new purchaseReturnModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseReturnData.purchase_request_data);
        const genRSDocumentId = await genDocumentId("RS", "purchase_return");
        newPurchaseReturnData.purchase_return_document_id = genRSDocumentId.document_id;
        newPurchaseReturnData.purchase_return_status = "draft";

        const result = await purchaseReturnModel.create(newPurchaseReturnData, req.user);

        //add documentId to result data
        result.documentId = genRSDocumentId.document_id;

        await addDocumentActivity(
            null,
            result.insertId,
            documentName,
            genRSDocumentId.document_id,
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

    if (req.body.purchase_return_template_remark_id === undefined || req.body.purchase_return_template_remark_id === "") {
        req.body.purchase_return_template_remark_id = null;
    }

    if (req.body.purchase_return_remark === undefined || req.body.purchase_return_remark === "") {
        req.body.purchase_return_remark = null;
    }

    try {
        if (req.body.purchase_return_status === undefined || req.body.purchase_return_status === null || req.body.purchase_return_status === "") {
            throw new Error(`purchase_return_status is not value`);
        }

        const newPurchaseReturnData = new purchaseReturnModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseReturnData.purchase_request_data);
        newPurchaseReturnData.vendor_info = JSON.stringify(newPurchaseReturnData.vendor_info);
        newPurchaseReturnData.purchase_return_data = JSON.stringify(newPurchaseReturnData.purchase_return_data);

        const result = await purchaseReturnModel.updateByDocumentId(req.params.document_id, newPurchaseReturnData, req.user);

        await addDocumentActivity(
            null,
            req.body.purchase_return_id,
            documentName,
            req.body.purchase_return_document_id,
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

    if (req.body.purchase_return_template_remark_id === undefined || req.body.purchase_return_template_remark_id === "") {
        req.body.purchase_return_template_remark_id = null;
    }

    if (req.body.purchase_return_remark === undefined || req.body.purchase_return_remark === "") {
        req.body.purchase_return_remark = null;
    }

    try {

        req.body.purchase_return_status = "wait_approve";

        if (req.body.purchase_return_id === undefined) {
            const newPurchaseReturnData = new purchaseReturnModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseReturnData.purchase_request_data);
            const genRSDocumentId = await genDocumentId("RS", "purchase_return");
            newPurchaseReturnData.purchase_return_document_id = genRSDocumentId.document_id;

            const result = await purchaseReturnModel.create(newPurchaseReturnData, req.user);

            //add documentId to result data
            result.documentId = genRSDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genRSDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genRSDocumentId.document_id,
                documentCategory,
                "รออนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newPurchaseReturnData = new purchaseReturnModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseReturnData.purchase_request_data);
            newPurchaseReturnData.vendor_info = JSON.stringify(newPurchaseReturnData.vendor_info);
            newPurchaseReturnData.purchase_return_data = JSON.stringify(newPurchaseReturnData.purchase_return_data);

            const result = await purchaseReturnModel.update(req.body.purchase_return_id, newPurchaseReturnData, req.user);

            await addDocumentActivity(
                null,
                req.body.purchase_return_id,
                documentName,
                req.body.purchase_return_document_id,
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

    if (req.body.purchase_return_template_remark_id === undefined || req.body.purchase_return_template_remark_id === "") {
        req.body.purchase_return_template_remark_id = null;
    }

    if (req.body.purchase_return_remark === undefined || req.body.purchase_return_remark === "") {
        req.body.purchase_return_remark = null;
    }

    try {

        req.body.purchase_return_status = "approved";

        if (req.body.purchase_return_id === undefined) {
            const newPurchaseReturnData = new purchaseReturnModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseReturnData.purchase_request_data);
            const genRSDocumentId = await genDocumentId("RS", "purchase_return");
            newPurchaseReturnData.purchase_return_document_id = genRSDocumentId.document_id;
            newPurchaseReturnData.purchase_return_approveby = req.user.employee_id;
            newPurchaseReturnData.purchase_return_approveby_employee = JSON.stringify(req.user);

            const result = await purchaseReturnModel.create(newPurchaseReturnData, req.user);

            //add documentId to result data
            result.documentId = genRSDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genRSDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genRSDocumentId.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newPurchaseReturnData = new purchaseReturnModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseReturnData.purchase_request_data);
            newPurchaseReturnData.vendor_info = JSON.stringify(newPurchaseReturnData.vendor_info);
            newPurchaseReturnData.purchase_return_data = JSON.stringify(newPurchaseReturnData.purchase_return_data);
            newPurchaseReturnData.purchase_return_approveby = req.user.employee_id;
            newPurchaseReturnData.purchase_return_approveby_employee = JSON.stringify(req.user);

            const result = await purchaseReturnModel.update(req.body.purchase_return_id, newPurchaseReturnData, req.user);

            await addDocumentActivity(
                null,
                req.body.purchase_return_id,
                documentName,
                req.body.purchase_return_document_id,
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
        const result = await purchaseReturnModel.updateByDocumentId(req.params.document_id, { purchase_return_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null }, req.user);

        const purchaseReturnResult = await purchaseReturnModel.getByDocumentId(req.params.document_id);

        if (purchaseReturnResult) {
            await addDocumentActivity(
                null,
                purchaseReturnResult.purchase_return_id,
                documentName,
                purchaseReturnResult.purchase_return_document_id,
                documentCategory,
                req.body.not_approve_reason || "ไม่อนุมัติ",
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
exports.copyDocument = async (req, res) => {
    try {
        const purchaseReturnResult = await purchaseReturnModel.getByDocumentId(req.params.document_id);

        if (purchaseReturnResult !== undefined) {
            let result = {
                purchase_order_document_id: purchaseReturnResult.purchase_order_document_id,
                external_ref_document_id: purchaseReturnResult.external_ref_document_id,
                vendor_info: purchaseReturnResult.vendor_info,
                purchase_return_data: purchaseReturnResult.purchase_return_data,
                purchase_return_template_remark_id: purchaseReturnResult.purchase_return_template_remark_id,
                purchase_return_remark: purchaseReturnResult.purchase_return_remark,
                purchase_return_reason: purchaseReturnResult.purchase_return_reason,
                additional_discount: purchaseReturnResult.additional_discount,
                vat_exempted_amount: purchaseReturnResult.vat_exempted_amount,
                vat_0_amount: purchaseReturnResult.vat_0_amount,
                vat_7_amount: purchaseReturnResult.vat_7_amount,
                vat_amount: purchaseReturnResult.vat_amount,
                net_amount: purchaseReturnResult.net_amount,
                withholding_tax: purchaseReturnResult.withholding_tax,
                total_amount: purchaseReturnResult.total_amount
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
        const purchaseReturnResult = await purchaseReturnModel.getByDocumentId(
            req.params.document_id
        );

        if (purchaseReturnResult !== undefined) {
            purchaseReturnResult.purchase_return_issue_date = moment(purchaseReturnResult.purchase_return_issue_date).format("DD/MM/YYYY");
            purchaseReturnResult.purchase_return_delivery_date = moment(purchaseReturnResult.purchase_return_delivery_date).format("DD/MM/YYYY");
            const pdf_name = `${purchaseReturnResult.purchase_return_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                purchaseReturnTemplate(purchaseReturnResult),
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
    try {
        const purchaseReturnResult = await purchaseReturnModel.getByDocumentId(req.params.document_id);

        //check in database have purchase return
        if (purchaseReturnResult !== undefined) {

            //check if purchase return status = closed. It can't void document.
            if (purchaseReturnResult.purchase_return_status !== "closed") {
                let debitNoteListResult = await debitNoteModel.getAllByPurchaseReturnDocumentId(purchaseReturnResult.purchase_return_document_id);
                debitNoteListResult = await debitNoteListResult.filter((dn) => dn.debit_note_status !== "cancelled");

                if (debitNoteListResult.length === 0) {
                    const result = await purchaseReturnModel.updateByDocumentId(req.params.document_id, { purchase_return_status: "cancelled" }, req.user);

                    if (purchaseReturnResult) {
                        await addDocumentActivity(
                            null,
                            purchaseReturnResult.purchase_return_id,
                            documentName,
                            purchaseReturnResult.purchase_return_document_id,
                            documentCategory,
                            "ยกเลิก",
                            req.user);
                    }

                    return res.send({
                        status: "success",
                        data: result
                    });
                }
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