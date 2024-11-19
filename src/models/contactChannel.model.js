const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ContactChannel = function(data) {
    this.contact_channel_type = data.contact_channel_type;
    this.ref_id = data.ref_id;
    this.contact_channel_name = data.contact_channel_name;
    this.contact_channel_detail = data.contact_channel_detail;
    this.contact_channel_detail_2 = data.contact_channel_detail_2;
};

let model = "ContactChannel";

ContactChannel.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM contact_channel");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

ContactChannel.getByRefId = async (id, contact_channel_type) => {
    try {
        const result = await db.query(
            "SELECT * FROM contact_channel WHERE contact_channel.contact_channel_type = ? AND contact_channel.ref_id = ?",
            [
                contact_channel_type,
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

ContactChannel.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `contact_channel` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

ContactChannel.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE contact_channel SET contact_channel_type = ?, ref_id = ?, contact_channel_name = ?, contact_channel_detail = ?, contact_channel_detail_2 = ? WHERE contact_channel_id = ?",
            [
                data.contact_channel_type,
                data.ref_id,
                data.contact_channel_name,
                data.contact_channel_detail,
                data.contact_channel_detail_2,
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

ContactChannel.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM contact_channel WHERE contact_channel_id = ?",
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

ContactChannel.deleteByContactChannelTypeAndRefId = async (contact_channel_type, ref_id) => {
    try {
        const result = await db.query(
            "DELETE FROM contact_channel WHERE contact_channel_type = ? AND ref_id = ?",
            [
                contact_channel_type,
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

module.exports = ContactChannel;
