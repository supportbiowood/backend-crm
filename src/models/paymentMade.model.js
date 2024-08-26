const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PaymentMade = function (data) {
    this.payment_made_document_id = data.payment_made_document_id;
    this.ref_type = data.ref_type;
    this.ref_document_id = data.ref_document_id;
    this.external_ref_document_id = data.external_ref_document_id;
    this.payment_made_issue_date = data.payment_made_issue_date;
    this.payment_date = data.payment_date;
    this.payment_made_status = data.payment_made_status;
    this.vendor_info = data.vendor_info;
    this.payment_channel_id = data.payment_channel_id;
    this.check_info = data.check_info;
    this.payment_made_data = data.payment_made_data;
    this.total_amount = data.total_amount;
    this.payment_made_template_remark_id = data.payment_made_template_remark_id;
    this.payment_made_remark = data.payment_made_remark;
    this.withholding_tax = data.withholding_tax;
};

let model = "payment_made";

PaymentMade.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM payment_made LEFT JOIN payment_channel ON payment_made.payment_channel_id = payment_channel.payment_channel_id");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
PaymentMade.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM payment_made LEFT JOIN payment_channel ON payment_made.payment_channel_id = payment_channel.payment_channel_id WHERE payment_made_id = ?", [id]);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

PaymentMade.getByDocumentId = async (documentId) => {
    try {
        const result = await db.query("SELECT * FROM payment_made LEFT JOIN payment_channel ON payment_made.payment_channel_id = payment_channel.payment_channel_id WHERE payment_made_document_id = ? ", [documentId]);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
PaymentMade.getByRefTypeAndRefDocumentId = async (refType, refDocumentId) => {
    try {
        const result = await db.query("SELECT * FROM payment_made LEFT JOIN payment_channel ON payment_made.payment_channel_id = payment_channel.payment_channel_id WHERE ref_type = ? AND ref_document_id = ?", [refType, refDocumentId]);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

PaymentMade.create = async (data, _createdby) => {
    if (data.check_info !== null) {
        data.check_info = JSON.stringify(data.check_info);
    }
    data.vendor_info = JSON.stringify(data.vendor_info);
    data.payment_made_data = JSON.stringify(data.payment_made_data);
    data._payment_made_created = moment().tz("Asia/Bangkok").unix();
    data._payment_made_createdby = _createdby.employee_id;
    data._payment_made_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `payment_made` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PaymentMade.update = async (id, data, _updateby) => {
    data._payment_made_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._payment_made_lastupdateby = _updateby.employee_id;
    data._payment_made_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE payment_made SET " +
        columns.join(" = ? ,") +
        " = ? WHERE payment_made.payment_made_id = '" +
        id +
        "'";

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
PaymentMade.updateByDocumentId = async (documentId, data, _updateby) => {
    data._payment_made_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._payment_made_lastupdateby = _updateby.employee_id;
    data._payment_made_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE payment_made SET " +
        columns.join(" = ? ,") +
        " = ? WHERE payment_made.payment_made_document_id = '" +
        documentId +
        "'";

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
PaymentMade.delete = async (id, _updateby) => {
    let _payment_made_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _payment_made_lastupdateby = _updateby.employee_id;
    let _payment_made_lastupdateby_employee = JSON.stringify(_updateby);

    try {
        const result = await db.query(
            "UPDATE payment_made SET payment_made_status = 'cancelled', _payment_made_lastupdate = ?, _payment_made_lastupdateby = ?, _payment_made_lastupdateby_employee = ? WHERE payment_made_id = ?",
            [
                id,
                _payment_made_lastupdate,
                _payment_made_lastupdateby,
                _payment_made_lastupdateby_employee
            ]
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

module.exports = PaymentMade;