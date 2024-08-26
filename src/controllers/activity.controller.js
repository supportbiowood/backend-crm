const moment = require("moment");
require("moment-timezone");

const activityModel = require("../models/activity.model");

exports.getAll = async (req, res) => {
    try {
        let result;
        if (req.query.owner_id) result = await activityModel.getByOwnerId(req.query.owner_id);
        else if (req.query.owner_type) result = await activityModel.getByOwnerType(req.query.owner_type);
        else result = await activityModel.getAll();

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
        const result = await activityModel.getById(req.params.id);

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

exports.getByDocumentId = async (req, res) => {
    try {
        const result = await activityModel.getByOwnerId(req.params.document_id);

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
        if (req.body.activity_data.file_list.length !== 0) {
            //add _file_created , _file_createdby, _file_createdby_employee
            for (let file of req.body.activity_data.file_list) {
                file._file_created = moment().tz("Asia/Bangkok").unix();
                file._file_createdby = req.user.employee_document_id;
                file._file_createdby_employee = req.user;
            }
        }

        const newData = new activityModel(req.body);
        newData.activity_data = JSON.stringify(newData.activity_data);
        const result = await activityModel.create(newData, req.user);
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
        const result = await activityModel.delete(req.params.id);
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
