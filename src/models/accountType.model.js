const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let AccountType = function(data) {
    this.account_type_name = data.account_type_name;
    this.account_type_general_type = data.account_type_general_type;
};

let model = "AccountType";

AccountType.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM account_type");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountType.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_type WHERE account_type.account_type_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountType.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `account_type` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

AccountType.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE account_type SET account_type.account_type_name = ?, account_type.account_type_general_type = ? WHERE account_type.account_type_id = ?",
            [
                data.account_type_name,
                data.account_type_general_type,
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

AccountType.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM account_type WHERE account_type.account_type_id = ?",
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

module.exports = AccountType;
