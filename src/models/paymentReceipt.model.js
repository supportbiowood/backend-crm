const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PaymentReceipt = function (data) {
    this.payment_receipt_document_id = data.payment_receipt_document_id;
    this.ref_type = data.ref_type;
    this.ref_document_id = data.ref_document_id;
    this.payment_receipt_issue_date = data.payment_receipt_issue_date;
    this.payment_date = data.payment_date;
    this.payment_receipt_status = data.payment_receipt_status;
    this.payment_receipt_stage = data.payment_receipt_stage;
    this.billing_info = data.billing_info;
    this.payment_channel_id = data.payment_channel_id;
    this.check_info = data.check_info;
    this.payment_receipt_data = data.payment_receipt_data;
    this.total_amount = data.total_amount;
    this.payment_receipt_template_remark_id = data.payment_receipt_template_remark_id;
    this.payment_receipt_remark = data.payment_receipt_remark;
    this.withholding_tax = data.withholding_tax;
};

let model = "payment_receipt";
PaymentReceipt.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM payment_receipt");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
PaymentReceipt.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM payment_receipt WHERE payment_receipt_id = ?", [id]);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
PaymentReceipt.getByRefTypeAndRefDocumentId = async (ref_type, ref_document_id) => {
    try {
        const result = await db.query("\
        SELECT COALESCE(PC.payment_channel_type, 'check') as payment_channel_type, PC.payment_channel_info as payment_channel_info , PR.* \
        FROM `payment_receipt` as PR \
        left join `payment_channel` as PC \
        on PR.payment_channel_id = PC.payment_channel_id \
        where ref_type = ? AND ref_document_id = ?", [ref_type, ref_document_id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

PaymentReceipt.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query("SELECT * FROM payment_receipt WHERE payment_receipt_document_id = ?", [document_id]);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
PaymentReceipt.create = async (data, _createdby) => {
    if (data.check_info !== null) {
        data.check_info = JSON.stringify(data.check_info);
    }
    data.billing_info = JSON.stringify(data.billing_info);
    data.payment_receipt_data = JSON.stringify(data.payment_receipt_data);
    data._payment_receipt_created = moment().tz("Asia/Bangkok").unix();
    data._payment_receipt_createdby = _createdby.employee_id;
    data._payment_receipt_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `payment_receipt` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};
PaymentReceipt.update = async (id, data, _updateby) => {
    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE payment_receipt SET " +
        columns.join(" = ? ,") +
        " = ? WHERE payment_receipt.payment_receipt_id = '" +
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

PaymentReceipt.updateByDocumentId = async (document_id, data, _updateby) => {
    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE payment_receipt SET " +
        columns.join(" = ? ,") +
        " = ? WHERE payment_receipt.payment_receipt_document_id = '" +
        document_id +
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

PaymentReceipt.delete = async (id) => {
    try {
        const result = await db.query(
            "UPDATE payment_receipt SET payment_receipt_status = 'cancelled' WHERE payment_receipt_id = ?",
            [id]
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

module.exports = PaymentReceipt;
