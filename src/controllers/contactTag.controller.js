const contactTagModel = require("../models/contactTag.model");
const tagModel = require("../models/tag.model");

exports.getAll = async (req, res) => {
    try {
        const result = await contactTagModel.getAll();

        let tag_list = [];
        for(let tag of result){
            let tag_data = await tagModel.getById(tag.tag_id);
            tag_list.push(tag_data);
        }
        return res.send({
            status: "success",
            data: tag_list,
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
    const newData = new contactTagModel(req.body);
    try {
        const result = await contactTagModel.create(newData);
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
        const result = await contactTagModel.delete(req.params.contact_id, req.params.tag_id);
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
