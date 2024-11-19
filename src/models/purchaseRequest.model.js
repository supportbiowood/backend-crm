const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PurchaseRequest = function (data) {
    this.purchase_request_document_id = data.purchase_request_document_id;
    this.sales_order_document_id_list = data.sales_order_document_id_list;
    this.sales_order_project_list = data.sales_order_project_list;
    this.purchase_request_issue_date = data.purchase_request_issue_date;
    this.purchase_request_due_date = data.purchase_request_due_date;
    this.inventory_target = data.inventory_target;
    this.purchase_request_status = data.purchase_request_status;
    this.purchase_request_data = data.purchase_request_data;
    this.purchase_request_template_remark_id = data.purchase_request_template_remark_id;
    this.purchase_request_remark = data.purchase_request_remark;
};

let model = "purchase_request";

PurchaseRequest.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM purchase_request");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseRequest.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM purchase_request WHERE purchase_request_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseRequest.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query("SELECT * FROM purchase_request WHERE purchase_request_document_id = ?", [document_id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseRequest.getBySalesOrderDocumentId = async (document_id) => {
    try {
        const result = await db.query(`select * from purchase_request where json_contains(sales_order_document_id_list, '["${document_id}"]') AND purchase_request_status != 'cancelled'`);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseRequest.create = async (data, _createdby) => {
    data.sales_order_document_id_list = JSON.stringify(data.sales_order_document_id_list);
    data.sales_order_project_list = JSON.stringify(data.sales_order_project_list);
    data.purchase_request_data = JSON.stringify(data.purchase_request_data);
    data._purchase_request_created = moment().tz("Asia/Bangkok").unix();
    data._purchase_request_createdby = _createdby.employee_id;
    data._purchase_request_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `purchase_request` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseRequest.update = async (id, data, _updateby) => {
    data._purchase_request_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_request_lastupdateby = _updateby.employee_id;
    data._purchase_request_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE purchase_request SET " +
    columns.join(" = ? ,") +
    " = ? WHERE purchase_request_id = " +
    id;

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
PurchaseRequest.updateByDocumentId = async (documentId, data, _updateby) => {
    data._purchase_request_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_request_lastupdateby = _updateby.employee_id;
    data._purchase_request_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE purchase_request SET " +
    columns.join(" = ? ,") +
    " = ? WHERE purchase_request_document_id = '" +
    documentId + "'";

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
PurchaseRequest.delete = async (id, _updateby) => {
    let _purchase_request_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _purchase_request_lastupdateby = _updateby.employee_id;
    let _purchase_request_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query("UPDATE purchase_request SET purchase_request_status = 'cancelled', _purchase_request_lastupdate = ?, _purchase_request_lastupdateby = ?, _purchase_request_lastupdateby_employee = ? WHERE purchase_request_id = ?", [_purchase_request_lastupdate, _purchase_request_lastupdateby, _purchase_request_lastupdateby_employee, id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = PurchaseRequest;