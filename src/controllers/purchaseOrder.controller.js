const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const purchaseOrderModel = require("../models/purchaseOrder.model");
const purchaseRequestModel = require("../models/purchaseRequest.model");
const purchaseInvoiceModel = require("../models/purchaseInvoice.model");

const purchaseOrderTemplate = require("../templates/purchaseOrder");
const itemValidation = require("../utils/item");
const { genDocumentId } = require("../utils/generate");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.PURCHASE_ORDER;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;


exports.getAll = async (req, res) => {
    try {
        const result = await purchaseOrderModel.getAll();

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
        const result = await purchaseOrderModel.getByDocumentId(req.params.document_id);

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
exports.getPurchaseRequestList = async (req, res) => {
    try {
        let purchaseRequestListResult = await purchaseRequestModel.getAll();

        purchaseRequestListResult = await purchaseRequestListResult.filter((pr) => pr.purchase_request_status === "approved");

        let result = [];
        for (let purchaseRequest of purchaseRequestListResult) {
            let purchaseOrderResult = await purchaseOrderModel.getPurchaseRequestDocumentId(purchaseRequest.purchase_request_document_id);
            if (purchaseOrderResult === undefined) {
                result.push(purchaseRequest);
            }
        }

        return res.send({
            status: 'success',
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

    if (req.body.purchase_order_template_remark_id === undefined || req.body.purchase_order_template_remark_id === "") {
        req.body.purchase_order_template_remark_id = null;
    }

    if (req.body.purchase_order_remark === undefined || req.body.purchase_order_remark === "") {
        req.body.purchase_order_remark = null;
    }

    try {
        const newPurchaseOrderData = new purchaseOrderModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseOrderData.purchase_order_data);
        const genPODocumentId = await genDocumentId("PO", "purchase_order");
        newPurchaseOrderData.purchase_order_document_id = genPODocumentId.document_id;
        newPurchaseOrderData.purchase_order_status = "draft";
        const result = await purchaseOrderModel.create(newPurchaseOrderData, req.user);

        //add documentId to result data
        result.documentId = genPODocumentId.document_id;

        await addDocumentActivity(
            null,
            result.insertId,
            documentName,
            genPODocumentId.document_id,
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

    if (req.body.purchase_order_template_remark_id === undefined || req.body.purchase_order_template_remark_id === "") {
        req.body.purchase_order_template_remark_id = null;
    }

    if (req.body.purchase_order_remark === undefined || req.body.purchase_order_remark === "") {
        req.body.purchase_order_remark = null;
    }

    try {
        if (req.body.purchase_order_status === undefined || req.body.purchase_order_status === null || req.body.purchase_order_status === "") {
            throw new Error(`purchase_order_status is not value`);
        }

        const newPurchaseOrderData = new purchaseOrderModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseOrderData.purchase_order_data);
        newPurchaseOrderData.purchase_request_document_id_list = JSON.stringify(newPurchaseOrderData.purchase_request_document_id_list);
        newPurchaseOrderData.sales_order_project_list = JSON.stringify(newPurchaseOrderData.sales_order_project_list);
        newPurchaseOrderData.vendor_info = JSON.stringify(newPurchaseOrderData.vendor_info);
        newPurchaseOrderData.purchase_order_data = JSON.stringify(newPurchaseOrderData.purchase_order_data);

        const result = await purchaseOrderModel.updateByDocumentId(req.params.document_id, newPurchaseOrderData, req.user);

        await addDocumentActivity(
            null,
            req.body.purchase_order_id,
            documentName,
            req.body.purchase_order_document_id,
            documentCategory,
            "แก้ไข",
            req.user);

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

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.purchase_order_template_remark_id === undefined || req.body.purchase_order_template_remark_id === "") {
        req.body.purchase_order_template_remark_id = null;
    }

    if (req.body.purchase_order_remark === undefined || req.body.purchase_order_remark === "") {
        req.body.purchase_order_remark = null;
    }

    try {
        req.body.purchase_order_status = "wait_approve";

        if (req.body.purchase_order_id === undefined) {
            const newPurchaseOrderData = new purchaseOrderModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseOrderData.purchase_order_data);
            const genPODocumentId = await genDocumentId("PO", "purchase_order");
            newPurchaseOrderData.purchase_order_document_id = genPODocumentId.document_id;
            const result = await purchaseOrderModel.create(newPurchaseOrderData, req.user);

            //add documentId to result data
            result.documentId = genPODocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPODocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPODocumentId.document_id,
                documentCategory,
                "รออนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newPurchaseOrderData = new purchaseOrderModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseOrderData.purchase_order_data);
            newPurchaseOrderData.purchase_request_document_id_list = JSON.stringify(newPurchaseOrderData.purchase_request_document_id_list);
            newPurchaseOrderData.sales_order_project_list = JSON.stringify(newPurchaseOrderData.sales_order_project_list);
            newPurchaseOrderData.vendor_info = JSON.stringify(newPurchaseOrderData.vendor_info);
            newPurchaseOrderData.purchase_order_data = JSON.stringify(newPurchaseOrderData.purchase_order_data);

            const result = await purchaseOrderModel.update(req.body.purchase_order_id, newPurchaseOrderData, req.user);

            await addDocumentActivity(
                null,
                req.body.purchase_order_id,
                documentName,
                req.body.purchase_order_document_id,
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
exports.notApprove = async (req, res) => {
    try {
        const result = await purchaseOrderModel.updateByDocumentId(req.params.document_id, { purchase_order_status: "not_approve" , not_approve_reason: req.body.not_approve_reason || null }, req.user);

        const purchaseOrderResult = await purchaseOrderModel.getByDocumentId(req.params.document_id);

        if (purchaseOrderResult) {
            await addDocumentActivity(
                null,
                purchaseOrderResult.purchase_order_id,
                documentName,
                purchaseOrderResult.purchase_order_document_id,
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

    if (req.body.purchase_order_template_remark_id === undefined || req.body.purchase_order_template_remark_id === "") {
        req.body.purchase_order_template_remark_id = null;
    }

    if (req.body.purchase_order_remark === undefined || req.body.purchase_order_remark === "") {
        req.body.purchase_order_remark = null;
    }

    try {
        if (req.body.purchase_order_id === undefined) {
            const newPurchaseOrderData = new purchaseOrderModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseOrderData.purchase_order_data);
            const genPODocumentId = await genDocumentId("PO", "purchase_order");
            newPurchaseOrderData.purchase_order_document_id = genPODocumentId.document_id;
            newPurchaseOrderData.purchase_order_status = "approved";
            newPurchaseOrderData.purchase_order_approveby = req.user.employee_id;
            newPurchaseOrderData.purchase_order_approveby_employee = JSON.stringify(req.user);
            const result = await purchaseOrderModel.create(newPurchaseOrderData, req.user);

            //add documentId to result data
            result.documentId = genPODocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPODocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPODocumentId.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            for (let documentId of req.body.purchase_request_document_id_list) {
                await purchaseRequestModel.updateByDocumentId(documentId, { purchase_request_status: "fully_order" }, req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newPurchaseOrderData = new purchaseOrderModel(req.body);
            if (newPurchaseOrderData.purchase_request_document_id_list.length !== 0) {
                newPurchaseOrderData.purchase_request_document_id_list = JSON.stringify(newPurchaseOrderData.purchase_request_document_id_list);
            }
            itemValidation.validateItemPurchase(newPurchaseOrderData.purchase_order_data);
            newPurchaseOrderData.sales_order_project_list = JSON.stringify(newPurchaseOrderData.sales_order_project_list);
            newPurchaseOrderData.purchase_order_data = JSON.stringify(newPurchaseOrderData.purchase_order_data);
            newPurchaseOrderData.vendor_info = JSON.stringify(newPurchaseOrderData.vendor_info);
            newPurchaseOrderData.purchase_order_status = "approved";
            newPurchaseOrderData.purchase_order_approveby = req.user.employee_id;
            newPurchaseOrderData.purchase_order_approveby_employee = JSON.stringify(req.user);
            const result = await purchaseOrderModel.update(req.body.purchase_order_id, newPurchaseOrderData, req.user);

            await addDocumentActivity(
                null,
                req.body.purchase_order_id,
                documentName,
                req.body.purchase_order_document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            for (let documentId of req.body.purchase_request_document_id_list) {
                await purchaseRequestModel.updateByDocumentId(documentId, { purchase_request_status: "fully_order" }, req.user);
            }
            return res.send({
                status: "success",
                data: result
            });
        }

    } catch (error) {
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};
exports.copyDocument = async (req, res) => {
    try {
        const purchaseOrderData = await purchaseOrderModel.getByDocumentId(req.params.document_id);

        if (purchaseOrderData !== undefined) {
            let result = {
                purchase_request_document_id_list: purchaseOrderData.purchase_request_document_id_list,
                sales_order_project_list: purchaseOrderData.sales_order_project_list,
                inventory_target: purchaseOrderData.inventory_target,
                vendor_info: purchaseOrderData.vendor_info,
                external_ref_document_id: purchaseOrderData.external_ref_document_id,
                purchase_order_data: purchaseOrderData.purchase_order_data,
                purchase_order_template_remark_id: purchaseOrderData.purchase_order_template_remark_id,
                purchase_order_remark: purchaseOrderData.purchase_order_remark,
                additional_discount: purchaseOrderData.additional_discount,
                vat_exempted_amount: purchaseOrderData.vat_exempted_amount,
                vat_0_amount: purchaseOrderData.vat_0_amount,
                vat_7_amount: purchaseOrderData.vat_7_amount,
                vat_amount: purchaseOrderData.vat_amount,
                net_amount: purchaseOrderData.net_amount,
                withholding_tax: purchaseOrderData.withholding_tax,
                total_amount: purchaseOrderData.total_amount
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

exports.generatePurchaseInvoiceData = async (req, res) => {
    try {

        const purchaseOrderData = await purchaseOrderModel.getByDocumentId(req.params.document_id);

        if (purchaseOrderData) {
            let result = {
                purchase_invoice_data: purchaseOrderData.purchase_order_data,
                inventory_target: purchaseOrderData.inventory_target,
                external_ref_document_id: purchaseOrderData.external_ref_document_id,
                purchase_order_document_id: purchaseOrderData.purchase_order_document_id,
                vendor_info: purchaseOrderData.vendor_info,
                purchase_invoice_template_remark_id: purchaseOrderData.purchase_order_template_remark_id,
                purchase_invoice_remark: purchaseOrderData.purchase_order_remark,
                additional_discount: purchaseOrderData.additional_discount
            };

            return res.send({
                status: "success",
                data: result
            });

        } else {
            throw new Error(`ไม่พบเอกสาร ${req.params.purchase_invoice_document_id}`);
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
        const purchaseOrderResult = await purchaseOrderModel.getByDocumentId(
            req.params.document_id
        );

        if (purchaseOrderResult !== undefined) {
            purchaseOrderResult.purchase_order_issue_date = moment(
                purchaseOrderResult.purchase_order_issue_date
            ).format("DD/MM/YYYY");
            purchaseOrderResult.purchase_order_due_date = moment(
                purchaseOrderResult.purchase_order_due_date
            ).format("DD/MM/YYYY");
            const pdf_name = `${purchaseOrderResult.purchase_order_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                purchaseOrderTemplate(purchaseOrderResult),
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
        const purchaseOrderResult = await purchaseOrderModel.getByDocumentId(req.params.document_id);

        if (purchaseOrderResult !== undefined) {
            let purchaseInvoiceListResult = await purchaseInvoiceModel.getAllByPurchaseOrderDocumentId(purchaseOrderResult.purchase_order_document_id);
            purchaseInvoiceListResult = purchaseInvoiceListResult.filter((pi) => pi.purchase_invoice_status !== "cancelled");

            //if it has purchase invoice will can not void purchase order
            if (purchaseInvoiceListResult.length === 0) {
                const result = await purchaseOrderModel.updateByDocumentId(req.params.document_id, { purchase_order_status: "cancelled" }, req.user);

                if (purchaseOrderResult) {
                    await addDocumentActivity(
                        null,
                        purchaseOrderResult.purchase_order_id,
                        documentName,
                        purchaseOrderResult.purchase_order_document_id,
                        documentCategory,
                        "ยกเลิก",
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result
                });
            } else {
                throw new Error(`กรุณาลบเอกสารที่เกี่ยวข้อง`);
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