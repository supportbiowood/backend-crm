const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let SalesOrder = function (data) {
    this.sales_order_document_id = data.sales_order_document_id;
    this.quotation_document_id = data.quotation_document_id;
    this.sales_order_issue_date = data.sales_order_issue_date;
    this.sales_order_due_date = data.sales_order_due_date;
    this.sales_order_expect_date = data.sales_order_expect_date;
    this.sales_order_status = data.sales_order_status;
    this.sales_order_stage = data.sales_order_stage;
    this.billing_info = data.billing_info;
    this.sales_order_data = data.sales_order_data;
    this.sale_list = data.sale_list;
    this.sales_order_template_remark_id = data.sales_order_template_remark_id;
    this.sales_order_remark = data.sales_order_remark;
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

let model = "sales_order";

SalesOrder.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM sales_order");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesOrder.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_order WHERE sales_order_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

SalesOrder.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_order WHERE sales_order_document_id = ?", document_id
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
SalesOrder.getByContactId = async (contact_id) => {
    try {
        const sql = `SELECT * FROM sales_order WHERE JSON_EXTRACT(billing_info, '$.contact_id') = ${contact_id}`;
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

SalesOrder.getByQuotationDocumentId = async (quotation_document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM sales_order WHERE quotation_document_id = ?",
            [quotation_document_id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
SalesOrder.create = async (data, _createdby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.sale_list = JSON.stringify(data.sale_list);
    data.sales_order_data = JSON.stringify(data.sales_order_data);
    data._sales_order_created = moment().tz("Asia/Bangkok").unix();
    data._sales_order_createdby = _createdby.employee_id;
    data._sales_order_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `sales_order` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

SalesOrder.update = async (id, data, _updateby) => {
    data._sales_order_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_order_lastupdateby = _updateby.employee_id;
    data._sales_order_lastupdateby_employee = JSON.stringify(_updateby);
  
    const columns = Object.keys(data);
    const values = Object.values(data);
  
    let sql =
      "UPDATE sales_order SET " +
      columns.join(" = ? ,") +
      " = ? WHERE sales_order.sales_order_id = " +
      id;
  
    try {
        // const result = await db.query(
        //   "UPDATE quotation SET quotation_data = ?, _quotation_lastupdate = ?, _quotation_lastupdateby = ? WHERE quotation_id = ?",
        //   [
        //     data.quotation_data,
        //     data._quotation_lastupdate,
        //     data._quotation_lastupdateby,
        //     id,
        //   ]
        // );
  
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

SalesOrder.updateByDocumentId = async (document_id, data, _updateby) => {
    data._sales_order_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._sales_order_lastupdateby = _updateby.employee_id;
    data._sales_order_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE sales_order SET " +
    columns.join(" = ? ,") +
    " = ? WHERE sales_order.sales_order_document_id = '" +
    document_id+"'";

    try {

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
SalesOrder.delete = async (id, _updateby) => {
    let _sales_order_lastupdate = moment().tz("Asia/Bangkok").unix();
    let _sales_order_lastupdateby = _updateby.employee_id;
    let _sales_order_lastupdateby_employee = JSON.stringify(_updateby);

    try {

        const result = await db.query("UPDATE sales_order SET sales_order_status = 'cancelled', _sales_order_lastupdate = ?, _sales_order_lastupdateby = ?, _sales_order_lastupdateby_employee = ? WHERE sales_order_id = ?", [id, _sales_order_lastupdate, _sales_order_lastupdateby, _sales_order_lastupdateby_employee]);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = SalesOrder;
