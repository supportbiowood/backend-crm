const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ProjectActivity = function(data) {
    this.project_id = data.project_id;
    this.activity_type = data.activity_type;
    this.activity_data = data.activity_data;
};

let model = "ProjectActivity";

ProjectActivity.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM project_activity");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectActivity.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project_activity WHERE project_activity.activity_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectActivity.getByProjectId = async (id) => {
    try {
    // const result = await db.query(
    //   "SELECT * FROM project_activity INNER JOIN project ON project_activity.project_id = project.project_id WHERE project.project_id = ?",
    //   [id]
    // );
        const result = await db.query(
            "SELECT * FROM project_activity WHERE project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectActivity.getByEmployeeId = async (id) => {
    try {
    // const result = await db.query(
    //   "SELECT * FROM project_activity INNER JOIN project ON project_activity.project_id = project.project_id WHERE project.project_id = ?",
    //   [id]
    // );
        const result = await db.query(
            "SELECT * FROM project_activity WHERE _project_activity_createdby = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectActivity.create = async (data, _createdby) => {
    data._project_activity_created = moment().tz("Asia/Bangkok").unix();
    data._project_activity_createdby = _createdby.employee_id;
    data._project_activity_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query(
            "INSERT INTO `project_activity` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

ProjectActivity.update = async (id, data, _lastupdateby) => {
    try {
        const result = await db.query(
            "UPDATE project_activity SET project_activity.project_id = ? , project_activity.activity_type =? , project_activity.activity_data = ? WHERE project_activity.activity_id = ?",
            [
                data.project_id,
                data.activity_type,
                data.activity_data,
                id
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

ProjectActivity.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM project_activity WHERE activity.activity_id = ?",
            [
                id
            ]
        );
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = ProjectActivity;
