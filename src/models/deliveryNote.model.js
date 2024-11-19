const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let DeliveryNote = function (data) {
    this.delivery_note_document_id = data.delivery_note_document_id;
    this.sales_order_document_id_list = data.sales_order_document_id_list;
    this.sales_order_project_list = data.sales_order_project_list;
    this.delivery_note_issue_date = data.delivery_note_issue_date;
    this.delivery_note_delivery_date = data.delivery_note_delivery_date;
    this.delivery_note_status = data.delivery_note_status;
    this.billing_info = data.billing_info;
    this.delivery_info = data.delivery_info;
    this.delivery_note_data = data.delivery_note_data;
    this.delivery_note_template_remark_id = data.delivery_note_template_remark_id;
    this.delivery_note_remark = data.delivery_note_remark;
    this.shipping_cost = data.shipping_cost;
    this.additional_discount = data.additional_discount;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "delivery_note";

DeliveryNote.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM delivery_note");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

DeliveryNote.getAllBySalesOrderDocumentId = async (sales_order_document_id) => {
    try {
        const result = await db.query(`select * from delivery_note where json_contains(sales_order_document_id_list, '["${sales_order_document_id}"]')`);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

DeliveryNote.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM delivery_note WHERE delivery_note_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DeliveryNote.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query("SELECT * FROM delivery_note WHERE delivery_note_document_id = ?", [document_id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DeliveryNote.getSalesOrderDocumentId = async (document_id) => {
    try {
        const result = await db.query(`select * from delivery_note where json_contains(sales_order_document_id_list, '["${document_id}"]') AND delivery_note_status != 'cancelled'`);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DeliveryNote.create = async (data, _createdby) => {
    data.sales_order_document_id_list = JSON.stringify(data.sales_order_document_id_list);
    data.sales_order_project_list = JSON.stringify(data.sales_order_project_list);
    data.delivery_info = JSON.stringify(data.delivery_info);
    data.delivery_note_data = JSON.stringify(data.delivery_note_data);
    data.billing_info = JSON.stringify(data.billing_info);
    data._delivery_note_created = moment().tz("Asia/Bangkok").unix();
    data._delivery_note_createdby = _createdby.employee_id;
    data._delivery_note_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `delivery_note` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DeliveryNote.update = async (id, data, _updateby) => {
    data._delivery_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._delivery_note_lastupdateby = _updateby.employee_id;
    data._delivery_note_lastupdateby_employee = JSON.stringify(_updateby);
  
    const columns = Object.keys(data);
    const values = Object.values(data);
  
    let sql =
      "UPDATE delivery_note SET " +
      columns.join(" = ? ,") +
      " = ? WHERE delivery_note_id = '" +
      id + "'";
  
    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
DeliveryNote.updateByDocumentId = async (documentId, data, _updateby) => {
    data._delivery_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._delivery_note_lastupdateby = _updateby.employee_id;
    data._delivery_note_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE delivery_note SET " +
    columns.join(" = ? ,") +
    " = ? WHERE delivery_note_document_id = '" +
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
DeliveryNote.delete = async (id, _updateby) => {
    let _delivery_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _delivery_note_lastupdateby = _updateby.employee_id;
    let _delivery_note_lastupdateby_employee = JSON.stringify(_updateby);
  
    try {
        const result = await db.query("UPDATE delivery_note SET delivery_note_status = 'cancelled', _delivery_note_lastupdate = ?, _delivery_note_lastupdateby = ?, _delivery_note_lastupdateby_employee = ? WHERE delivery_note_id = ?", [_delivery_note_lastupdate, _delivery_note_lastupdateby, _delivery_note_lastupdateby_employee, id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = DeliveryNote;