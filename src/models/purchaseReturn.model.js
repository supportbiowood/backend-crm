const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PurchaseReturn = function (data) {
    this.purchase_return_document_id = data.purchase_return_document_id;
    this.purchase_order_document_id = data.purchase_order_document_id;
    this.purchase_return_reason = data.purchase_return_reason;
    this.external_ref_document_id = data.external_ref_document_id;
    this.purchase_return_issue_date = data.purchase_return_issue_date;
    this.purchase_return_delivery_date = data.purchase_return_delivery_date;
    this.purchase_return_status = data.purchase_return_status;
    this.vendor_info = data.vendor_info;
    this.purchase_return_data = data.purchase_return_data;
    this.purchase_return_template_remark_id = data.purchase_return_template_remark_id;
    this.purchase_return_remark = data.purchase_return_remark;
    this.additional_discount = data.additional_discount;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "purchase_return";

PurchaseReturn.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM purchase_return");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseReturn.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM purchase_return WHERE purchase_return_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseReturn.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM purchase_return WHERE purchase_return_document_id = ?", [documentId]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseReturn.create = async (data, _createdby) => {
    data.purchase_return_data = JSON.stringify(data.purchase_return_data);
    data.vendor_info = JSON.stringify(data.vendor_info);
    data._purchase_return_created = moment().tz("Asia/Bangkok").unix();
    data._purchase_return_createdby = _createdby.employee_id;
    data._purchase_return_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `purchase_return` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PurchaseReturn.update = async (id, data, _updateby) => {
    data._purchase_return_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_return_lastupdateby = _updateby.employee_id;
    data._purchase_return_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
      "UPDATE purchase_return SET " +
      columns.join(" = ? ,") +
      " = ? WHERE purchase_return_id = " +
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
PurchaseReturn.updateByDocumentId = async (documentId, data, _updateby) => {
    data._purchase_return_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._purchase_return_lastupdateby = _updateby.employee_id;
    data._purchase_return_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE purchase_return SET " +
    columns.join(" = ? ,") +
    " = ? WHERE purchase_return_document_id = '" +
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
PurchaseReturn.delete = async (id, _updateby) => {
    let _purchase_return_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _purchase_return_lastupdateby = _updateby.employee_id;
    let _purchase_return_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query("UPDATE purchase_return SET purchase_return_status = 'cancelled', _purchase_return_lastupdate = ?, _purchase_return_lastupdateby = ?, _purchase_return_lastupdateby_employee = ? WHERE purchase_return_id = ?", [_purchase_return_lastupdate, _purchase_return_lastupdateby, _purchase_return_lastupdateby_employee, id]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error){
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = PurchaseReturn;