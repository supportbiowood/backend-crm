const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ProjectStatusLog = function (data) {
    this.project_id = data.project_id;
    this.old_status = data.old_status;
    this.new_status = data.new_status;
    this.project_status_log_remark = data.project_status_log_remark;
    this._project_status_log_created = data._project_status_log_created;
    this._project_status_log_createdby = data._project_status_log_createdby;
};

let model = "project_status_log";

ProjectStatusLog.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project_status_log WHERE project_status_log_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectStatusLog.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project_status_log WHERE project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectStatusLog.create = async (data, _createdby) => {
    data._project_status_log_created = moment().tz("Asia/Bangkok").unix();
    data._project_status_log_createdby = _createdby.employee_document_id;
    data._project_status_log_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query("INSERT INTO `project_status_log` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

module.exports = ProjectStatusLog;
