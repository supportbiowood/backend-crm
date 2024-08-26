const moment = require("moment");
const db = require("../utils/database");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const fs = require("fs");

const quotationModel = require("../models/quotation.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const attachmentModel = require("../models/attachment.model");
const salesOrderModel = require("../models/salesOrder.model");
const engineerModel = require("../models/engineer.model");

const quotationTemplate = require("../templates/quotation");

const { genDocumentId } = require("../utils/generate");
const { addDocumentActivity } = require("../utils/activity");
const itemValidation = require("../utils/item");

const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.QUOTATION;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        let result = await quotationModel.getAll();

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
        let quotationResult = await quotationModel.getByDocumentId(req.params.document_id);

        if (quotationResult.length > 0) {
            for (let quotation of quotationResult) {
                quotation.attachment_remark = null;
                quotation.attachment_list = await attachmentModel.getByRefId(quotation.quotation_id, "quotation");
                if (quotation.attachment_list.length !== 0) {
                    quotation.attachment_remark = quotation.attachment_list[0].attachment_remark;
                }
                let salesOrderList = await salesOrderModel.getByQuotationDocumentId(quotation.quotation_document_id) || [];
                quotation.sales_order_list = salesOrderList;
            }
        }

        return res.send({
            status: "success",
            data: quotationResult,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getByDocumentIdWithRevision = async (req, res) => {
    try {
        if (!req.query.revision_id) {
            let quotationResult = await quotationModel.getByDocumentId(req.params.document_id);
            quotationResult = quotationResult[0];
            quotationResult.revision_list = await quotationModel.getRevisionByDocumentId(req.params.document_id);
            quotationResult.attachment_remark = null;
            quotationResult.attachment_list = await attachmentModel.getByRefId(quotationResult.quotation_id, "quotation");
            if (quotationResult.attachment_list.length !== 0) {
                quotationResult.attachment_remark = quotationResult.attachment_list[0].attachment_remark;
            }
            let salesOrderList = await salesOrderModel.getByQuotationDocumentId(quotationResult.quotation_document_id) || [];
            quotationResult.sales_order_list = salesOrderList;
            return res.send({
                status: "success",
                data: quotationResult,
            });
        } else {
            let quotationResult = await quotationModel.getByDocumentIdAndRevisionId(req.params.document_id, req.query.revision_id);
            quotationResult.attachment_remark = null;
            quotationResult.attachment_list = await attachmentModel.getByRefId(quotationResult.quotation_id, "quotation");
            if (quotationResult.attachment_list.length !== 0) {
                quotationResult.attachment_remark = quotationResult.attachment_list[0].attachment_remark;
            }
            let salesOrderList = await salesOrderModel.getByQuotationDocumentId(quotationResult.quotation_document_id) || [];
            quotationResult.sales_order_list = salesOrderList;
            return res.send({
                status: "success",
                data: quotationResult,
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

// const complie = async (templateName, data)=>{
//   const filePath = `${process.cwd()}/src/templates/${templateName}.hbs`;

//   const html_test = fs.readFileSync(filePath, "utf-8");
//   return hbs.compile(html_test)({data: data})
// }

exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (
        req.body.quotation_approveby === undefined &&
        req.body.quotation_approveby_employee === undefined
    ) {
        req.body.quotation_approveby = null;
        req.body.quotation_approveby_employee = null;
    }

    if (req.body.quotation_accept_date === undefined) {
        req.body.quotation_accept_date = null;
    }

    if (
        req.body.quotation_template_remark_id === "" ||
        req.body.quotation_template_remark_id === undefined
    ) {
        req.body.quotation_template_remark_id = null;
    }

    if (
        req.body.quotation_remark === "" ||
        req.body.quotation_remark === undefined
    ) {
        req.body.quotation_remark = null;
    }

    const newQuotationData = new quotationModel(req.body);
    try {
        const genDocumentIdResult = await genDocumentId("QA", "quotation");
        itemValidation.validateItemSale(newQuotationData.quotation_data);
        newQuotationData.quotation_document_id = genDocumentIdResult.document_id;
        newQuotationData.quotation_status = "draft";
        newQuotationData.quotation_stage = null;
        newQuotationData.revision_id = 0;

        if (req.body.ref_document_id) {
            newQuotationData.ref_document_id = req.body.ref_document_id;
            const engineerResult = await engineerModel.getByDocumentId(req.body.ref_document_id);
            if (engineerResult && engineerResult[0] && engineerResult[0].id) {
                await engineerModel.updateByDocumentId(
                    req.body.ref_document_id,
                    { is_open_quotation: true },
                    engineerResult[0].revision_id,
                    req.user);
            }
        }

        const result = await quotationModel.create(newQuotationData, req.user);

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
                `สร้าง Revision ที่ 0`,
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
        req.body.quotation_template_remark_id === "" ||
        req.body.quotation_template_remark_id === undefined
    ) {
        req.body.quotation_template_remark_id = null;
    }

    if (
        req.body.quotation_remark === "" ||
        req.body.quotation_remark === undefined
    ) {
        req.body.quotation_remark = null;
    }

    try {
        if (req.body.quotation_status === undefined || req.body.quotation_status === null || req.body.quotation_status === "") {
            throw new Error(`quotation_status is not value`);
        }

        if (!req.body.revision_id && req.body.quotation_document_id) {
            const quotationResult = await quotationModel.getByDocumentId(req.body.quotation_document_id);

            if (quotationResult && quotationResult.length > 0) {
                const latestQuotationRevisionId = quotationResult[0].revision_id;
                const newQuotationData = new quotationModel(req.body);
                itemValidation.validateItemSale(newQuotationData.quotation_data);
                newQuotationData.revision_id = latestQuotationRevisionId + 1;


                const result = await quotationModel.create(newQuotationData, req.user);

                if (req.body.billing_info) {
                    await addDocumentActivity(
                        req.body.billing_info.project_id,
                        req.body.quotation_id,
                        documentName,
                        req.body.quotation_document_id,
                        documentCategory,
                        `แก้ Revision ที่ ${latestQuotationRevisionId + 1}`,
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result,
                });
            }
        }

        const newData = new quotationModel(req.body);
        itemValidation.validateItemSale(newData.quotation_data);
        const result = await quotationModel.updateById(
            req.params.quotation_id,
            newData,
            req.user
        );

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.quotation_id,
                documentName,
                req.body.quotation_document_id,
                documentCategory,
                `แก้ไข Revision ที่ ${req.body.revision_id}`,
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

exports.updateByDocumentId = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    if (
        req.body.quotation_template_remark_id === "" ||
        req.body.quotation_template_remark_id === undefined
    ) {
        req.body.quotation_template_remark_id = null;
    }

    if (
        req.body.quotation_remark === "" ||
        req.body.quotation_remark === undefined
    ) {
        req.body.quotation_remark = null;
    }

    try {
        if (req.body.quotation_status === undefined || req.body.quotation_status === null || req.body.quotation_status === "") {
            throw new Error(`quotation_status is not value`);
        }
        let revisionId;
        if (!req.query.revision_id) {
            revisionId = await quotationModel.getByDocumentId(req.params.quotation_document_id);
        } else {
            revisionId = req.query.revision_id;
        }
        const newData = new quotationModel(req.body);
        itemValidation.validateItemSale(newData.quotation_data);
        const result = await quotationModel.updateByDocumentId(
            req.params.quotation_document_id,
            revisionId,
            newData,
            req.user
        );

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.quotation_id,
                documentName,
                req.body.quotation_document_id,
                documentCategory,
                `แก้ไข Revision ที่ ${req.query.revision_id}`,
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

exports.updateNewRevisionByDocumentId = async (req, res) => {
    try {
        const quotationResult = await quotationModel.getByDocumentId(req.body.quotation_document_id);
        const latestQuotationRevisionId = quotationResult[0].revision_id;
        const newQuotationData = new quotationModel(req.body);
        itemValidation.validateItemSale(newQuotationData.quotation_data);
        newQuotationData.revision_id = latestQuotationRevisionId + 1;

        const result = await quotationModel.create(newQuotationData, req.user);

        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                req.params.quotation_document_id,
                documentCategory,
                `สร้าง Revision ที่ ${latestQuotationRevisionId + 1}`,
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
    try {
        req.body.quotation_status = "wait_approve";
        if (req.body.quotation_id !== undefined) {
            const newQuotationData = new quotationModel(req.body);
            itemValidation.validateItemSale(newQuotationData.quotation_data);

            const result = await quotationModel.updateById(
                req.body.quotation_id,
                newQuotationData,
                req.user
            );

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.quotation_id,
                    documentName,
                    req.body.quotation_document_id,
                    documentCategory, `รออนุมัติ Revision ที่ ${req.body.revision_id}`,
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        } else {
            const newQuotationData = new quotationModel(req.body);
            itemValidation.validateItemSale(newQuotationData.quotation_data);
            const genDocumentIdResult = await genDocumentId("QA", "quotation");
            newQuotationData.quotation_document_id = genDocumentIdResult.document_id;
            newQuotationData.revision_id = 1;
            newQuotationData.quotation_stage = null;
            if (newQuotationData.quotation_approveby_employee === "") {
                newQuotationData.quotation_approveby_employee = null;
            }

            if (
                newQuotationData.quotation_accept_date === "" ||
                newQuotationData.quotation_accept_date === undefined
            ) {
                newQuotationData.quotation_accept_date = null;
            }
            if (
                newQuotationData.quotation_template_remark_id === "" ||
                newQuotationData.quotation_template_remark_id === undefined
            ) {
                newQuotationData.quotation_template_remark_id = null;
            }
            const result = await quotationModel.create(newQuotationData, req.user);

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
                    `สร้าง Revision ที่ 1`,
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "รออนุมัติ Revision ที่ 1",
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
    try {
        if (req.body.quotation_id === undefined) {
            if (
                req.body.quotation_approveby === undefined &&
                req.body.quotation_approveby_employee === undefined
            ) {
                req.body.quotation_approveby = null;
                req.body.quotation_approveby_employee = null;
            }

            if (req.body.quotation_accept_date === undefined) {
                req.body.quotation_accept_date = null;
            }

            if (
                req.body.quotation_template_remark_id === "" ||
                req.body.quotation_template_remark_id === undefined
            ) {
                req.body.quotation_template_remark_id = null;
            }

            if (
                req.body.quotation_remark === "" ||
                req.body.quotation_remark === undefined
            ) {
                req.body.quotation_remark = null;
            }

            const newQuotationData = new quotationModel(req.body);
            itemValidation.validateItemSale(newQuotationData.quotation_data);
            const genDocumentIdResult = await genDocumentId("QA", "quotation");
            newQuotationData.quotation_document_id = genDocumentIdResult.document_id;
            newQuotationData.quotation_status = "wait_accept";
            newQuotationData.revision_id = 1;
            newQuotationData.quotation_approveby = req.user.employee_id;
            newQuotationData.quotation_approveby_employee = JSON.stringify(req.user);

            const result = await quotationModel.create(newQuotationData, req.user);

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
                    `สร้าง Revision ที่ 1`,
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "อนุมัติ Revision ที่ 1",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        } else {
            req.body.quotation_status = "wait_accept";

            const newQuotationData = new quotationModel(req.body);
            itemValidation.validateItemSale(newQuotationData.quotation_data);
            newQuotationData.quotation_approveby = req.user.employee_id;
            newQuotationData.quotation_approveby_employee = JSON.stringify(req.user);

            const result = await quotationModel.updateById(
                req.body.quotation_id,
                newQuotationData,
                req.user
            );

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.quotation_id,
                    documentName,
                    req.body.quotation_document_id,
                    documentCategory,
                    `อนุมัติ Revision ที่ ${req.body.revision_id}`,
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

exports.notApprove = async (req, res) => {
    try {
        const result = await quotationModel.updateById(
            req.params.quotation_id,
            { quotation_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null },
            req.user
        );

        const quotationResult = await quotationModel.getById(req.params.quotation_id);

        //create project activity
        if (quotationResult.billing_info) {
            await addDocumentActivity(
                quotationResult.billing_info.project_id,
                quotationResult.quotation_id,
                documentName,
                quotationResult.quotation_document_id,
                documentCategory,
                `req.body.not_approve_reason || ไม่อนุมัติ Revision ที่ ${req.body.revision_id}`,
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
exports.accept = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    const mysql = await db.getConnection();
    await mysql.beginTransaction();
    try {
        const quotationData = {
            quotation_status: "accepted",
            quotation_stage: "quotation",
            quotation_accept_date: req.body.quotation_accept_date,
        };
        const result = await quotationModel.updateById(
            req.params.quotation_id,
            quotationData,
            req.user
        );

        const quotationResult = await quotationModel.getById(req.params.quotation_id);

        if (req.body.attachment_list.length !== 0) {
            for (let attachment of req.body.attachment_list) {
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "quotation";
                newAttachmentData.ref_id = quotationResult.quotation_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                await attachmentModel.create(newAttachmentData, req.user);
            }
        }

        //create project activity
        if (quotationResult.billing_info) {
            await addDocumentActivity(
                quotationResult.billing_info.project_id,
                quotationResult.quotation_id,
                documentName,
                quotationResult.quotation_document_id,
                documentCategory,
                `ยอมรับ Revision ที่ ${quotationResult.revision_id}`,
                req.user);
        }

        await mysql.commit();
        await mysql.release();
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
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

exports.copyDocument = async (req, res) => {
    try {
        const quotationResult = await quotationModel.getById(req.params.quotation_id);
        if (quotationResult !== undefined) {
            let result = {
                billing_info: quotationResult.billing_info,
                sale_list: quotationResult.sale_list,
                quotation_data: quotationResult.quotation_data,
                quotation_template_remark_id: quotationResult.quotation_template_remark_id,
                quotation_remark: quotationResult.quotation_remark,
                shipping_cost: quotationResult.shipping_cost,
                additional_discount: quotationResult.additional_discount,
                vat_exempted_amount: quotationResult.vat_exempted_amount,
                vat_0_amount: quotationResult.vat_0_amount,
                vat_7_amount: quotationResult.vat_7_amount,
                vat_amount: quotationResult.vat_amount,
                net_amount: quotationResult.net_amount,
                withholding_tax: quotationResult.withholding_tax,
                total_amount: quotationResult.total_amount,
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
        const quotation_data = await quotationModel.getById(
            req.params.quotation_id
        );

        if (quotation_data !== undefined) {
            quotation_data.quotation_issue_date = moment(
                quotation_data.quotation_issue_date
            ).format("DD/MM/YYYY");
            quotation_data.quotation_valid_until_date = moment(
                quotation_data.quotation_valid_until_date
            ).format("DD/MM/YYYY");
            quotation_data.billing_info.address =
                quotation_data.billing_info.address === ""
                    ? "-"
                    : quotation_data.billing_info.address;
            const pdf_name = `${quotation_data.quotation_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(quotationTemplate(quotation_data), {
                format: "A4",
                directory: ".",
                filename: pdf_path,
            });

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

exports.generateSalesOrderData = async (req, res) => {

    try {
        const quotationResult = await quotationModel.getById(
            req.params.quotation_id
        );
        if (quotationResult !== undefined) {
            if (quotationResult.quotation_status === "accepted") {
                let result = {
                    quotation_document_id: quotationResult.quotation_document_id,
                    sales_order_stage: quotationResult.quotation_stage,
                    billing_info: quotationResult.billing_info,
                    sales_order_data: quotationResult.quotation_data,
                    sale_list: quotationResult.sale_list,
                    sales_order_template_remark_id: quotationResult.quotation_template_remark_id,
                    sales_order_remark: quotationResult.quotation_remark,
                    shipping_cost: quotationResult.shipping_cost,
                    additional_discount: quotationResult.additional_discount,
                    vat_exempted_amount: quotationResult.vat_exempted_amount,
                    vat_0_amount: quotationResult.vat_0_amount,
                    vat_7_amount: quotationResult.vat_7_amount,
                    vat_amount: quotationResult.vat_amount,
                    net_amount: quotationResult.net_amount,
                    withholding_tax: quotationResult.withholding_tax,
                    total_amount: quotationResult.total_amount,
                };
                return res.send({
                    status: "success",
                    data: result,
                });
            } else if (quotationResult.quotation_status === "closed") {
                throw new Error(`เอกสารอยู่ในสถานะเสร็จสิ้นแล้ว`);
            } else {
                return res.status(400).send({
                    status: "error",
                    message: `รหัสเอกสาร ${req.params.quotation_document_id} ยังไม่ถูกตอบรับ`,
                });
            }
        } else {
            return res.status(400).send({
                status: "error",
                message: `ไม่มีรหัสเอกสาร ${req.params.quotation_document_id}`,
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
        const quotationResult = await quotationModel.getById(req.params.quotation_id);

        if (quotationResult !== undefined) {
            let salesOrderListResult = await salesOrderModel.getByQuotationDocumentId(quotationResult.quotation_document_id);

            salesOrderListResult = await salesOrderListResult.filter((so) => so.sales_order_status !== "cancelled");

            if (salesOrderListResult.length === 0) {
                const result = await quotationModel.updateById(quotationResult.quotation_id, { quotation_status: "cancelled" }, req.user);

                //create project activity
                if (quotationResult.billing_info.project_id) {
                    await addDocumentActivity(
                        quotationResult.billing_info.project_id,
                        quotationResult.quotation_id,
                        documentName,
                        quotationResult.quotation_document_id,
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
                throw new Error('กรุณายกเลิกเอกสารที่เกี่ยวข้อง');
            }
        } else {
            throw new Error('ไม่พบเอกสาร');
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
