const db = require("../utils/database");
const moment = require("moment");
const { json } = require("express/lib/response");
require("moment-timezone");

let CreditNote = function (data) {
    this.credit_note_document_id = data.credit_note_document_id;
    this.ref_document_id = data.ref_document_id;
    this.ref_type = data.ref_type;
    this.credit_note_issue_date = data.credit_note_issue_date;
    this.credit_note_status = data.credit_note_status;
    this.billing_info = data.billing_info;
    this.credit_note_type = data.credit_note_type;
    this.credit_note_reason = data.credit_note_reason;
    this.credit_note_data = data.credit_note_data;
    this.credit_note_template_remark_id = data.credit_note_template_remark_id;
    this.credit_note_remark = data.credit_note_remark;
    this.credit_note_info = data.credit_note_info;
    this.shipping_cost = data.shipping_cost;
    this.additional_discount = data.additional_discount;
    this.sales_invoice_document_id = data.sales_invoice_document_id;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "credit_note";

CreditNote.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM credit_note");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

CreditNote.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM credit_note WHERE credit_note_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CreditNote.getBySalesInvoiceDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM credit_note WHERE sales_invoice_document_id = ?", [documentId]);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CreditNote.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM credit_note WHERE credit_note_document_id = ?", [documentId]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CreditNote.getBySalesReturnDocumentId = async (salesReturnDocumentId) => {
    try {
        const result = await db.query("SELECT * FROM credit_note WHERE ref_document_id = ? and ref_type = 'sales_return'",
            [salesReturnDocumentId]);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CreditNote.create = async (data, _createdby) => {
    data.credit_note_data = JSON.stringify(data.credit_note_data);
    data.credit_note_info = JSON.stringify(data.credit_note_info);
    data.billing_info = JSON.stringify(data.billing_info);
    data._credit_note_created = moment().tz("Asia/Bangkok").unix();
    data._credit_note_createdby = _createdby.employee_id;
    data._credit_note_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query("INSERT INTO `credit_note` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CreditNote.update = async (id, data, _updateby) => {
    if (data.credit_note_info) {
        data.credit_note_info = JSON.stringify(data.credit_note_info);
    }
    if (data.credit_note_data) {
        data.credit_note_data = JSON.stringify(data.credit_note_data);
    }
    if (data.billing_info) {
        data.billing_info = JSON.stringify(data.billing_info);
    }
    data._credit_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._credit_note_lastupdateby = _updateby.employee_id;
    data._credit_note_lastupdateby_employee = JSON.stringify(_updateby);


    const columns = Object.keys(data);
    const values = (Object.values(data)).map(value => {
        if (value === undefined) {
            return null;
        } else if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
        } else {
            return value;
        }


    });
    let sql =
        "UPDATE credit_note SET " +
        columns.join(" = ? ,") +
        " = ? WHERE credit_note_id = " +
        id;
    try {
        const result = await db.query(sql, values);
        return result[0];
        // console.log(model + " model update success", result);
        // throw new Error(`force error`)
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
CreditNote.updateByDocumentId = async (documentId, data, _updateby) => {
    if (data.credit_note_data) {
        data.credit_note_data = JSON.stringify(data.credit_note_data);
    }
    if (data.credit_note_info) {
        data.credit_note_info = JSON.stringify(data.credit_note_info);
    }
    if (data.billing_info) {
        data.billing_info = JSON.stringify(data.billing_info);
    }
    data._credit_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._credit_note_lastupdateby = _updateby.employee_id;
    data._credit_note_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE credit_note SET " +
        columns.join(" = ? ,") +
        " = ? WHERE credit_note_document_id = " +
        `'${documentId}'`;

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
CreditNote.delete = async (id, _updateby) => {
    let _credit_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _credit_note_lastupdateby = _updateby.employee_id;
    let _credit_note_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE credit_note SET credit_note_status = 'cancelled', _credit_note_lastupdate = ?, _credit_note_lastupdateby = ?, _credit_note_lastupdateby_employee = ? WHERE credit_note_id = ?",
            [
                _credit_note_lastupdate,
                _credit_note_lastupdateby,
                _credit_note_lastupdateby_employee,
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

module.exports = CreditNote;