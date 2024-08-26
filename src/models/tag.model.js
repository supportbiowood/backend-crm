const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Tag = function(data) {
    this.tag_name = data.tag_name;
};

let model = "tag";

Tag.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM tag");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Tag.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM tag WHERE tag.tag_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Tag.getByContactId = async (id) => {
    try {
        const result = await db.query(
            "SELECT tag.* FROM tag INNER JOIN `contact_tag` ON tag.tag_id = contact_tag.tag_id WHERE contact_tag.contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Tag.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT tag.* FROM tag INNER JOIN `project_tag` ON tag.tag_id = project_tag.tag_id WHERE project_tag.project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Tag.getByTagName = async (tag_name) => {
    try {
        const result = await db.query(
            "SELECT * FROM tag WHERE tag_name = ?",
            [tag_name]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Tag.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `tag` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Tag.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE tag SET tag.tag_name = ? WHERE tag.tag_id = ?",
            [
                data.tag_name,
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

Tag.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM tag WHERE tag.tag_id = ?",
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

module.exports = Tag;
