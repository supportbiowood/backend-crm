const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let SalesInvoice = function (data) {
    this.sales_invoice_document_id = data.sales_invoice_document_id;
    this.sales_order_document_id = data.sales_order_document_id;
    this.sales_invoice_status = data.sales_invoice_status;
    this.sales_invoice_stage = data.sales_invoice_stage;
    this.sales_invoice_issue_date = data.sales_invoice_issue_date;
    this.sales_invoice_due_date = data.sales_invoice_due_date;
    this.billing_info = data.billing_info;
    this.sales_invoice_data = data.sales_invoice_data;
    this.sale_list = data.sale_list;
    this.sales_invoice_approveby = data.sales_invoice_approveby;
    this.sales_invoice_approveby_employee = data.sales_invoice_approveby_employee;
    this.sales_invoice_template_remark_id = data.sales_invoice_template_remark_id;
    this.sales_invoice_remark = data.sales_invoice_remark;
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

let model = "sales_invoice";

SalesInvoice.getAll = async () => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_invoice"
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesInvoice.getAllBySalesOrderDocumentId = async (sales_order_document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_invoice WHERE sales_order_document_id = ?", sales_order_document_id
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesInvoice.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_invoice WHERE sales_invoice_id = ?",
            [id]
        );
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesInvoice.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_invoice WHERE sales_invoice_document_id = ?", document_id
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesInvoice.getByContactId = async (contact_id) => {
    try {
        const sql = `SELECT * FROM sales_invoice WHERE JSON_EXTRACT(billing_info, '$.contact_id') = ${contact_id} ORDER BY sales_invoice_id DESC`;
        const result = await db.query(
            sql 
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesInvoice.getIdListByContactId = async (contact_id) => {
    try {
        const sql = `SELECT sales_invoice_document_id FROM sales_invoice WHERE JSON_EXTRACT(billing_info, '$.contact_id') = ${contact_id}`;
        const result = await db.query(
            sql 
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesInvoice.create = async (data, _createdby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.sales_invoice_data = JSON.stringify(data.sales_invoice_data);
    data.sale_list = JSON.stringify(data.sale_list);
    data._sales_invoice_created = moment().tz("Asia/Bangkok").unix();
    data._sales_invoice_createdby = _createdby.employee_id;
    data._sales_invoice_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `sales_invoice` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesInvoice.update = async (id, data, _updateby) => {
    data._sales_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_invoice_lastupdateby = _updateby.employee_id;
    data._sales_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE sales_invoice SET " +
    columns.join(" = ? ,") +
    " = ? WHERE sales_invoice.sales_invoice_id = " +
    id;

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesInvoice.updateByDocumentId = async (document_id, data, _updateby) => {
    data._sales_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_invoice_lastupdateby = _updateby.employee_id;
    data._sales_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE sales_invoice SET " +
    columns.join(" = ? ,") +
    " = ? WHERE sales_invoice.sales_invoice_document_id = '" +
    document_id+"'";

    try {

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

SalesInvoice.updateStatus = async (id, data, _updateby) => {
    data._sales_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_invoice_lastupdateby = _updateby.employee_id;
    data._sales_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query(
            "UPDATE sales_invoice SET sales_invoice_status = ?, _sales_invoice_lastupdate = ?, _sales_invoice_lastupdateby = ?, _sales_invoice_lastupdateby_employee = ? WHERE sales_invoice_id = ?",
            [
                data.sales_invoice_status,
                data._sales_invoice_lastupdate,
                data._sales_invoice_lastupdateby,
                data._sales_invoice_lastupdateby_employee,
                id,
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

SalesInvoice.delete = async (id, _updateby) => {
    let _sales_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _sales_invoice_lastupdateby = _updateby.employee_id;
    let _sales_invoice_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE sales_invoice SET sales_invoice_status = 'cancelled', _sales_invoice_lastupdate = ?, _sales_invoice_lastupdateby = ?, _sales_invoice_lastupdateby_employee = ? WHERE sales_invoice_id = ?",
            [
                _sales_invoice_lastupdate,
                _sales_invoice_lastupdateby,
                _sales_invoice_lastupdateby_employee,
                id
            ]
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

module.exports = SalesInvoice;
