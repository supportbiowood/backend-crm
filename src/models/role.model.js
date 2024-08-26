const db = require("../utils/database");

let Role = function (data) {
    this.role_name = data.role_name;
    this.role_description = data.role_description;
    this.permission_list = data.permission_list;
};

let model = "role";

Role.getAll = async () => {
    try {
        const result = await db.query("select * from role");
        return result[0];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

Role.getById = async (role_id) => {
    try {
        const result = await db.query("select * from role where role_id = ?", [role_id]);
        return result[0].length !== 0 ? result[0][0] : [];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

Role.getByDocumentId = async (role_document_id) => {
    try {
        const result = await db.query("select * from role where role_document_id = ?", [role_document_id]);
        return result[0].length !== 0 ? result[0][0] : [];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

Role.getByDocumentIdList = async (role_document_id_list = [0]) => {
    try {
        let conditionValue = role_document_id_list.length && role_document_id_list.length > 0 ?
            role_document_id_list.map(role_document_id => `'${role_document_id}'`) : [`'0'`];
        let sql = `select * from role where role_document_id in (${conditionValue.join(',')})`;
        const result = await db.query(sql);
        return result[0];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

Role.create = async (data) => {
    try {
        const result = await db.query("insert into role set ?", data);
        return result[0];
    } catch (error) {
        // console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Role.updateById = async (role_id, data) => {
    delete data.role_id;
    try {
        const columns = Object.keys(data);
        const values = Object.values(data);
        let sql = "update role set " + columns.join(" = ? ,") + " = ? " +
            "where role_id = " + role_id;
        const result = await db.query(sql, values);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Role.updateByDocumentId = async (role_document_id, data) => {
    delete data.role_id;
    try {
        const result = await db.query("update role set ? where role_document_id = ?", [data, role_document_id]);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
/**
 * 
 * @param {int} role_id 
 * @returns {object} { role_delete_result: removeResult[0], employee_role_delete_result: insert_result[0]  }
 */
Role.deleteById = async (role_id) => {
    try {
        const roleResult = await db.query("delete from role where role_id = " + role_id);
        const emplyoeeRoleResult = await db.query("delete from employee_role where role_id = " + role_id);
        return { role_delete_result: roleResult[0], employee_role_delete_result: emplyoeeRoleResult[0] };
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Role.deleteByRoleDocumentId = async (role_document_id) => {
    try {
        const roleResult = await db.query("delete from role where role_document_id = ?", [role_document_id]);
        return roleResult[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

module.exports = Role;