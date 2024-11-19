const db = require("../utils/database");
const moment = require("moment");
const { ActivityRefTypeOwnerType } = require("../enums/activityEnum");
require("moment-timezone");

let Activity = function(data) {
    this.owner_id = data.owner_id;
    this.owner_type = data.owner_type;
    this.activity_type = data.activity_type;
    this.activity_data = data.activity_data || data;
};

let model = "Activity";

Activity.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM activity");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Activity.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM activity WHERE activity.activity_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Activity.getByOwnerId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM activity WHERE owner_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Activity.getByOwnerType = async (type) => {
    try {
        const result = await db.query(
            "SELECT * FROM activity WHERE owner_type = ?",
            [ActivityRefTypeOwnerType(type)]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};


Activity.getByEmployeeId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM activity WHERE _activity_createdby = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Activity.create = async (data, _createdby) => {
    data._activity_created = moment().tz("Asia/Bangkok").unix();
    data._activity_createdby = _createdby.employee_document_id;
    data._activity_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query(
            "INSERT INTO `activity` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Activity.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM activity WHERE activity.activity_id = ?",
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

module.exports = Activity;
