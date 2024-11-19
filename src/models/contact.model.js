const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Contact = function (data) {
    this.contact_is_customer = data.contact_is_customer;
    this.contact_is_vendor = data.contact_is_vendor;
    this.contact_business_category = data.contact_business_category;
    this.contact_commercial_type = data.contact_commercial_type;
    this.contact_commercial_name = data.contact_commercial_name;
    this.contact_individual_prefix_name = data.contact_individual_prefix_name;
    this.contact_individual_first_name = data.contact_individual_first_name;
    this.contact_individual_last_name = data.contact_individual_last_name;
    this.contact_merchant_name = data.contact_merchant_name;
    this.contact_tax_no = data.contact_tax_no;
    this.contact_registration_address_id = data.contact_registration_address_id;
    this.lead_source_name = data.lead_source_name;
    this.contact_img_url = data.contact_img_url;
    // this.bank_account_id = data.bank_account_id;
    this.account_receivable_id = data.account_receivable_id;
    this.account_payable_id = data.account_payable_id;
    this.contact_payment_type = data.contact_payment_type;
    this.contact_is_credit_limit = data.contact_is_credit_limit;
    this.contact_credit_limit_amount = data.contact_credit_limit_amount;
};

let model = "contact";

Contact.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM contact");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Contact.getTotalRow = async () => {
    try {
        const result = await db.query("SELECT COUNT(*) AS total FROM contact");
        // console.log(model + " model get success", result);
        return result[0][0];
    }
    catch (error) {
        throw new Error(`${model} model get total row ${error}`);
    }
};

Contact.getAllAvailable = async (page, pageSize) => {
    try {
        let sql = `SELECT * FROM contact where contact_status not like 'delete'`;
        if (page >= 0 && pageSize >= 0) {
            sql = sql + ` LIMIT ${pageSize} OFFSET ${pageSize * (page)}`;
        }
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

/**
 * 
 * @param {ArrayObject} select_attribute 
 * @param {String} condition 
 * @returns 
 */
Contact.getCustomByCondition = async (select_attribute, condition = 1) => {
    try {
        let sql = `SELECT ${select_attribute} FROM contact WHERE ${condition}`;
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Contact.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM contact WHERE contact.contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Contact.fullFilter = async (sqlStatement = '') => {
    try {
        let sql = 
        `select tag.tag_name as tag_name, contact.*, cc.*, pc.project_count as project_count, contact_name, contact_type
        from contact 
        left join 
                  ( SELECT count(*) as project_count, contact_id as ct_id from project_contact GROUP by project_contact.contact_id ) as pc 
          on contact.contact_id = pc.ct_id 
        left join (
                  SELECT GROUP_CONCAT(tag.tag_name) as tag_name, contact_id as ct_id  FROM tag INNER JOIN contact_tag ON tag.tag_id = contact_tag.tag_id
                    group by ct_id
                ) as tag
          on contact.contact_id = tag.ct_id
        left join (
                    select ref_id, GROUP_CONCAT(concat(contact_channel_name,':', COALESCE(contact_channel_detail, ''),',', COALESCE(contact_channel_detail_2, '')), '***') as contact_channel_list
                    from contact_channel
                    where contact_channel.contact_channel_type = 'contact'
                    GROUP by ref_id
                ) as cc
          on contact.contact_id = cc.ref_id
        left join ( 
          select ( 
            CASE
              when contact.contact_business_category = 'individual'
                then concat(contact.contact_individual_prefix_name, ' ', contact.contact_individual_first_name, ' ', contact.contact_individual_last_name)
              when contact.contact_business_category = 'commercial'
                then concat(contact.contact_commercial_type,' ', contact.contact_commercial_name)
              when contact.contact_business_category = 'merchant'
                then contact.contact_merchant_name
              END) as contact_name, contact.contact_id as ct_id
          from contact) as cn
          on contact.contact_id = cn.ct_id
        left join ( 
                select (
                case 
                when contact.contact_is_customer = 1 and contact.contact_is_vendor = 0 
                    then 'ลูกค้า' 
                when contact.contact_is_vendor = 1 and contact.contact_is_customer = 0 
                    then 'ผู้ขาย' 
                when contact.contact_is_customer =1 and contact.contact_is_vendor =1 
                    then 'ลูกค้า,ผู้ขาย' 
                end)  as contact_type , contact.contact_id as ct_id
            from contact) as ct
        on contact.contact_id = ct.ct_id
        ${sqlStatement}
        `;
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Contact.fullFilterTotalRow = async (sqlStatement = '') => {
    try {
        let sql = 
        `select count(*) as total
        from contact 
        left join 
                  ( SELECT count(*) as project_count, contact_id as ct_id from project_contact GROUP by project_contact.contact_id ) as pc 
          on contact.contact_id = pc.ct_id 
        left join (
                  SELECT GROUP_CONCAT(tag.tag_name) as tag_name, contact_id as ct_id  FROM tag INNER JOIN contact_tag ON tag.tag_id = contact_tag.tag_id
                    group by ct_id
                ) as tag
          on contact.contact_id = tag.ct_id
        left join (
                    select ref_id, GROUP_CONCAT(concat(contact_channel_name,':', COALESCE(contact_channel_detail, ''),',', COALESCE(contact_channel_detail_2, '')), '***') as contact_channel_list
                    from contact_channel
                    where contact_channel.contact_channel_type = 'contact'
                    GROUP by ref_id
                ) as cc
          on contact.contact_id = cc.ref_id
        left join ( 
          select ( 
            CASE
              when contact.contact_business_category = 'individual'
                then concat(contact.contact_individual_prefix_name, ' ', contact.contact_individual_first_name, ' ', contact.contact_individual_last_name)
              when contact.contact_business_category = 'commercial'
                then concat(contact.contact_commercial_type,' ', contact.contact_commercial_name)
              when contact.contact_business_category = 'merchant'
                then contact.contact_merchant_name
              END) as contact_name, contact.contact_id as ct_id
          from contact) as cn
          on contact.contact_id = cn.ct_id
        left join ( 
                select (
                case 
                when contact.contact_is_customer = 1 and contact.contact_is_vendor = 0 
                    then 'ลูกค้า' 
                when contact.contact_is_vendor = 1 and contact.contact_is_customer = 0 
                    then 'ผู้ขาย' 
                when contact.contact_is_customer =1 and contact.contact_is_vendor =1 
                    then 'ลูกค้า,ผู้ขาย' 
                end)  as contact_type , contact.contact_id as ct_id
            from contact) as ct
        on contact.contact_id = ct.ct_id
        ${sqlStatement}
        `;
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Contact.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT contact.*, project_contact.person_id FROM contact INNER JOIN project_contact ON contact.contact_id = project_contact.contact_id WHERE project_contact.project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Contact.create = async (data, _createdby) => {
    data._contact_created = moment().tz("Asia/Bangkok").unix();
    data._contact_createdby = _createdby.employee_document_id;
    data._contact_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query(
            "INSERT INTO `contact` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Contact.update = async (id, data, _lastupdateby) => {
    data._contact_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._contact_lastupdateby = _lastupdateby.employee_document_id;
    data._contact_lastupdateby_employee = JSON.stringify(_lastupdateby);
    //delete data["contact_id"];
    try {
        let sql = `UPDATE contact SET ? WHERE contact_id = ?`;
        const result = await db.query(sql, [data, id]);

        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Contact.delete = async (id, _lastupdateby) => {
    let data = {};
    data._contact_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._contact_lastupdateby = _lastupdateby.employee_document_id;
    data._contact_lastupdateby_employee = JSON.stringify(_lastupdateby);
    try {
        const result = await db.query(
            "UPDATE contact SET contact_status = 'delete', _contact_lastupdate = ?, _contact_lastupdateby = ?, _contact_lastupdateby_employee = ? WHERE contact_id = ?",
            [
                data._contact_lastupdate,
                data._contact_lastupdateby,
                data._contact_lastupdateby_employee,
                id
            ]
        );
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = Contact;
