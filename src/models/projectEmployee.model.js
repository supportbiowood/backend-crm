const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ProjectEmployee = function (data) {
    this.role = data.role;
    this.project_id = data.project_id;
    this.project_document_id = data.project_document_id;
    this.employee_id = data.employee_id;
    this.employee_document_id = data.employee_document_id;
};

let model = "ProjectEmployee";

ProjectEmployee.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project_employee WHERE project_employee_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectEmployee.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project_employee WHERE project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0] || [];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectEmployee.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `project_employee` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

ProjectEmployee.update = async (id, data) => {
    try {
        let sql = "UPDATE project_employee SET ? WHERE project_employee_id = ?";
        const result = await db.query(
            sql,
            [
                data,
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

ProjectEmployee.delete = async (id) => {
    try {
        const result = await db.query(
            "DELETE FROM project_employee WHERE project_employee_id = ?",
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



module.exports = ProjectEmployee;
