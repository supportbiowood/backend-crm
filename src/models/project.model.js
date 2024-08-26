const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Project = function (data) {
    this.project_name = data.project_name;
    this.project_category = data.project_category;
    this.project_stage = data.project_stage;
    this.project_type = data.project_type;
    this.project_type_detail = data.project_type_detail;
    this.project_deal_confidence = data.project_deal_confidence;
    this.project_deal_target_date = data.project_deal_target_date;
    this.project_deal_value = data.project_deal_value;
    this.project_address_id = data.project_address_id;
    this.project_billing_business_category =
        data.project_billing_business_category;
    this.project_billing_commercial_type = data.project_billing_commercial_type;
    this.project_billing_commercial_name = data.project_billing_commercial_name;
    this.project_billing_individual_prefix =
        data.project_billing_individual_prefix;
    this.project_billing_individual_first_name =
        data.project_billing_individual_first_name;
    this.project_billing_individual_last_name =
        data.project_billing_individual_last_name;
    this.project_billing_merchant_name = data.project_billing_merchant_name;
    this.project_billing_tax_no = data.project_billing_tax_no;
    this.project_billing_branch = data.project_billing_branch;
    this.project_billing_address_id = data.project_billing_address_id;
    this.project_remark = data.project_remark;
    this.project_status = data.project_status;
    this.project_installment_status = data.project_installment_status;
    this.project_shipment_status = data.project_shipment_status;
    this.project_payment_status = data.project_payment_status;
    this.project_approval_status = data.project_approval_status;
    this.project_approver = data.project_approver;
};

let model = "project";

Project.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM project WHERE project_status != 'delete'");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Project.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project WHERE project.project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Project.getByDocumentId = async (document_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project WHERE project.project_document_id = ?",
            [document_id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};
/**
 * 
 * @param {string} condition
 * @returns return any result that match condition
 * the condition should be SQL like after where in sql
 * eg. condition = "status like 'finish'" 
 */
Project.getAllOptions = async (condition = 1) => {
    try {
        const result = await db.query(
            `SELECT * FROM project WHERE ${condition}`
        );
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Project.getByContactId = async (id) => {
    try {
        const result = await db.query(
            "SELECT DISTINCT(project.project_id) AS running, project.* FROM project LEFT JOIN `project_contact` ON project_contact.project_id = project.project_id WHERE project_contact.contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};


Project.create = async (data, _createdby) => {
    data._project_created = moment().tz("Asia/Bangkok").unix();
    data._project_createdby = _createdby.employee_id;
    data._project_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query("INSERT INTO `project` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Project.update = async (id, data, _lastupdateby) => {
    data._project_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._project_lastupdateby = _lastupdateby.employee_id;
    data._project_lastupdateby_employee = JSON.stringify(_lastupdateby);
    try {
        const result = await db.query(
            "UPDATE project SET project.project_name = ?, project.project_category =? , project.project_stage = ?, project.project_type = ?, project.project_type_detail = ?, project.project_deal_confidence = ? , project.project_deal_target_date = ? , project.project_deal_value = ? , project.project_address_id = ? , project.project_billing_business_category = ? , project.project_billing_commercial_type = ? , project.project_billing_commercial_name = ? , project.project_billing_individual_prefix = ? , project.project_billing_individual_first_name = ? , project.project_billing_individual_last_name = ? , project.project_billing_merchant_name = ? , project.project_billing_tax_no = ?, project.project_billing_branch = ?, project.project_billing_address_id = ? , project.project_remark = ? , project.project_status = ? , project.project_installment_status = ? , project.project_shipment_status = ? , project.project_payment_status = ? , project.project_approval_status = ? , project.project_approver = ? , project._project_lastupdate = ? , project._project_lastupdateby = ?, project._project_lastupdateby_employee = ? WHERE project.project_id = ?",
            [
                data.project_name,
                data.project_category,
                data.project_stage,
                data.project_type,
                data.project_type_detail,
                data.project_deal_confidence,
                data.project_deal_target_date,
                data.project_deal_value,
                data.project_address_id,
                data.project_billing_business_category,
                data.project_billing_commercial_type,
                data.project_billing_commercial_name,
                data.project_billing_individual_prefix,
                data.project_billing_individual_first_name,
                data.project_billing_individual_last_name,
                data.project_billing_merchant_name,
                data.project_billing_tax_no,
                data.project_billing_branch,
                data.project_billing_address_id,
                data.project_remark,
                data.project_status,
                data.project_installment_status,
                data.project_shipment_status,
                data.project_payment_status,
                data.project_approval_status,
                data.project_approver,
                data._project_lastupdate,
                data._project_lastupdateby,
                data._project_lastupdateby_employee,
                id,
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Project.delete = async (id, _lastupdateby) => {
    let data = {};
    data._project_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._project_lastupdateby = _lastupdateby.employee_id;
    data._project_lastupdateby_employee = JSON.stringify(_lastupdateby);
    try {
        const projectResult = await db.query(
            "UPDATE project SET project.project_status = 'DELETE', project._project_lastupdate = ?, project._project_lastupdateby = ?, project._project_lastupdateby_employee = ? WHERE project.project_id = ?",
            [
                data._project_lastupdate,
                data._project_lastupdateby,
                data._project_lastupdateby_employee,
                id
            ]
        );
        const warrantyResult = await db.query(
            "update warranty set warranty_status = 'DELETE' \
             where project_id = ?", [id]);
        // console.log(model + " model delete success", result);
        return [projectResult[0], warrantyResult[0]];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = Project;
