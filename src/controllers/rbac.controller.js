const roleModel = require("../models/role.model");
const employeeRoleModel = require("../models/employeeRole.model");
const db = require("../utils/database");
const permissionManager = require('../utils/permission');
const generator = require("../utils/generate");
exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    try {
        const newRole = new roleModel(req.body);
        newRole.permission_list = JSON.stringify(permissionManager.matchPermissionName(newRole.permission_list));
        newRole.role_document_id = (await generator.genDocumentId("RL", "Role")).document_id;
        const createdRoleResult = await roleModel.create(newRole);
        createdRoleResult.document_id = newRole.role_document_id;
        let createdEmployeeRoleResult;
        if (req.body.employee_list && req.body.employee_list.length > 0) {
            createdEmployeeRoleResult = await employeeRoleModel.updateEmployeeListToRole(req.body.employee_list, newRole.role_document_id);
        }
        return res.send(
            {
                status: "success",
                data: {
                    role_result: createdRoleResult,
                    role_employee_result: createdEmployeeRoleResult
                }
            });

    } catch (error) {
        console.trace(error);
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getRoleById = async (req, res) => {
    try {
        const roleResult = await roleModel.getById(req.params.role_id);
        const employeesRoleResult = await employeeRoleModel.getByRoleDocumentId(req.params.role_id);
        return res.send({
            status: "success", data: { role_result: roleResult, employee_result: employeesRoleResult }
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.getRoleByDocumentId = async (req, res) => {
    try {
        const roleResult = await roleModel.getByDocumentId(req.params.role_document_id);
        const employeesRoleResult = await employeeRoleModel.getByRoleDocumentId(req.params.role_document_id);
        return res.send({
            status: "success", data: { role_result: roleResult, employee_result: employeesRoleResult }
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.getAllPermission = async (req, res) => {
    try {
        return res.send({ status: "success", data: permissionManager.allPermission });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }

};

exports.getAllRole = async (req, res) => {
    try {
        return res.send({ status: "success", data: await roleModel.getAll() });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getAllEmployeesOfRole = async (req, res) => {
    try {
        const employeeList = await employeeRoleModel.getByRoleDocumentId(req.params.role_id);
        return res.send({
            status: "success",
            data: employeeList
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.updateRoleById = async (req, res) => {
    try {
        const newRoleData = new roleModel(req.body.role);
        newRoleData.permission_list = JSON.stringify(permissionManager.matchPermissionName(newRoleData.permission_list));
        const roleResult = await roleModel.updateById(req.params.role_id, newRoleData);
        const employeeRoleResult = await employeeRoleModel.updateEmployeeListToRole(
            req.body.employee_list && req.body.employee_list.length > 0 ? req.body.employee_list : [],
            req.params.role_id);
        return res.send({
            status: "success",
            data: { role_result: roleResult, employee_role_result: employeeRoleResult }
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.updateRoleByDocumentId = async (req, res) => {
    try {
        const newRoleData = new roleModel(req.body.role);
        newRoleData.permission_list = JSON.stringify(permissionManager.matchPermissionName(newRoleData.permission_list));
        const roleResult = await roleModel.updateByDocumentId(req.params.role_document_id, newRoleData);
        const employeeRoleResult = await employeeRoleModel.updateEmployeeListToRole(
            req.body.employee_list && req.body.employee_list.length > 0 ? req.body.employee_list : [],
            req.params.role_document_id);
        return res.send({
            status: "success",
            data: { role_result: roleResult, employee_role_result: employeeRoleResult }
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.deleteRoleById = async (req, res) => {
    const mysql = await db.getConnection();
    await mysql.beginTransaction();
    try {
        const deleteResult = await roleModel.deleteById(req.params.role_id);
        await mysql.commit();
        await mysql.release();
        return res.send({
            status: "success",
            data: deleteResult
        });

    } catch (error) {
        await mysql.rollback();
        await mysql.release();
        console.log("Rollback successful");
        console.dir(error, { depth: null });
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.deleteRoleByDocumentId = async (req, res) => {
    const mysql = await db.getConnection();
    await mysql.beginTransaction();
    try {
        const deleteRoleResult = await roleModel.deleteByRoleDocumentId(req.params.role_document_id);
        const deleteEmployeeRoleResult = await employeeRoleModel.deleteByRoleDocumentId(req.params.role_document_id);
        await mysql.commit();
        await mysql.release();
        return res.send({
            status: "success",
            data: {
                role_result: deleteRoleResult,
                employee_role_result: deleteEmployeeRoleResult
            }
        });

    } catch (error) {
        await mysql.rollback();
        await mysql.release();
        console.log("Rollback successful");
        console.dir(error, { depth: null });
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};