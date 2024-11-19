const moment = require("moment");
require("moment-timezone");

const projectActivityModel = require("../models/projectActivity.model");
const employeeModel = require("../models/employee.model");
const contactModel = require("../models/contact.model");
const contactChannelModel = require("../models/contactChannel.model");

exports.getAll = async (req, res) => {
    try {
        let result;
        if (req.query.project_id) result = await projectActivityModel.getByProjectId(req.query.project_id);
        else if (req.query.employee_id) result = await projectActivityModel.getByEmployeeId(req.query.employee_id);
        else result = await projectActivityModel.getAll();

        // for(project_activity of result){
        //   if(project_activity.activity_type === 'status_change'){
        //     project_activity.activity_data.project_status_log._project_status_log_createdby = await employeeModel.getById(project_activity.activity_data.project_status_log._project_status_log_createdby);
        //   }

        //   project_activity._project_activity_createdby_employee = await employeeModel.getById(project_activity._project_activity_createdby);
        // }

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
        const result = await projectActivityModel.getById(req.params.id);

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

exports.getByProjectId = async (req, res) => {
    try {
        const result = await projectActivityModel.getByProjectId(req.params.id);
        if(result.length!==0){
            for(let project_activity of result){
                if(project_activity.activity_type === 'event'){
                    project_activity.activity_data.event.contact = await contactModel(project_activity.activity_data.event.contact_id);
                }
                // project_activity._project_activity_createdby_employee = await employeeModel.getById(project_activity._project_activity_createdby);
            }
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

exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        if(req.body.activity_data.file_list.length !== 0){
            //add _file_created , _file_createdby, _file_createdby_employee
            for(let file of req.body.activity_data.file_list){
                file._file_created = moment().tz("Asia/Bangkok").unix();
                file._file_createdby = req.user.employee_id;
                file._file_createdby_employee = req.user;
            }
        }

        const newData = new projectActivityModel(req.body);
        newData.activity_data = JSON.stringify(newData.activity_data);
        const result = await projectActivityModel.create(newData, req.user);
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
    const newData = new projectActivityModel(req.body);
    try {
        const result = await projectActivityModel.update(req.params.id, newData);
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
        const result = await projectActivityModel.delete(req.params.id);
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
