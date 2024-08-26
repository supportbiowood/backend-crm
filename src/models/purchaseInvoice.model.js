const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PurchaseInvoice = function (data) {
    this.purchase_invoice_document_id = data.purchase_invoice_document_id;
    this.purchase_order_document_id = data.purchase_order_document_id;
    this.inventory_target = data.inventory_target;
    this.external_ref_document_id = data.external_ref_document_id;
    this.purchase_invoice_issue_date = data.purchase_invoice_issue_date;
    this.purchase_invoice_due_date = data.purchase_invoice_due_date;
    this.purchase_invoice_status = data.purchase_invoice_status;
    this.vendor_info = data.vendor_info;
    this.purchase_invoice_data = data.purchase_invoice_data;
    this.purchase_invoice_template_remark_id = data.purchase_invoice_template_remark_id;
    this.purchase_invoice_remark = data.purchase_invoice_remark;
    this.additional_discount = data.additional_discount;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "purchase_invoice";

PurchaseInvoice.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM purchase_invoice");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseInvoice.getByContactId = async (contactId) => {
    try {
        const sql = `SELECT * FROM purchase_invoice WHERE JSON_EXTRACT(vendor_info, '$.contact_id') = ${contactId}`;
        const result = await db.query(sql);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseInvoice.getAllByPurchaseOrderDocumentId = async (purchaseOrderDocumentId) => {
    try {
        const result = await db.query("SELECT * FROM purchase_invoice WHERE purchase_order_document_id = ?", [purchaseOrderDocumentId]);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseInvoice.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM purchase_invoice WHERE purchase_invoice_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseInvoice.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM purchase_invoice WHERE purchase_invoice_document_id = ?", [documentId]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PurchaseInvoice.create = async (data, _createdby) => {
    data.purchase_invoice_data = JSON.stringify(data.purchase_invoice_data);
    data.vendor_info = JSON.stringify(data.vendor_info);
    data._purchase_invoice_created = moment().tz("Asia/Bangkok").unix();
    data._purchase_invoice_createdby = _createdby.employee_id;
    data._purchase_invoice_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `purchase_invoice` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseInvoice.update = async (id, data, _updateby) => {
    data._purchase_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_invoice_lastupdateby = _updateby.employee_id;
    data._purchase_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE purchase_invoice SET " +
        columns.join(" = ? ,") +
        " = ? WHERE purchase_invoice_id = " +
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
PurchaseInvoice.updateByDocumentId = async (documentId, data, _updateby) => {
    data._purchase_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_invoice_lastupdateby = _updateby.employee_id;
    data._purchase_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE purchase_invoice SET " +
        columns.join(" = ? ,") +
        " = ? WHERE purchase_invoice_document_id = '" +
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
PurchaseInvoice.delete = async (id, _updateby) => {
    let _purchase_invoice_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _purchase_invoice_lastupdateby = _updateby.employee_id;
    let _purchase_invoice_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query("UPDATE purchase_invoice SET purchase_invoice_status = 'cancelled', _purchase_invoice_lastupdate = ?, _purchase_invoice_lastupdateby = ?, _purchase_invoice_lastupdateby_employee = ? WHERE purchase_invoice_id = ?", [_purchase_invoice_lastupdate, _purchase_invoice_lastupdateby, _purchase_invoice_lastupdateby_employee, id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = PurchaseInvoice;