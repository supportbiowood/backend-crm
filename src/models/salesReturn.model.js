const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let SalesReturn = function (data) {
    this.sales_return_document_id = data.sales_return_document_id;
    this.sales_order_document_id = data.sales_order_document_id;
    this.sales_return_issue_date = data.sales_return_issue_date;
    this.sales_return_delivery_date = data.sales_return_delivery_date;
    this.sales_return_status = data.sales_return_status;
    this.billing_info = data.billing_info;
    this.sales_return_data = data.sales_return_data;
    this.sales_return_template_remark_id = data.sales_return_template_remark_id;
    this.sales_return_remark = data.sales_return_remark;
    this.additional_discount = data.additional_discount;
    this.shipping_cost = data.shipping_cost;
    this.vat_exempted_amount = data.vat_exempted_amount;
    this.vat_0_amount = data.vat_0_amount;
    this.vat_7_amount = data.vat_7_amount;
    this.vat_amount = data.vat_amount;
    this.net_amount = data.net_amount;
    this.sales_return_reason = data.sales_return_reason;
    this.withholding_tax = data.withholding_tax;
    this.total_amount = data.total_amount;
};

let model = "sales_return";

SalesReturn.getAll = async () => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_return"
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesReturn.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_return WHERE sales_return_id = ?",
            [id]
        );
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesReturn.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_return WHERE sales_return_document_id = ?",
            [document_id]
        );
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesReturn.getAllBySalesOrderDocumentId = async (sales_order_document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_return WHERE sales_order_document_id = ?", sales_order_document_id
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesReturn.create = async (data, _createdby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.sales_return_data = JSON.stringify(data.sales_return_data);
    data._sales_return_created = moment().tz("Asia/Bangkok").unix();
    data._sales_return_createdby = _createdby.employee_id;
    data._sales_return_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `sales_return` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesReturn.update = async (id, data, _updateby) => {
    data._sales_return_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_return_lastupdateby = _updateby.employee_id;
    data._sales_return_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE sales_return SET " +
    columns.join(" = ? ,") +
    " = ? WHERE sales_return.sales_return_id = " +
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
SalesReturn.updateByDocumentId = async (documentId, data, _updateby) => {
    data._sales_return_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_return_lastupdateby = _updateby.employee_id;
    data._sales_return_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE sales_return SET " +
    columns.join(" = ? ,") +
    " = ? WHERE sales_return.sales_return_document_id = " +
    documentId;

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesReturn.delete = async (id, _updateby) => {
    let _sales_return_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _sales_return_lastupdateby = _updateby.employee_id;
    let _sales_return_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE sales_return SET sales_return_status = 'cancelled', _sales_return_lastupdate = ?, _sales_return_lastupdateby = ?, _sales_return_lastupdateby_employee = ? WHERE sales_return_id = ?",
            [
                _sales_return_lastupdate,
                _sales_return_lastupdateby,
                _sales_return_lastupdateby_employee,
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

module.exports = SalesReturn;