const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let BillingNote = function (data) {
    this.billing_note_document_id = data.billing_note_document_id;
    this.sales_invoice_document_id_list = data.sales_invoice_document_id_list;
    this.sales_invoice_project_list = data.sales_invoice_project_list;
    this.billing_note_issue_date = data.billing_note_issue_date;
    this.billing_note_due_date = data.billing_note_due_date;
    this.billing_note_status = data.billing_note_status;
    this.billing_info = data.billing_info;
    this.document_list = data.document_list;
    this.billing_note_template_remark_id = data.billing_note_template_remark_id;
    this.billing_note_remark = data.billing_note_remark;
    this.no_of_document = data.no_of_document;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "billing_note";

module.exports = BillingNote;

BillingNote.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM billing_note");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
BillingNote.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM billing_note WHERE billing_note_id = ?",
            [id]
        );
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

BillingNote.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM billing_note WHERE billing_note_document_id = ?",
            document_id
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
BillingNote.getBySalesInvoiceDocumentId = async (sales_invoice_document_id) => {
    let sql = `select * from billing_note where json_contains(document_list, '{"document_id": "${sales_invoice_document_id}"}')`;
    try {
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

BillingNote.create = async (data, _createdby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.document_list = JSON.stringify(data.document_list);
    data._billing_note_created = moment().tz("Asia/Bangkok").unix();
    data._billing_note_createdby = _createdby.employee_id;
    data._billing_note_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `billing_note` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

BillingNote.update = async (id, data, _updateby) => {
    data._billing_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._billing_note_lastupdateby = _updateby.employee_id;
    data._billing_note_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE billing_note SET " +
    columns.join(" = ? ,") +
    " = ? WHERE billing_note.billing_note_id = " +
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
BillingNote.updateByDocumentId = async (documentId, data, _updateby) => {
    data._billing_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._billing_note_lastupdateby = _updateby.employee_id;
    data._billing_note_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE billing_note SET " +
    columns.join(" = ? ,") +
    ` = ? WHERE billing_note.billing_note_document_id = '${documentId}'`;

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

BillingNote.delete = async (id, _updateby) => {
    let _billing_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _billing_note_lastupdateby = _updateby.employee_id;
    let _billing_note_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE billing_note SET billing_note_status = 'cancelled', _billing_note_lastupdate = ?, _billing_note_lastupdateby = ?, _billing_note_lastupdateby_employee = ? WHERE billing_note_id = ?",
            [
                _billing_note_lastupdate,
                _billing_note_lastupdateby,
                _billing_note_lastupdateby_employee,
                id,
            ]
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
