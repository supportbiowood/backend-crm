const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ProjectContact = function (data) {
    this.contact_id = data.contact_id;
    this.project_id = data.project_id;
    this.role = data.role;
    this.person_id = data.person_id;
};

let model = "ProjectContact";

ProjectContact.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM project_contact WHERE project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0] || [];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectContact.getProjectByContactId = async (id) => {
    try {
        const result = await db.query(
            "SELECT project.* FROM project_contact LEFT JOIN project on project_contact.project_id = project.project_id WHERE contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectContact.getContactMemberByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT project_contact.*, contact.*, person.person_position, person.person_first_name, person.person_last_name, person.person_nick_name, person.person_birthdate, person.person_img_url, person.person_remark FROM project_contact JOIN contact on project_contact.contact_id = contact.contact_id LEFT JOIN person on project_contact.person_id = person.person_id WHERE project_contact.project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ProjectContact.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `project_contact` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

ProjectContact.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE project_contact SET project_id = ?, contact_id = ?, role = ?, person_id = ? WHERE project_contact_id = ?",
            [
                data.project_id,
                data.contact_id,
                data.role,
                data.person_id,
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

ProjectContact.delete = async (id) => {
    try {
        const result = await db.query(
            "DELETE FROM project_contact WHERE project_contact_id = ?",
            [
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


module.exports = ProjectContact;
