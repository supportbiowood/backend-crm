const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let DepositInvoice = function (data) {
    this.deposit_invoice_document_id = data.deposit_invoice_document_id;
    this.deposit_invoice_issue_date = data.deposit_invoice_issue_date;
    this.deposit_invoice_status = data.deposit_invoice_status;
    this.billing_info = data.billing_info;
    this.deposit_invoice_data = data.deposit_invoice_data;
    this.deposit_invoice_template_remark_id = data.deposit_invoice_template_remark_id;
    this.deposit_invoice_remark = data.deposit_invoice_remark;
    this.sales_invoice_document_id = data.sales_invoice_document_id;
    this.deposit_invoice_info = data.deposit_invoice_info;
    this.total_amount = data.total_amount;
    this.sale_list = data.sale_list;
};
  
let model = "deposit_invoice";

DepositInvoice.getAll = async () => {
    try {
        const result = await db.query(
            "SELECT * FROM deposit_invoice"
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

DepositInvoice.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM deposit_invoice WHERE deposit_invoice_id = ?",
            [id]
        );
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DepositInvoice.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM deposit_invoice WHERE deposit_invoice_document_id = ?", document_id
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
DepositInvoice.getBySalesInvoiceDocumentId = async (sales_invoice_document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM deposit_invoice WHERE sales_invoice_document_id = ?", sales_invoice_document_id
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
DepositInvoice.create = async (data, _createdby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.sale_list = JSON.stringify(data.sale_list);
    data.deposit_invoice_data = JSON.stringify(data.deposit_invoice_data);
    data._deposit_invoice_created = moment().tz("Asia/Bangkok").unix();
    data._deposit_invoice_createdby = _createdby.employee_id;
    data._deposit_invoice_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `deposit_invoice` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

DepositInvoice.update = async (id, data, _updateby) => {
    if (data.billing_info) {
        data.billing_info = JSON.stringify(data.billing_info);
    }
    if (data.sale_list) {
        data.sale_list = JSON.stringify(data.sale_list);
    }
    if (data.deposit_invoice_data) {
        data.deposit_invoice_data = JSON.stringify(data.deposit_invoice_data);
    }
    data._deposit_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._deposit_invoice_lastupdateby = _updateby.employee_id;
    data._deposit_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE deposit_invoice SET " +
    columns.join(" = ? ,") +
    " = ? WHERE deposit_invoice.deposit_invoice_id = " +
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
DepositInvoice.updateByDocumentId = async (document_id, data, _updateby) => {
    if (data.billing_info) {
        data.billing_info = JSON.stringify(data.billing_info);
    }
    if (data.sale_list) {
        data.sale_list = JSON.stringify(data.sale_list);
    }
    if (data.deposit_invoice_data) {
        data.deposit_invoice_data = JSON.stringify(data.deposit_invoice_data);
    }
    data._deposit_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._deposit_invoice_lastupdateby = _updateby.employee_id;
    data._deposit_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE deposit_invoice SET " +
    columns.join(" = ? ,") +
    " = ? WHERE deposit_invoice.deposit_invoice_document_id = '" +
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

DepositInvoice.delete = async (id, _updateby) => {
    let _deposit_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _deposit_invoice_lastupdateby = _updateby.employee_id;
    let _deposit_invoice_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE deposit_invoice SET deposit_invoice_status = 'cancelled', _deposit_invoice_lastupdate = ?, _deposit_invoice_lastupdateby = ?, _deposit_invoice_lastupdateby_employee = ? WHERE deposit_invoice_id = ?",
            [
                _deposit_invoice_lastupdate,
                _deposit_invoice_lastupdateby,
                _deposit_invoice_lastupdateby_employee,
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

module.exports = DepositInvoice;