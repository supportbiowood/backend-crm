const warrantyModel = require("../models/warranty.model");
const employeeModel = require("../models/employee.model");
const attachmentModel = require("../models/attachment.model");
const moment = require("moment");
exports.getAll = async (req, res) => {
    try {
        let warrantyResultList;
        if (req.query.project_id) {
            warrantyResultList = await warrantyModel.getDetailedByProjectId(req.query.project_id);
        }
        else {
            warrantyResultList = await warrantyModel.getDetailedAll();
        }
        let promiseArray = warrantyResultList.map(
            (warrantyResult) => {
                return attachmentModel.getByRefId(warrantyResult.warranty_id, "warranty");
            });
        let promiseResult = await Promise.all(promiseArray);
        for (let i = 0; i < promiseResult.length; i++) {
            warrantyResultList[i].attachment = promiseResult[i];
        }
        return res.send({
            status: "success",
            data: warrantyResultList,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const warrantyResult = await warrantyModel.getDetailedById(req.params.id);
        warrantyResult.attachment = await attachmentModel.getByRefId(warrantyResult.warranty_id, "warranty");
        return res.send({
            status: "success",
            data: warrantyResult,
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
    const newData = new warrantyModel(req.body);
    try {
        const result = await warrantyModel.create(newData);
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
    try {
        if (req.body.warranty_status === "approved") {
            let employeeResult = await employeeModel.getById(req.user.employee_id);
            req.body.warranty_approver_name = "" + req.user.employee_firstname + " " + req.user.employee_lastname;
            req.body.warranty_approver_document_id = employeeResult.employee_id;
            req.body.warranty_approve_date = moment().unix();
        }
        const result = await warrantyModel.update(req.params.id, req.body);
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

exports.delete = async (req, res) => {
    try {
        const result = await warrantyModel.delete(req.params.id);
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
