const bcrypt = require("bcryptjs");
const employeeModel = require("../models/employee.model");
const roleModel = require("../models/role.model");
const employeeRoleModel = require("../models/employeeRole.model");
const employeeTeamModel = require("../models/employeeTeam.model");

const { genDocumentId } = require("../utils/generate");
const permissionManager = require("../utils/permission");
exports.getAll = async (req, res) => {
    try {
        const result = (await employeeModel.getAll()) || [];
        for (let employee of result) {
            delete employee["employee_password"];
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

exports.getByDocumentId = async (req, res) => {
    try {
        let employeeResult = await employeeModel.getByDocumentId(
            req.params.employee_document_id
        );

        if (employeeResult) {
            delete employeeResult["employee_password"];
            employeeResult.role = await employeeRoleModel.getByEmployeeDocumentId(
                employeeResult.employee_document_id
            );
            employeeResult.permission = permissionManager.matchPermissionObject(
                permissionManager.mergePermission(employeeResult.role)
            );
        } else {
            employeeResult = null;
        }
        return res.send({
            status: "success",
            data: employeeResult,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

/* this controller cannot be used
exports.getByEmployeeId = async (req, res) => {
    try {
        // this function somehow doesnt exist
        const result = await employeeModel.getByEmployeeId(req.params.id) || [];
        delete result["employee_password"];
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
*/

exports.getTeam = async (req, res) => {
    try {
        const employeeTeamResult = await employeeTeamModel.getTeamByEmployeeDocumentId(
            req.params.employee_document_id
        );
        return res.send({ status: "success", data: employeeTeamResult });
    } catch (error) {
        res.status(400).send({
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
    const newData = new employeeModel(req.body);
    newData.employee_status = "active";
    try {
        const employeeData = await employeeModel.getByEmail(
            req.body.employee_email
        );

        if (employeeData !== undefined) {
            return res.status(400).send({
                status: "error",
                message: `พบอีเมลในระบบ`,
            });
        }
        if (
            req.body.password !== undefined &&
            req.body.password !== null &&
            req.body.repassword !== undefined &&
            req.body.repassword !== null &&
            req.body.password === req.body.repassword
        ) {
            const genDocumentIdResult = await genDocumentId("EP", "employee");
            newData.employee_document_id = genDocumentIdResult.document_id;
            const createdEmployeeResult = await employeeModel.create(
                newData,
                req.user
            );
            newData.employee_password = bcrypt.hashSync(req.body.password, 10);
            await employeeModel.updatePassword(
                newData.employee_document_id,
                newData,
                req.user
            );
            let createEmployeeRoleResult;
            const possibleRoleResult = await roleModel.getByDocumentIdList(req.body.role_list);
            req.body.role_list = possibleRoleResult.map(role => role.role_document_id);
            if (req.body.role_list && req.body.role_list.length > 0) {
                createEmployeeRoleResult =
                    await employeeRoleModel.updateRoleListEmployee(
                        newData.employee_document_id, 
                        req.body.role_list
                    );
            }
            return res.send({
                status: "success",
                data: {
                    employee_result: createdEmployeeResult,
                    employee_role_result: createEmployeeRoleResult,
                },
            });
        } else {
            return res.status(400).send({
                status: "error",
                message: `รหัสผ่านไม่ถูกต้อง`,
            });
        }
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
    const newData = new employeeModel(req.body);
    try {
        const result = await employeeModel.update(
            req.params.employee_document_id,
            newData,
            req.user
        );
        let employeeRoleResult;
        const possibleRoleResult = req.body.role_list && req.body.role_list.length > 0 ? await roleModel.getByDocumentIdList(req.body.role_list) : [];
        req.body.role_list = req.body.role_list.filter((role_document_id) =>
            possibleRoleResult.some((roleResult) => roleResult.role_document_id === role_document_id)
        );
        employeeRoleResult =
            await employeeRoleModel.updateRoleListEmployee(
                req.params.employee_document_id,
                req.body.role_list
            );


        if (
            req.body.password !== undefined &&
            req.body.password !== null &&
            req.body.repassword !== undefined &&
            req.body.repassword !== null &&
            req.body.password === req.body.repassword
        ) {
            await employeeModel.updatePassword(
                req.params.employee_document_id,
                { employee_password: bcrypt.hashSync(req.body.password, 10) },
                req.user
            );
        }

        return res.send({
            status: "success",
            data: {
                employee_result: result,
                role_result: employeeRoleResult || null,
            },
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
        const result = await employeeModel.delete(req.params.employee_document_id);
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
