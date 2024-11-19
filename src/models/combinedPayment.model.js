const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let CombinedPayment = function (data) {
    this.combined_payment_document_id = data.combined_payment_document_id;
    this.combined_payment_status = data.combined_payment_status;
    this.combined_payment_issue_date = data.combined_payment_issue_date;
    this.combined_payment_due_date = data.combined_payment_due_date;
    this.vendor_info = data.vendor_info;
    this.document_list = data.document_list;
    this.combined_payment_template_remark_id = data.combined_payment_template_remark_id;
    this.combined_payment_remark = data.combined_payment_remark;
    this.no_of_document = data.no_of_document;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "combined_payment";

CombinedPayment.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM combined_payment");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

CombinedPayment.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM combined_payment WHERE combined_payment_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CombinedPayment.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM combined_payment WHERE combined_payment_document_id = ?", [documentId]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CombinedPayment.getByPurchaseInvoiceDocumentId = async (purchaseInvoiceDocumentId) => {
    let sql = `select * from combined_payment where json_contains(document_list, '{"document_id": "${purchaseInvoiceDocumentId}"}')`;
    try {
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

CombinedPayment.create = async (data, _createdby) => {
    data.document_list = JSON.stringify(data.document_list);
    data.vendor_info = JSON.stringify(data.vendor_info);
    data._combined_payment_created = moment().tz("Asia/Bangkok").unix();
    data._combined_payment_createdby = _createdby.employee_id;
    data._combined_payment_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `combined_payment` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
CombinedPayment.update = async (id, data, _updateby) => {
    data._combined_payment_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._combined_payment_lastupdateby = _updateby.employee_id;
    data._combined_payment_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE combined_payment SET " +
        columns.join(" = ? ,") +
        " = ? WHERE combined_payment_id = " +
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
CombinedPayment.updateByDocumentId = async (documentId, data, _updateby) => {
    data._combined_payment_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._combined_payment_lastupdateby = _updateby.employee_id;
    data._combined_payment_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE combined_payment SET " +
        columns.join(" = ? ,") +
        " = ? WHERE combined_payment_document_id = '" +
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
CombinedPayment.delete = async (id, _updateby) => {
    let _combined_payment_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _combined_payment_lastupdateby = _updateby.employee_id;
    let _combined_payment_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE combined_payment SET combined_payment_status = 'cancelled', _combined_payment_lastupdate = ?, _combined_payment_lastupdateby = ?, _combined_payment_lastupdateby_employee = ? WHERE combined_payment_id = ?",
            [
                _combined_payment_lastupdate,
                _combined_payment_lastupdateby,
                _combined_payment_lastupdateby_employee,
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

module.exports = CombinedPayment;