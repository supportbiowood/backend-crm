const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const salesReturnModel = require("../models/salesReturn.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const deliveryNoteModel = require("../models/deliveryNote.model");
const creditNoteModel = require("../models/creditNote.model");

const salesReturnTemplate = require("../templates/salesReturn");

const { genDocumentId } = require("../utils/generate");
const itemValidation = require("../utils/item");
const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.SALES_RETURN;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await salesReturnModel.getAll();

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
        const result = await salesReturnModel.getByDocumentId(req.params.document_id);

        let creditNoteList = await creditNoteModel.getBySalesReturnDocumentId(result.sales_return_document_id);

        result.credit_note_list = creditNoteList.filter((cn) => cn.credit_note_status !== 'cancelled');

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
    if (req.body.sales_return_template_remark_id === undefined || req.body.sales_return_template_remark_id === "") {
        req.body.sales_return_template_remark_id = null;
    }

    if (req.body.sales_return_remark === undefined || req.body.sales_return_remark === "") {
        req.body.sales_return_remark = null;
    }

    try {
        const newSalesReturnData = new salesReturnModel(req.body);
        itemValidation.validateItemSale(newSalesReturnData.sales_return_data);
        const genSRDocumentId = await genDocumentId("SR", "sales_return");
        newSalesReturnData.sales_return_document_id = genSRDocumentId.document_id;
        newSalesReturnData.sales_return_status = "draft";

        const result = await salesReturnModel.create(newSalesReturnData, req.user);

        //add documentId to result data
        result.documentId = genSRDocumentId.document_id;

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                genSRDocumentId.document_id,
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
    if (req.body.sales_return_template_remark_id === undefined || req.body.sales_return_template_remark_id === "") {
        req.body.sales_return_template_remark_id = null;
    }

    if (req.body.sales_return_remark === undefined || req.body.sales_return_remark === "") {
        req.body.sales_return_remark = null;
    }

    try {
        if (req.body.sales_return_status === undefined || req.body.sales_return_status === null || req.body.sales_return_status === "") {
            throw new Error(`sales_return_status is not value`);
        }

        const newSalesReturnData = new salesReturnModel(req.body);
        itemValidation.validateItemSale(newSalesReturnData.sales_return_data);
        newSalesReturnData.billing_info = JSON.stringify(newSalesReturnData.billing_info);
        newSalesReturnData.sales_return_data = JSON.stringify(newSalesReturnData.sales_return_data);

        const result = await salesReturnModel.updateByDocumentId(req.params.document_id, newSalesReturnData, req.user);

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.sales_return_id,
                documentName,
                req.body.sales_return_document_id,
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
    if (req.body.sales_return_template_remark_id === undefined || req.body.sales_return_template_remark_id === "") {
        req.body.sales_return_template_remark_id = null;
    }

    if (req.body.sales_return_remark === undefined || req.body.sales_return_remark === "") {
        req.body.sales_return_remark = null;
    }
    try {
        req.body.sales_return_status = "wait_approve";

        if (req.body.sales_return_id === undefined) {
            const newSalesReturnData = new salesReturnModel(req.body);
            itemValidation.validateItemSale(newSalesReturnData.sales_return_data);
            const genSRDocumentId = await genDocumentId("SR", "sales_return");
            newSalesReturnData.sales_return_document_id = genSRDocumentId.document_id;

            const result = await salesReturnModel.create(newSalesReturnData, req.user);

            //add documentId to result data
            result.documentId = genSRDocumentId.document_id;

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genSRDocumentId.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genSRDocumentId.document_id,
                    documentCategory,
                    "รออนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newSalesReturnData = new salesReturnModel(req.body);
            itemValidation.validateItemSale(newSalesReturnData.sales_return_data);
            newSalesReturnData.billing_info = JSON.stringify(newSalesReturnData.billing_info);
            newSalesReturnData.sales_return_data = JSON.stringify(newSalesReturnData.sales_return_data);

            const result = await salesReturnModel.update(req.body.sales_return_id, newSalesReturnData, req.user);

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.sales_return_id,
                    documentName,
                    req.body.sales_return_document_id,
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
    if (req.body.sales_return_template_remark_id === undefined || req.body.sales_return_template_remark_id === "") {
        req.body.sales_return_template_remark_id = null;
    }

    if (req.body.sales_return_remark === undefined || req.body.sales_return_remark === "") {
        req.body.sales_return_remark = null;
    }
    try {
        req.body.sales_return_status = "approved";

        if (req.body.sales_return_id === undefined) {
            const newSalesReturnData = new salesReturnModel(req.body);
            itemValidation.validateItemSale(newSalesReturnData.sales_return_data);
            const genSRDocumentId = await genDocumentId("SR", "sales_return");
            newSalesReturnData.sales_return_document_id = genSRDocumentId.document_id;
            newSalesReturnData.sales_return_approveby = req.user.employee_id;
            newSalesReturnData.sales_return_approveby_employee = JSON.stringify(req.user);

            const result = await salesReturnModel.create(newSalesReturnData, req.user);

            //add documentId to result data
            result.documentId = genSRDocumentId.document_id;

            const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(newSalesReturnData.delivery_note_document_id);

            if (deliveryNoteResult && deliveryNoteResult.delivery_note_status !== "return") {
                await deliveryNoteModel.update(deliveryNoteResult.delivery_note_id, { delivery_note_status: "return" }, req.user);
            }

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genSRDocumentId.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genSRDocumentId.document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newSalesReturnData = new salesReturnModel(req.body);
            itemValidation.validateItemSale(newSalesReturnData.sales_return_data);
            newSalesReturnData.billing_info = JSON.stringify(newSalesReturnData.billing_info);
            newSalesReturnData.sales_return_data = JSON.stringify(newSalesReturnData.sales_return_data);
            newSalesReturnData.sales_return_approveby = req.user.employee_id;
            newSalesReturnData.sales_return_approveby_employee = JSON.stringify(req.user);

            const result = await salesReturnModel.update(req.body.sales_return_id, newSalesReturnData, req.user);

            const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(newSalesReturnData.delivery_note_document_id);

            if (deliveryNoteResult && deliveryNoteResult.delivery_note_status !== "return") {
                await deliveryNoteModel.update(deliveryNoteResult.delivery_note_id, { delivery_note_status: "return" }, req.user);
            }

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.sales_return_id,
                    documentName,
                    req.body.sales_return_document_id,
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
exports.notApprove = async (req, res) => {
    try {
        const result = await salesReturnModel.updateByDocumentId(
            req.params.document_id,
            { sales_return_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null },
            req.user
        );

        const salesReturnResult = await salesReturnModel.getByDocumentId(req.params.document_id);

        //create project activity
        if (salesReturnResult.billing_info) {
            await addDocumentActivity(
                salesReturnResult.billing_info.project_id,
                salesReturnResult.sales_return_id,
                documentName,
                salesReturnResult.sales_return_document_id,
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
        const salesReturnResult = await salesReturnModel.getByDocumentId(req.params.document_id);
        if (salesReturnResult !== undefined) {
            let result = {
                billing_info: salesReturnResult.billing_info,
                sales_return_data: salesReturnResult.sales_return_data,
                sales_return_template_remark_id: salesReturnResult.sales_return_template_remark_id,
                sales_return_remark: salesReturnResult.sales_return_remark,
                shipping_cost: salesReturnResult.shipping_cost,
                vat_exempted_amount: salesReturnResult.vat_exempted_amount,
                vat_0_amount: salesReturnResult.vat_0_amount,
                vat_7_amount: salesReturnResult.vat_7_amount,
                vat_amount: salesReturnResult.vat_amount,
                net_amount: salesReturnResult.net_amount,
                withholding_tax: salesReturnResult.withholding_tax,
                total_amount: salesReturnResult.total_amount
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
        const salesReturnResult = await salesReturnModel.getByDocumentId(
            req.params.document_id
        );

        if (salesReturnResult !== undefined) {
            salesReturnResult.sales_return_issue_date = moment(salesReturnResult.sales_return_issue_date).format("DD/MM/YYYY");
            salesReturnResult.sales_return_delivery_date = moment(salesReturnResult.sales_return_delivery_date).format("DD/MM/YYYY");
            const pdf_name = `${salesReturnResult.sales_return_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                salesReturnTemplate(salesReturnResult),
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
        const salesReturnResult = await salesReturnModel.getByDocumentId(req.params.document_id);

        if (salesReturnResult !== undefined) {
            const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(salesReturnResult.delivery_note_document_id);

            // if delivery note status is return will change status to closed
            if (deliveryNoteResult && deliveryNoteResult.delivery_note_status === 'return') {
                await deliveryNoteModel.update(deliveryNoteResult.delivery_note_id, { delivery_note_status: "closed" }, req.user);
            }

            //void document of sales return
            const result = await salesReturnModel.updateByDocumentId(req.params.document_id, { sales_return_status: "cancelled" }, req.user);

            //create project activity
            if (salesReturnResult.billing_info) {
                await addDocumentActivity(
                    salesReturnResult.billing_info.project_id,
                    salesReturnResult.sales_return_id,
                    documentName,
                    salesReturnResult.sales_return_document_id,
                    documentCategory,
                    "ยกเลิก",
                    req.user);
            }

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