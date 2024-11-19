const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const deliveryNoteModel = require("../models/deliveryNote.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const attachmentModel = require("../models/attachment.model");
const salesOrderModel = require("../models/salesOrder.model");

const itemValidation = require("../utils/item");
const deliveryNoteTemplate = require("../templates/deliveryNote");

const { genDocumentId } = require("../utils/generate");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.DELIVERY_NOTE;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await deliveryNoteModel.getAll();

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
        const result = await deliveryNoteModel.getByDocumentId(req.params.document_id);

        let attachmentList = await attachmentModel.getByRefId(result.delivery_note_id, "delivery_note");

        if (attachmentList.length !== 0) {
            result.attachment_remark = attachmentList[0].attachment_remark;
        } else {
            result.attachment_remark = null;
        }

        result.attachment_list = attachmentList;

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

exports.getSalesOrderList = async (req, res) => {
    try {
        let salesOrderListResult = await salesOrderModel.getByContactId(req.params.contact_id);
        salesOrderListResult = await salesOrderListResult.filter((so) => so.sales_order_status === "approved" || so.sales_order_status === "closed");

        let result = [];

        for (let salesOrder of salesOrderListResult) {
            let deliveryNoteResult = await deliveryNoteModel.getSalesOrderDocumentId(salesOrder.sales_order_document_id);
            if (deliveryNoteResult === undefined) {
                result.push(salesOrder);
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

    if (req.body.delivery_note_template_remark_id === undefined || req.body.delivery_note_template_remark_id === "") {
        req.body.delivery_note_template_remark_id = null;
    }

    if (req.body.delivery_note_remark === undefined || req.body.delivery_note_remark === "") {
        req.body.delivery_note_remark = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.delivery_note_data);
        const newDeliveryNoteData = new deliveryNoteModel(req.body);
        const genDeliveryNoteDocumentId = await genDocumentId("DO", "delivery_note");
        newDeliveryNoteData.delivery_note_document_id = genDeliveryNoteDocumentId.document_id;
        newDeliveryNoteData.delivery_note_status = "draft";

        const result = await deliveryNoteModel.create(newDeliveryNoteData, req.user);

        //add documentId to result data
        result.documentId = genDeliveryNoteDocumentId.document_id;

        //prepare data of project activity
        if (req.body.sales_order_project_list) {
            for (let project in req.body.sales_order_project_list) {
                await addDocumentActivity(
                    project.project_id,
                    result.insertId,
                    documentName,
                    genDeliveryNoteDocumentId.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
            }
        }

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
        return res.status(400).send({
            status: 'error',
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

    if (req.body.delivery_note_template_remark_id === undefined || req.body.delivery_note_template_remark_id === "") {
        req.body.delivery_note_template_remark_id = null;
    }

    if (req.body.delivery_note_remark === undefined || req.body.delivery_note_remark === "") {
        req.body.delivery_note_remark = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.delivery_note_data);

        if (req.body.delivery_note_status === undefined || req.body.delivery_note_status === null || req.body.delivery_note_status === "") {
            throw new Error(`delivery_note_status is not value`);
        }

        const newDeliveryNoteData = new deliveryNoteModel(req.body);
        newDeliveryNoteData.delivery_info = JSON.stringify(newDeliveryNoteData.delivery_info);
        newDeliveryNoteData.billing_info = JSON.stringify(newDeliveryNoteData.billing_info);
        newDeliveryNoteData.sales_order_document_id_list = JSON.stringify(newDeliveryNoteData.sales_order_document_id_list);
        newDeliveryNoteData.sales_order_project_list = JSON.stringify(newDeliveryNoteData.sales_order_project_list);
        newDeliveryNoteData.delivery_note_data = JSON.stringify(newDeliveryNoteData.delivery_note_data);

        const result = await deliveryNoteModel.updateByDocumentId(req.params.document_id, newDeliveryNoteData, req.user);

        if (req.body.sales_order_project_list) {
            for (let project in req.body.sales_order_project_list) {
                await addDocumentActivity(
                    project.project_id,
                    req.body.delivery_note_id,
                    documentName,
                    req.body.delivery_note_document_id,
                    documentCategory,
                    "แก้ไข",
                    req.user);
            }
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
exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.delivery_note_template_remark_id === undefined || req.body.delivery_note_template_remark_id === "") {
        req.body.delivery_note_template_remark_id = null;
    }

    if (req.body.delivery_note_remark === undefined || req.body.delivery_note_remark === "") {
        req.body.delivery_note_remark = null;
    }

    try {
        itemValidation.validateItemPurchase(req.body.delivery_note_data);
        if (req.body.delivery_note_id === undefined) {
            const newDeliveryNoteData = new deliveryNoteModel(req.body);
            const genDODocumentId = await genDocumentId("DO", "delivery_note");
            newDeliveryNoteData.delivery_note_document_id = genDODocumentId.document_id;
            newDeliveryNoteData.delivery_note_status = "wait_delivery";
            newDeliveryNoteData.delivery_note_approveby = req.user.employee_id;
            newDeliveryNoteData.delivery_note_approveby_employee = JSON.stringify(req.user);
            const result = await deliveryNoteModel.create(newDeliveryNoteData, req.user);

            //add documentId to result data
            result.documentId = genDODocumentId.document_id;

            if (req.body.sales_order_project_list) {
                for (let project in req.body.sales_order_project_list) {
                    await addDocumentActivity(
                        project.project_id,
                        result.insertId,
                        documentName,
                        genDODocumentId.document_id,
                        documentCategory,
                        "สร้าง",
                        req.user);
                    await addDocumentActivity(
                        project.project_id,
                        result.insertId,
                        documentName,
                        genDODocumentId.document_id,
                        documentCategory,
                        "อนุมัติ",
                        req.user);
                }
            }

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newDeliveryNoteData = new deliveryNoteModel(req.body);
            newDeliveryNoteData.sales_order_document_id_list = JSON.stringify(newDeliveryNoteData.sales_order_document_id_list);
            newDeliveryNoteData.sales_order_project_list = JSON.stringify(newDeliveryNoteData.sales_order_project_list);
            newDeliveryNoteData.delivery_note_data = JSON.stringify(newDeliveryNoteData.delivery_note_data);
            newDeliveryNoteData.delivery_info = JSON.stringify(newDeliveryNoteData.delivery_info);
            newDeliveryNoteData.billing_info = JSON.stringify(newDeliveryNoteData.billing_info);
            newDeliveryNoteData.delivery_note_status = "wait_delivery";
            newDeliveryNoteData.delivery_note_approveby = req.user.employee_id;
            newDeliveryNoteData.delivery_note_approveby_employee = JSON.stringify(req.user);
            const result = await deliveryNoteModel.update(req.body.delivery_note_id, newDeliveryNoteData, req.user);

            if (req.body.sales_order_project_list) {
                for (let project in req.body.sales_order_project_list) {
                    await addDocumentActivity(
                        project.project_id,
                        req.body.delivery_note_id,
                        documentName,
                        req.body.delivery_note_document_id,
                        documentCategory,
                        "อนุมัติ",
                        req.user);
                }
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
exports.updateStatus = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    try {
        let data = {
            pickup_date: req.body.pickup_date,
            delivery_note_status: req.body.delivery_note_status,
            consignee_name: req.body.consignee_name,
            not_complete_reason: req.body.not_complete_reason || null
        };

        const result = await deliveryNoteModel.updateByDocumentId(req.params.document_id, data, req.user);

        if (req.body.sales_order_project_list) {
            for (let project in req.body.sales_order_project_list) {
                await addDocumentActivity(
                    project.project_id,
                    req.body.delivery_note_id,
                    documentName,
                    req.body.delivery_note_document_id,
                    documentCategory,
                    "อัพเดทสถานะการส่งของ",
                    req.user);
            }
        }

        const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(req.params.document_id);

        //get attachment of this payment receipt
        let oldAttachmentList = await attachmentModel.getByRefId(deliveryNoteResult.delivery_note_id, "delivery_note");

        if (oldAttachmentList.length !== 0) {
            if (oldAttachmentList[0].attachment_remark !== req.body.attachment_remark) {
                await attachmentModel.updateAllRemarkByAttachmentTypeAndRefId("delivery_note", req.body.delivery_note_id, req.body.attachment_remark);
                oldAttachmentList = await attachmentModel.getByRefId(req.body.delivery_note_id, "delivery_note");
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
            newAttachmentData.attachment_type = "delivery_note";
            newAttachmentData.ref_id = deliveryNoteResult.delivery_note_id;
            newAttachmentData.attachment_remark = req.body.attachment_remark;

            await attachmentModel.create(newAttachmentData, req.user);
        }

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.copyDocument = async (req, res) => {
    try {
        const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(req.params.document_id);

        if (deliveryNoteResult !== undefined) {
            let result = {
                sales_order_document_id_list: deliveryNoteResult.sales_order_document_id_list,
                sales_order_project_list: deliveryNoteResult.sales_order_project_list,
                billing_info: deliveryNoteResult.billing_info,
                delivery_info: deliveryNoteResult.delivery_info,
                delivery_note_data: deliveryNoteResult.delivery_note_data,
                delivery_note_template_remark_id: deliveryNoteResult.delivery_note_template_remark_id,
                delivery_note_remark: deliveryNoteResult.delivery_note_remark,
                shipping_cost: deliveryNoteResult.shipping_cost,
                additional_discount: deliveryNoteResult.additional_discount,
                vat_exempted_amount: deliveryNoteResult.vat_exempted_amount,
                vat_0_amount: deliveryNoteResult.vat_0_amount,
                vat_7_amount: deliveryNoteResult.vat_7_amount,
                vat_amount: deliveryNoteResult.vat_amount,
                net_amount: deliveryNoteResult.net_amount,
                withholding_tax: deliveryNoteResult.withholding_tax,
                total_amount: deliveryNoteResult.total_amount
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
        const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(
            req.params.document_id
        );

        if (deliveryNoteResult !== undefined) {
            deliveryNoteResult.delivery_note_issue_date = moment(
                deliveryNoteResult.delivery_note_issue_date
            ).format("DD/MM/YYYY");
            deliveryNoteResult.delivery_note_delivery_date = moment(
                deliveryNoteResult.delivery_note_delivery_date
            ).format("DD/MM/YYYY");
            const pdf_name = `${deliveryNoteResult.delivery_note_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                deliveryNoteTemplate(deliveryNoteResult),
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
        const deliveryNoteResult = await deliveryNoteModel.getByDocumentId(req.params.document_id);

        if (deliveryNoteResult !== undefined) {

            if (deliveryNoteResult.delivery_note_status !== "return" && deliveryNoteResult.delivery_note_status !== "closed") {

                const result = await deliveryNoteModel.updateByDocumentId(req.params.document_id, { delivery_note_status: "cancelled" }, req.user);

                if (req.body.sales_order_project_list) {
                    for (let project in req.body.sales_order_project_list) {
                        await addDocumentActivity(
                            project.project_id,
                            req.body.delivery_note_id,
                            documentName,
                            req.body.delivery_note_document_id,
                            documentCategory,
                            "ยกเลิก",
                            req.user);
                    }
                }

                return res.send({
                    status: "success",
                    data: result
                });
            } else {
                throw new Error(`ไม่สามารถยกเลิกเอกสารได้`);
            }

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