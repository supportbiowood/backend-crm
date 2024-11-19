const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Warranty = function (data) {
    this.project_id = data.project_id;
    this.warranty_name = data.warranty_name;
    this.warranty_type = data.warranty_type;
    this.warranty_start_date = data.warranty_start_date;
    this.warranty_end_date = data.warranty_end_date;
    this.warranty_status = data.warranty_status;
    this.warranty_approver_name = data.warranty_approver_name;
    this.warranty_approver_document_id = data.warranty_approver_document_id;
    this.warranty_approved_date = data.warranty_approved_date;
};

let model = "Warranty";

Warranty.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM warranty");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Warranty.getDetailedAll = async () => {
    try {
        let sql = `select w.* , project_name \
                    from warranty w \
                    join project p on w.project_id = p.project_id `;
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Warranty.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM warranty WHERE warranty.warranty_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Warranty.getDetailedById = async (id) => {
    try {
        let sql = `select w.* , project_name \
                    from warranty w \
                    join project p on w.project_id = p.project_id \
                    where w.warranty_id = ${id} `;
        const result = await db.query(sql);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Warranty.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM warranty WHERE project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0] || [];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Warranty.getDetailedByProjectId = async (projectId) => {
    try {
        let sql = `select w.* , project_name \
                    from warranty w \
                    join project p on w.project_id = p.project_id \
                    where p.project_id = ${projectId}`;
        const result = await db.query(sql);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Warranty.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `warranty` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Warranty.update = async (id, data) => {
    try {
        const columns = Object.keys(data);
        const values = Object.values(data);
        let sql = `UPDATE warranty set ${columns.join(" = ? ,")} = ?  \
                    where warranty_id = ${id}`;

        // const result = await db.query(
        //     "UPDATE warranty SET warranty.project_id = ?, warranty.warranty_name = ?, warranty.warranty_type = ?, \
        //      warranty.warranty_start_date = ?, warranty.warranty_end_date = ?, warranty.warranty_status = ?, \
        //      warranty.warranty_approver_name = ?, warranty.warranty_approver_document_id, warranty.warranty_approved_date \
        //      WHERE warranty.warranty_id = ?",
        //     [
        //         data.project_id,
        //         data.warranty_name,
        //         data.warranty_type,
        //         data.warranty_start_date,
        //         data.warranty_end_date,
        //         data.warranty_status,
        //         data.warranty_approver_name,
        //         id
        //     ]
        // );
        // console.log(model + " model update success", result);
        const result = await db.query(sql, values);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Warranty.delete = async (id) => {
    try {
        const result = await db.query(
            "DELETE FROM warranty WHERE warranty_id = ?",
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

module.exports = Warranty;
