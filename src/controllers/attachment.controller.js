const attachmentModel = require("../models/attachment.model");
const employeeModel = require("../models/employee.model");

exports.getAll = async (req, res) => {
    try {
        let result;
        if (req.query.project_id) result = await attachmentModel.getByRefId(req.query.project_id, "project");
        else if (req.query.warranty_id) result = await attachmentModel.getByRefId(req.query.warranty_id, "warranty");
        else if (req.query.contact_id) result = await attachmentModel.getByRefId(req.query.contact_id, "contact");
        else result = await attachmentModel.getAll();

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

exports.getById = async (req, res) => {
    try {
        const result = await attachmentModel.getById(req.params.id);

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

exports.getByTypeAndRefId = async (req, res) => {
    try {
        const result = await attachmentModel.getByRefId(req.params.ref_id, req.params.type);

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
    const newData = new attachmentModel(req.body);
    try {
        const result = await attachmentModel.create(newData, req.user);
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
    const newData = new attachmentModel(req.body);
    try {
        const result = await attachmentModel.update(req.params.id, newData);
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
        const result = await attachmentModel.delete(req.params.id);
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
