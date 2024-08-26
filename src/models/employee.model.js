const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");
const utils = require("../utils/auth");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

let Employee = function (data) {
    this.employee_firstname = data.employee_firstname;
    this.employee_lastname = data.employee_lastname;
    this.employee_email = data.employee_email;
    this.employee_phone = data.employee_phone;
    this.employee_img_url = data.employee_img_url;
    this.employee_department = data.employee_department;
    this.employee_position = data.employee_position;
    this.employee_status = data.employee_status;
};

let model = "employee";

Employee.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM employee");

        result[0].forEach((element) => {
            delete element.employee_password;
        });
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Employee.getById = async (employee_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM employee WHERE employee_id = ?",
            [employee_id]
        );
        return result[0][0];
    } catch (error) {
        throw new Error(`${model} model getById ${error}`);
    }
};

Employee.getByDocumentId = async (employee_document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM employee WHERE employee.employee_document_id = ?",
            [employee_document_id]
        );
        // console.log(model + " model get success", result);
        if (result[0].length !== 0) {
            delete result[0][0]["employee_password"];
        }
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Employee.getByProjectId = async (project_id) => {
    try {
        let sql =
            "SELECT project_employee.project_employee_id, project_employee.role, project_employee.project_id, employee.* \
         FROM employee INNER JOIN project_employee ON employee.employee_id = project_employee.employee_id \
         WHERE project_employee.project_id = ?";
        const result = await db.query(
            sql,
            [project_id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Employee.getByProjectDocumentId = async (project_document_id) => {
    try {
        let sql =
            "SELECT project_employee.project_employee_id, project_employee.role, project_employee.project_id, employee.* \
         FROM employee INNER JOIN project_employee ON employee.employee_id = project_employee.employee_id \
         WHERE project_employee.project_document_id = ?";
        const result = await db.query(
            sql,
            [project_document_id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Employee.getByEmail = async (email) => {
    try {
        const result = await db.query(
            "SELECT * FROM employee WHERE employee.employee_email = ? AND employee.employee_status = 'active'",
            [email]
        );
        // console.log(model + " model get success", result);
        if (!result) {
            delete result[0][0]["employee_password"];
        }
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Employee.create = async (data, _employee_createdby) => {
    data._employee_created = moment().tz("Asia/Bangkok").unix();
    data._employee_createdby = _employee_createdby.employee_document_id;
    data._employee_createdby_employee = JSON.stringify(_employee_createdby);
    try {
        const result = await db.query("INSERT INTO `employee` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Employee.update = async (
    employee_document_id,
    data,
    _employee_lastupdateby
) => {
    data._employee_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._employee_lastupdateby = _employee_lastupdateby.employee_document_id;
    data._employee_lastupdateby_employee = JSON.stringify(_employee_lastupdateby);
    try {
        let sql = "UPDATE employee SET ? WHERE employee.employee_document_id = ?";
        const result = await db.query(sql, [data, employee_document_id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
Employee.updateLastLogin = async (document_id, data) => {
    try {
        const result = await db.query(
            "UPDATE employee SET employee._employee_lastlogin = ? WHERE employee.employee_document_id = ?",
            [data._employee_lastlogin, document_id]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Employee.updatePassword = async (
    employee_document_id,
    data,
    _employee_lastupdateby
) => {
    data._employee_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._employee_lastupdateby = _employee_lastupdateby.employee_document_id;
    data._employee_lastupdateby_employee = JSON.stringify(_employee_lastupdateby);
    try {
        const result = await db.query(
            "UPDATE employee SET employee.employee_password = ?, employee._employee_lastupdate = ?, employee._employee_lastupdateby = ?, employee._employee_lastupdateby_employee = ? WHERE employee.employee_document_id = ?",
            [
                data.employee_password,
                data._employee_lastupdate,
                data._employee_lastupdateby,
                data._employee_lastupdateby_employee,
                employee_document_id,
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Employee.delete = async (employee_document_id) => {
    try {
        const result = await db.query(
            "UPDATE employee SET employee.employee_status = 'inactive' WHERE employee.employee_document_id = ?",
            [employee_document_id]
        );
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = Employee;
