const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Expenses = function(data) {
    this.expenses_document_id = data.expenses_document_id;
    this.external_ref_document_id = data.external_ref_document_id;
    this.inventory_target = data.inventory_target;
    this.expenses_issue_date = data.expenses_issue_date;
    this.expenses_due_date = data.expenses_due_date;
    this.expenses_status = data.expenses_status;
    this.vendor_info = data.vendor_info;
    this.expenses_data = data.expenses_data;
    this.expenses_remark_template_id = data.expenses_remark_template_id;
    this.expenses_remark = data.expenses_remark;
    this.additional_discount = data.additional_discount;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount =data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "expenses";

Expenses.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM expenses");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
Expenses.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM expenses WHERE expenses_id = ?", [id]);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
Expenses.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM expenses WHERE expenses_document_id = ?", [documentId]);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Expenses.create = async (data, _createdby) => {
    data.vendor_info = JSON.stringify(data.vendor_info);
    data.expenses_data = JSON.stringify(data.expenses_data);
    data._expenses_created = moment().tz("Asia/Bangkok").unix();
    data._expenses_createdby = _createdby.employee_id;
    data._expenses_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `expenses` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
Expenses.update = async (id, data, _updateby) => {
    data._expenses_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._expenses_lastupdateby = _updateby.employee_id;
    data._expenses_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE expenses SET " +
        columns.join(" = ? ,") +
        " = ? WHERE expenses_id = " +
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
Expenses.updateByDocumentId = async (documentId, data, _updateby) => {
    data._expenses_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._expenses_lastupdateby = _updateby.employee_id;
    data._expenses_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE expenses SET " +
        columns.join(" = ? ,") +
        " = ? WHERE expenses_document_id = '" +
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
Expenses.delete = async (id, _updateby) => {
    let _expenses_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _expenses_lastupdateby = _updateby.employee_id;
    let _expenses_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query("UPDATE expenses SET expenses_status = 'cancelled', _expenses_lastupdate = ?, _expenses_lastupdateby = ?, _expenses_lastupdateby_employee = ? WHERE expenses_id = ?", [_expenses_lastupdate, _expenses_lastupdateby, _expenses_lastupdateby_employee, id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = Expenses;