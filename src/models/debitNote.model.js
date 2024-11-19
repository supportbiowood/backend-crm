const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let DebitNote = function (data) {
    this.debit_note_document_id = data.debit_note_document_id;
    this.ref_document_id = data.ref_document_id;
    this.ref_type = data.ref_type;
    this.external_ref_document_id = data.external_ref_document_id;
    this.debit_note_issue_date = data.debit_note_issue_date;
    this.debit_note_status = data.debit_note_status;
    this.vendor_info = data.vendor_info;
    this.debit_note_type = data.debit_note_type;
    this.debit_note_data = data.debit_note_data;
    this.debit_note_reason = data.debit_note_reason;
    this.debit_note_template_remark_id = data.debit_note_template_remark_id;
    this.debit_note_remark = data.debit_note_remark;
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

let model = "debit_note";

DebitNote.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM debit_note");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DebitNote.getAllByPurchaseInvoiceDocumentId = async (purchaseInvoiceDocumentId) => {
    try {
        const result = await db.query("SELECT * FROM debit_note WHERE ref_type like 'purchase_invoice' and ref_document_id = ?", [purchaseInvoiceDocumentId]);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DebitNote.getAllByPurchaseReturnDocumentId = async (purchaseReturnDocumentId) => {
    try {
        const result = await db.query("SELECT * FROM debit_note WHERE ref_type like 'purchase_invoice' and ref_document_id = ?", [purchaseReturnDocumentId]);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

DebitNote.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM debit_note WHERE debit_note_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DebitNote.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM debit_note WHERE debit_note_document_id = ?", [documentId]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DebitNote.create = async (data, _createdby) => {
    data.debit_note_data = JSON.stringify(data.debit_note_data);
    data.vendor_info = JSON.stringify(data.vendor_info);
    data._debit_note_created = moment().tz("Asia/Bangkok").unix();
    data._debit_note_createdby = _createdby.employee_id;
    data._debit_note_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `debit_note` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
DebitNote.update = async (id, data, _updateby) => {
    data._debit_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._debit_note_lastupdateby = _updateby.employee_id;
    data._debit_note_lastupdateby_employee = JSON.stringify(_updateby);
  
    const columns = Object.keys(data);
    const values = Object.values(data);
  
    let sql =
      "UPDATE debit_note SET " +
      columns.join(" = ? ,") +
      " = ? WHERE debit_note_id = " +
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
DebitNote.updateByDocumentId = async (documentId, data, _updateby) => {
    data._debit_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._debit_note_lastupdateby = _updateby.employee_id;
    data._debit_note_lastupdateby_employee = JSON.stringify(_updateby);
  
    const columns = Object.keys(data);
    const values = Object.values(data);
  
    let sql =
      "UPDATE debit_note SET " +
      columns.join(" = ? ,") +
      " = ? WHERE debit_note_document_id = '" +
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
DebitNote.delete = async (id, _updateby) => {
    let _debit_note_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _debit_note_lastupdateby = _updateby.employee_id;
    let _debit_note_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE debit_note SET debit_note_status = 'cancelled', _debit_note_lastupdate = ?, _debit_note_lastupdateby = ?, _debit_note_lastupdateby_employee = ? WHERE debit_note_id = ?",
            [
                _debit_note_lastupdate,
                _debit_note_lastupdateby,
                _debit_note_lastupdateby_employee,
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


module.exports = DebitNote;