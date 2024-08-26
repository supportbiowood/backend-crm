const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Quotation = function (data) {
    this.quotation_document_id = data.quotation_document_id;
    this.ref_document_id = data.ref_document_id;
    this.quotation_issue_date = data.quotation_issue_date;
    this.quotation_valid_until_date = data.quotation_valid_until_date;
    this.quotation_status = data.quotation_status;
    this.quotation_stage = data.quotation_stage;
    this.revision_name = data.revision_name || null;
    this.billing_info = data.billing_info;
    this.quotation_data = data.quotation_data;
    this.sale_list = data.sale_list;
    this.quotation_approveby = data.quotation_approveby;
    this.quotation_approveby_employee = data.quotation_approveby_employee;
    this.quotation_accept_date = data.quotation_accept_date;
    this.quotation_template_remark_id = data.quotation_template_remark_id;
    this.quotation_remark = data.quotation_remark;
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

let model = "quotation";

Quotation.getAll = async () => {
    try {
        const result = await db.query(" \
        select q.* \
        from quotation as q \
        join(select distinct quotation.quotation_document_id, MAX(revision_id) as revision_id \
        from quotation \
        group by quotation_document_id) as t \
            on q.quotation_document_id = t.quotation_document_id \
                   and q.revision_id = t.revision_id");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Quotation.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM quotation WHERE quotation_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Quotation.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM quotation WHERE quotation_document_id = ? ORDER BY revision_id DESC", document_id
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Quotation.getByDocumentIdAndRevisionId = async (document_id, revision_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM quotation WHERE quotation_document_id = ? and revision_id = ? ", [document_id, revision_id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};


Quotation.getRevisionByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT revision_id, revision_name FROM quotation WHERE quotation_document_id = ? ORDER BY revision_id DESC", document_id
        );
        // console.log(model + " model get success", result);
        return result[0] || [];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Quotation.create = async (data, _createdby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.quotation_data = JSON.stringify(data.quotation_data);
    data.sale_list = JSON.stringify(data.sale_list) || null;
    data._quotation_created = moment().tz("Asia/Bangkok").unix();
    data._quotation_createdby = _createdby.employee_id;
    data._quotation_createdby_employee = JSON.stringify(_createdby);

    try {
        const result = await db.query("INSERT INTO `quotation` SET ?", [data]);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Quotation.update = async (id, data, _updateby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.quotation_data = JSON.stringify(data.quotation_data);
    data.sale_list = JSON.stringify(data.sale_list) || null;
    data._quotation_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._quotation_lastupdateby = _updateby.employee_id;
    data._quotation_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE quotation SET " +
        columns.join(" = ? ,") +
        " = ? WHERE quotation.quotation_id = " +
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

Quotation.updateById = async (id, data, _updateby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.quotation_data = JSON.stringify(data.quotation_data);
    data.sale_list = JSON.stringify(data.sale_list) || null;
    data._quotation_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._quotation_lastupdateby = _updateby.employee_id;
    data._quotation_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        "UPDATE quotation SET " +
        columns.join(" = ? ,") +
        " = ? WHERE quotation.quotation_id = '" +
        id + "'";

    try {

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Quotation.updateByDocumentId = async (document_id, revision_id, data, _updateby) => {
    data.billing_info = JSON.stringify(data.billing_info);
    data.quotation_data = JSON.stringify(data.quotation_data);
    data.sale_list = JSON.stringify(data.sale_list) || null;
    data._quotation_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._quotation_lastupdateby = _updateby.employee_id;
    data._quotation_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
        `UPDATE quotation SET ${columns.join(" = ? ,")} = ? 
        WHERE quotation.quotation_document_id = '${document_id}' and quotation.revision_id = ${revision_id}`;
    try {

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};


Quotation.delete = async (data, _updateby) => {
    data._quotation_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._quotation_lastupdateby = _updateby.employee_id;
    data._quotation_lastupdateby_employee = JSON.stringify(_updateby);
    try {
        const result = await db.query(
            "UPDATE quotation SET quotation_status = 'cancelled', _quotation_lastupdate = ?, _quotation_lastupdateby = ?, _quotation_lastupdateby_employee = ? WHERE quotation_id = ?",
            [
                data._quotation_lastupdate,
                data._quotation_lastupdateby,
                data._quotation_lastupdateby_employee,
                data.id
            ]
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

module.exports = Quotation;
