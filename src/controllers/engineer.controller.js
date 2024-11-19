const moment = require("moment");
const engineerModel = require('../models/engineer.model');
const attachmentModel = require('../models/attachment.model');
const employeeModel = require('../models/employee.model');

const { addDocumentActivity } = require("../utils/activity");
const generator = require('../utils/generate');
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");
const documentName = ActivityRefTypeEnum.ENGINEER;
const documentCategory = ActivityDocumentCategory.ENGINEER;

const authUtil = require("../utils/auth");
const { filterQuery, formatQuery, formatFulltextSearch } = require("../utils/sqlmapper");

const engineerKeys = [
    "engineer_id",
    "revision_id",
    "revision_name",
    "engineer_document_id",
    "engineer_status",
    "engineer_issue_date",
    "engineer_in_date",
    "engineer_start_date",
    "engineer_end_date",
    "engineer_list",
    "project_info",
    "reproduction",
    "installation",
    "adjustment",
    "job_project_type",
    "job_description",
    "job_priority",
    "delivery_method",
    "delivery_count",
    "delivery_floor",
    "delivery_scaffold",
    "delivery_cartage_method",
    "engineer_data",
    "input_attachments",
    "deliver_attachments",
    "remark_attachments",
    "is_open_quotation",
    "engineer_remark",
    "not_approve_reason",
];

exports.getAll = async (req, res) => {
    try {
        let result = await engineerModel.getAll();
        let employeePromiseList = result.map((engineer) => employeeModel.getByDocumentId(engineer.created_by));
        let employeeList = await Promise.all(employeePromiseList);
        for (let i = 0; i < result.length; i++) {
            delete employeeList['employee_password'];
            result[i].created_by_employee = employeeList[i];
        }
        return res.send({ status: 'success', data: result });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.getByDocumentId = async (req, res) => {
    try {
        let result;
        const key = ['input_attachments', 'deliver_attachments', 'remark_attachments', 'created_by_employee'];
        if (!req.query.revision_id) {
            result = await engineerModel.getByDocumentId(req.params.engineer_document_id);
            result = result[0];
            result.revision_list = await engineerModel.getRevisionByDocumentId(req.params.engineer_document_id);
        } else {
            result = await engineerModel.getByDocumentIdRevisionId(req.params.engineer_document_id, req.query.revision_id);
        }
        let promiseFunction = [
            result.input_attachments && result.input_attachments.length > 0 ? attachmentModel.getByIdList(result.input_attachments) : [],
            result.deliver_attachments && result.deliver_attachments.length > 0 ? attachmentModel.getByIdList(result.deliver_attachments) : [],
            result.remark_attachments && result.remark_attachments.length > 0 ? attachmentModel.getByIdList(result.remark_attachments) : [],
            employeeModel.getByDocumentId(result.created_by)
        ];
        let resultList = await Promise.all(promiseFunction);
        for (let i = 0; i < key.length; i++) {
            result[key[i]] = resultList[i];
        }
        result.created_by_employee = authUtil.getCleanUser(result.created_by_employee);

        return res.send({ status: 'success', data: result });

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.getById = async (req, res) => {
    try {
        let result = await engineerModel.getById(req.params.id);
        const key = ['input_attachments', 'deliver_attachments', 'remark_attachments', 'created_by_employee'];
        let promiseFunction = [
            attachmentModel.getByIdList(result.input_attachments),
            attachmentModel.getByIdList(result.deliver_attachments),
            attachmentModel.getByIdList(result.remark_attachments),
            employeeModel.getByDocumentId(result.created_by)
        ];
        let resultList = await Promise.all(promiseFunction);
        for (let i = 0; i < key.length; i++) {
            result[key[i]] = resultList[i];
        }
        return res.send({ status: 'success', data: result[0] });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.create = async (req, res) => {
    try {
        let newEngineerData = new engineerModel(req.body);
        newEngineerData.engineer_document_id = (await generator.genDocumentId("EN", "engineer")).document_id;
        newEngineerData.revision_id = 0;
        let inputAttachmentList = [];
        if (req.body.input_attachments && req.body.input_attachments.length !== 0) {
            let inputAttachmentListResult = await Promise.all(req.body.input_attachments.map((attachment) => {
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                // newAttachmentData.ref_id = engieerCreateResult.insertId;
                newAttachmentData.ref_document_id = newEngineerData.engineer_document_id;
                return attachmentModel.create(newAttachmentData, req.user);
            }));
            inputAttachmentList = inputAttachmentListResult.map((insertedResult) => insertedResult.insertId);
        }
        newEngineerData.input_attachments = inputAttachmentList;
        newEngineerData.deliver_attachments = [];
        newEngineerData.remark_attachments = [];
        const engieerCreateResult = await engineerModel.create(newEngineerData, req.user);
        // await engineerModel.updateByDocumentIdCustom(newEngineerData.engineer_document_id, { input_attachment: inputAttachmentList }, req.user);
        engieerCreateResult.engineer_document_id = newEngineerData.engineer_document_id;
        if (newEngineerData.project_id) {
            await addDocumentActivity(
                newEngineerData.project_id,
                engieerCreateResult.insertId,
                documentName,
                newEngineerData.engineer_document_id,
                documentCategory,
                "สร้าง",
                req.user);
        }
        return res.send({ status: 'success', data: engieerCreateResult });
    } catch (error) {
        console.trace(error);
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.fullFilterTotalRow = async (req, res) => {
    try {
        let sql =
            filterQuery(" where 1 ", req.body.filterModel) + ' AND ' +
            formatFulltextSearch(engineerKeys, req.body.search);
        let result = await engineerModel.fullFilterTotalRow(sql);
        return res.send({ status: 'success', data: result });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.fullFilter = async (req, res) => {
    try {
        let result = await engineerModel.fullFilter(formatQuery("where 1 ", req.body.filterModel, req.body.sortModel, req.body.pageModel, engineerKeys, req.body.search));
        return res.send({ status: 'success', data: result });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.updateByDocumentId = async (req, res) => {
    try {
        let previousResult = await engineerModel.getByDocumentId(req.params.engineer_document_id);
        if (!previousResult || previousResult.length === 0) {
            throw new Error('no document found');
        }
        previousResult = previousResult[0];
        let newEngineerData = new engineerModel(req.body);
        let inputAttachmentList = [];
        let deliverAttachmentList = [];
        let remarkAttachmentList = [];
        // let attachmentDeleteResult = deliverAttachmentList.length + remarkAttachmentList.length !== 0 ?
        //     await attachmentModel.deleteByCondition(`attachment_id in ${[...deliverAttachmentList, ...remarkAttachmentList]}`) | [] : [];
        let attachementResult = [[], [], []];
        if (req.body.input_attachments && req.body.input_attachments.length !== 0) {
            for (let attachment of req.body.input_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    inputAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[0].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (req.body.deliver_attachments && req.body.deliver_attachments.length !== 0) {
            for (let attachment of req.body.deliver_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    deliverAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[1].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (req.body.remark_attachments && req.body.remark_attachments.length !== 0) {
            for (let attachment of req.body.remark_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    remarkAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[2].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (!req.body.revision_id) {
            newEngineerData.revision_id = previousResult.revision_id;
        } else {
            newEngineerData.revision_id = req.body.revision_id;
        }
        attachementResult = await Promise.all(attachementResult.map((result) => Promise.all(result)));
        newEngineerData.input_attachments = [...inputAttachmentList, ...attachementResult[0].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.deliver_attachments = [...deliverAttachmentList, ...attachementResult[1].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.remark_attachments = [...remarkAttachmentList, ...attachementResult[2].map((insertedResult) => insertedResult.insertId)];
        let engieerUpdateResult = await engineerModel.updateByDocumentId(req.params.engineer_document_id, newEngineerData, newEngineerData.revision_id, req.user);
        if (newEngineerData.project_id) {
            await addDocumentActivity(
                newEngineerData.project_id,
                engieerUpdateResult.insertId,
                documentName,
                newEngineerData.engineer_document_id,
                documentCategory,
                "แก้ไข",
                req.user);
        }
        return res.send({ status: 'success', data: engieerUpdateResult });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.updateNewRevisionByDocumentId = async (req, res) => {
    try {
        let previousResult = await engineerModel.getByDocumentId(req.params.engineer_document_id);
        if (!previousResult || previousResult.length === 0) {
            throw new Error('no document found');
        }
        previousResult = previousResult[0];
        let newEngineerData = new engineerModel(req.body);
        let inputAttachmentList = [];
        let deliverAttachmentList = [];
        let remarkAttachmentList = [];
        // let attachmentDeleteResult = deliverAttachmentList.length + remarkAttachmentList.length !== 0 ?
        //     await attachmentModel.deleteByCondition(`attachment_id in ${[...deliverAttachmentList, ...remarkAttachmentList]}`) | [] : [];
        let attachementResult = [[], [], []];
        if (req.body.input_attachments && req.body.input_attachments.length !== 0) {
            for (let attachment of req.body.input_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    inputAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[0].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (req.body.deliver_attachments && req.body.deliver_attachments.length !== 0) {
            for (let attachment of req.body.deliver_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    deliverAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[1].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (req.body.remark_attachments && req.body.remark_attachments.length !== 0) {
            for (let attachment of req.body.remark_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    remarkAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[2].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        attachementResult = await Promise.all(attachementResult.map((result) => Promise.all(result)));
        newEngineerData.engineer_document_id = previousResult.engineer_document_id;
        newEngineerData.input_attachments = [...inputAttachmentList, ...attachementResult[0].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.deliver_attachments = [...deliverAttachmentList, ...attachementResult[1].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.remark_attachments = [...remarkAttachmentList, ...attachementResult[2].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.revision_id = previousResult.revision_id + 1;
        let engineerNewRevision = await engineerModel.create(newEngineerData, req.user);
        engineerNewRevision.engineer_document_id = newEngineerData.engineer_document_id;
        if (newEngineerData.project_id) {
            await addDocumentActivity(
                newEngineerData.project_id,
                engineerNewRevision.insertId,
                documentName,
                newEngineerData.engineer_document_id,
                documentCategory,
                `สร้าง Revision ที่ ${previousResult.revision_id + 1}`,
                req.user);
        }
        return res.send({ status: 'success', data: engineerNewRevision });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.jobApprove = async (req, res) => {
    try {
        let previousResult = await engineerModel.getByDocumentId(req.params.engineer_document_id);
        if (!previousResult || previousResult.length === 0) {
            throw new Error('no document found');
        }
        previousResult = previousResult[0];
        let newEngineerData = new engineerModel(req.body);
        let inputAttachmentList = [];
        let remarkAttachmentList = [];
        // let attachmentDeleteResult = deliverAttachmentList.length + remarkAttachmentList.length !== 0 ?
        //     await attachmentModel.deleteByCondition(`attachment_id in ${[...deliverAttachmentList, ...remarkAttachmentList]}`) | [] : [];
        let attachementResult = [[], [], []];
        if (req.body.input_attachments && req.body.input_attachments.length !== 0) {
            for (let attachment of req.body.input_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    inputAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[0].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (req.body.remark_attachments && req.body.remark_attachments.length !== 0) {
            for (let attachment of req.body.remark_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    remarkAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[2].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        attachementResult = await Promise.all(attachementResult);
        newEngineerData.revision_id = previousResult.revision_id;
        newEngineerData.input_attachments = [...inputAttachmentList, ...attachementResult[0].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.remark_attachments = [...remarkAttachmentList, ...attachementResult[2].map((insertedResult) => insertedResult.insertId)];
        newEngineerData._job_approved_by = req.user.employee_document_id;
        newEngineerData._job_approved_date = moment().tz("Asia/Bangkok").unix();
        let engineerNewRevision = await engineerModel.updateByDocumentId(req.params.engineer_document_id, newEngineerData, newEngineerData.revision_id, req.user);
        engineerNewRevision.engineer_document_id = newEngineerData.engineer_document_id;
        if (newEngineerData.project_id) {
            await addDocumentActivity(
                newEngineerData.project_id,
                engineerNewRevision.insertId,
                documentName,
                newEngineerData.engineer_document_id,
                documentCategory,
                `งานอนุมัติ Revision ที่ ${previousResult.revision_id}`,
                req.user);
        }
        return res.send({ status: 'success', data: engineerNewRevision });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.reviewApprove = async (req, res) => {
    try {
        let previousResult = await engineerModel.getByDocumentId(req.params.engineer_document_id);
        if (!previousResult || previousResult.length === 0) {
            throw new Error('no document found');
        }
        previousResult = previousResult[0];
        let newEngineerData = new engineerModel(req.body);
        let deliverAttachmentList = [];
        let remarkAttachmentList = [];
        // let attachmentDeleteResult = deliverAttachmentList.length + remarkAttachmentList.length !== 0 ?
        //     await attachmentModel.deleteByCondition(`attachment_id in ${[...deliverAttachmentList, ...remarkAttachmentList]}`) | [] : [];
        let attachementResult = [[], [], []];

        if (req.body.deliver_attachments && req.body.deliver_attachments.length !== 0) {
            for (let attachment of req.body.deliver_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    deliverAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[1].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        if (req.body.remark_attachments && req.body.remark_attachments.length !== 0) {
            for (let attachment of req.body.remark_attachments) {
                if (Object.prototype.hasOwnProperty.call(attachment, 'attachment_id')) {
                    remarkAttachmentList.push(attachment.attachment_id);
                    continue;
                }
                const newAttachmentData = new attachmentModel(attachment);
                newAttachmentData.attachment_type = "engineer";
                newAttachmentData.ref_id = previousResult.engineer_id;
                newAttachmentData.ref_document_id = previousResult.engineer_document_id;
                newAttachmentData.attachment_remark = req.body.attachment_remark;
                attachementResult[2].push(attachmentModel.create(newAttachmentData, req.user));
            }
        }
        attachementResult = await Promise.all(attachementResult);

        newEngineerData.revision_id = previousResult.revision_id;
        newEngineerData.deliver_attachments = [...deliverAttachmentList, ...attachementResult[1].map((insertedResult) => insertedResult.insertId)];
        newEngineerData.remark_attachments = [...remarkAttachmentList, ...attachementResult[2].map((insertedResult) => insertedResult.insertId)];

        newEngineerData._review_approved_by = req.user.employee_document_id;
        newEngineerData._review_approved_date = moment().tz("Asia/Bangkok").unix();
        let engineerNewRevision = await engineerModel.updateByDocumentId(req.params.engineer_document_id, newEngineerData, req.user);
        engineerNewRevision.engineer_document_id = newEngineerData.engineer_document_id;
        if (newEngineerData.project_id) {
            await addDocumentActivity(
                newEngineerData.project_id,
                engineerNewRevision.insertId,
                documentName,
                newEngineerData.engineer_document_id,
                documentCategory,
                `การประมาณอนุมัติ Revision ที่ ${previousResult.revision_id}`,
                req.user);
        }
        return res.send({ status: 'success', data: engineerNewRevision });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.deleteByDocumentId = async (req, res) => {
    try {
        const previousResult = await engineerModel.getByDocumentId(req.params.engineer_document_id);
        const deleteResult = await engineerModel.deleteByDocumentId(req.params.engineer_document_id, req.user);
        return res.send({ status: 'success', data: deleteResult });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
