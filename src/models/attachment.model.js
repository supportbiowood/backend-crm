const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Attachment = function (data) {
    this.attachment_file_name = data.attachment_file_name;
    this.attachment_file_type = data.attachment_file_type;
    this.attachment_url = data.attachment_url;
    this.attachment_type = data.attachment_type;
    this.ref_id = data.ref_id;
    this.ref_document_id = data.ref_document_id;
};

let model = "Attachment";

Attachment.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM attachment");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Attachment.getByRefId = async (id, attachment_type) => {
    try {
        const result = await db.query(
            "SELECT * FROM attachment WHERE attachment.attachment_type = ? AND attachment.ref_id = ?",
            [
                attachment_type,
                id
            ]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Attachment.getByIdList = async (attachment_id_list = [0]) => {
    try {
        const result = await db.query(`SELECT * FROM attachment WHERE attachment.attachment_id in ( ${attachment_id_list} ) `);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }

};

Attachment.create = async (data, _createdby) => {
    data._attachment_created = moment().tz("Asia/Bangkok").unix();
    data._attachment_createdby = _createdby.employee_id;
    data._attachment_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query(
            "INSERT INTO `attachment` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Attachment.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE attachment SET attachment.attachment_file_name = ?, attachment.attachment_file_type = ?, attachment.attachment_url = ?, attachment.attachment_type = ? WHERE attachment.attachment_type = ? AND attachment.ref_id = ?",
            [
                data.attachment_file_name,
                data.attachment_file_type,
                data.attachment_url,
                data.attachment_type,
                id
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
Attachment.updateAllRemarkByAttachmentTypeAndRefId = async (attachmentType, refId, attachmentRemark) => {
    try {
        const result = await db.query(
            "UPDATE attachment SET attachment.attachment_remark = ? WHERE attachment.attachment_type = ? AND attachment.ref_id = ?",
            [
                attachmentRemark,
                attachmentType,
                refId
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Attachment.updateContactIdByAttachmentId = async (attachment_id, contactId) => {
    try {
        const result = await db.query(
            "UPDATE attachment SET ref_id = ? WHERE attachment_id = ?",
            [
                contactId,
                attachment_id
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};
/**
 * 
 * @param {*} id could be id list or id 
 * @returns 
 */
Attachment.delete = async (id = 0) => {
    try {
        const result = await db.query(
            `DELETE FROM attachment WHERE attachment_id in ( ${id} )`,
        );
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

Attachment.deleteByCondition = async (condition = "attachment_id = 0") => {
    try {
        const result = await db.query(
            `DELETE FROM attachment WHERE ${condition}`
        );
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }

};

Attachment.deleteByAttachmentTypeAndRefId = async (attachment_type, ref_id) => {
    try {
        const result = await db.query(
            "DELETE FROM attachment WHERE attachment_type = ? AND ref_id",
            [
                attachment_type,
                ref_id
            ]
        );
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = Attachment;
