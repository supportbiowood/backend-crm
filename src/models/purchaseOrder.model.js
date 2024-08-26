const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PurchaseOrder = function (data) {
    this.purchase_order_document_id = data.purchase_order_document_id;
    this.purchase_request_document_id_list = data.purchase_request_document_id_list;
    this.sales_order_project_list = data.sales_order_project_list;
    this.external_ref_document_id = data.external_ref_document_id;
    this.purchase_order_issue_date = data.purchase_order_issue_date;
    this.purchase_order_due_date = data.purchase_order_due_date;
    this.purchase_order_expect_date = data.purchase_order_expect_date;
    this.inventory_target = data.inventory_target;
    this.vendor_info = data.vendor_info;
    this.purchase_order_status = data.purchase_order_status;
    this.purchase_order_data = data.purchase_order_data;
    this.purchase_order_template_remark_id = data.purchase_order_template_remark_id;
    this.purchase_order_remark = data.purchase_order_remark;
    this.additional_discount = data.additional_discount;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "purchase_order";

PurchaseOrder.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM purchase_order");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseOrder.getAllByPurchaseRequestDocumentId = async (document_id) => {
    try {
        const result = await db.query(`select * from purchase_order where json_contains(purchase_request_document_id_list, '["${document_id}"]') AND purchase_order_status != 'cancelled'`);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseOrder.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM purchase_order WHERE purchase_order_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseOrder.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query("SELECT * FROM purchase_order WHERE purchase_order_document_id = ?", [document_id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseOrder.getPurchaseRequestDocumentId = async (document_id) => {
    try {
        const result = await db.query(`select * from purchase_order where json_contains(purchase_request_document_id_list, '["${document_id}"]') AND purchase_order_status != 'cancelled'`);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseOrder.create = async (data, _createdby) => {
    if (data.purchase_request_document_id_list.length !== 0) {
        data.purchase_request_document_id_list = JSON.stringify(data.purchase_request_document_id_list);
    }
    data.sales_order_project_list = JSON.stringify(data.sales_order_project_list);
    data.purchase_order_data = JSON.stringify(data.purchase_order_data);
    data.vendor_info = JSON.stringify(data.vendor_info);
    data._purchase_order_created = moment().tz("Asia/Bangkok").unix();
    data._purchase_order_createdby = _createdby.employee_id;
    data._purchase_order_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `purchase_order` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseOrder.update = async (id, data, _updateby) => {
    data._purchase_order_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_order_lastupdateby = _updateby.employee_id;
    data._purchase_order_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE purchase_order SET " +
        columns.join(" = ? ,") +
        " = ? WHERE purchase_order_id = " +
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
PurchaseOrder.updateByDocumentId = async (documentId, data, _updateby) => {
    data._purchase_order_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_order_lastupdateby = _updateby.employee_id;
    data._purchase_order_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE purchase_order SET " +
        columns.join(" = ? ,") +
        " = ? WHERE purchase_order_document_id = '" +
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
PurchaseOrder.delete = async (id, _updateby) => {
    let _purchase_order_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _purchase_order_lastupdateby = _updateby.employee_id;
    let _purchase_order_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query("UPDATE purchase_order SET purchase_order_status = 'cancelled', _purchase_order_lastupdate = ?, _purchase_order_lastupdateby = ?, _purchase_order_lastupdateby_employee = ? WHERE purchase_order_id = ?", [_purchase_order_lastupdate, _purchase_order_lastupdateby, _purchase_order_lastupdateby_employee, id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = PurchaseOrder;