const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Person = function(data) {
    this.person_position = data.person_position;
    this.person_first_name = data.person_first_name;
    this.person_last_name = data.person_last_name;
    this.person_nick_name = data.person_nick_name;
    this.person_birthdate = data.person_birthdate;
    this.person_img_url = data.person_img_url;
    this.contact_id = data.contact_id;
    this.person_remark = data.person_remark;
};

let model = "person";

Person.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM person");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Person.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM person WHERE person.person_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Person.getByContactId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM person WHERE person.contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Person.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `person` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Person.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE person SET person_position = ?, person_first_name = ?, person_last_name = ?, person_nick_name = ?, person_birthdate = ?, person_img_url = ?, contact_id = ?, person_remark = ?  WHERE person_id = ?",
            [
                data.person_position,
                data.person_first_name,
                data.person_last_name,
                data.person_nick_name,
                data.person_birthdate,
                data.person_img_url,
                data.contact_id,
                data.person_remark,
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

Person.updateContactIdByPersonId = async (personId, contactId) => {
    try {
        const result = await db.query(
            "UPDATE person SET contact_id = ? WHERE person_id = ?",
            [
                contactId,
                personId
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Person.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM person WHERE person.person_id = ?",
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

module.exports = Person;
