const remarkTemplateModel = require("../models/remarkTemplate.model");

exports.getAll = async (req, res) => {
    try {
        const result = await remarkTemplateModel.getAll();

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
        const result = await remarkTemplateModel.getById(req.params.id);

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
    try {
        const newRemarkTemplateData = new remarkTemplateModel(req.body);
        const result = await remarkTemplateModel.create(
            newRemarkTemplateData,
            req.user
        );

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
        const newRemarkTemplateData = new remarkTemplateModel(req.body);
        const result = await remarkTemplateModel.update(
            req.params.id,
            newRemarkTemplateData,
            req.user
        );

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
        const result = await remarkTemplateModel.delete(req.params.id);

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
