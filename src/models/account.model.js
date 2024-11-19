const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Account = function(data) {
    this.account_type_id = data.account_type_id;
    this.account_code = data.account_code;
    this.parent_account_id = data.parent_account_id;
    this.account_name = data.account_name;
    this.account_name_th = data.account_name_th;
    this.account_description = data.account_description;
    this.account_input_tax = data.account_input_tax;
    this.account_output_tax = data.account_output_tax;
    this.account_is_active = data.account_is_active;
    this.account_is_closed = data.account_is_closed;
};

let model = "Account";

Account.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM account");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Account.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account WHERE account.account_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Account.create = async (data, _createdby) => {
    try {
        data._account_created = moment().tz("Asia/Bangkok").unix();
        data._account_createdby = _createdby.employee_document_id;
        data._account_createdby_employee = JSON.stringify(_createdby);

        const result = await db.query(
            "INSERT INTO `account` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Account.update = async (id, data, _updateby) => {
    try {
        data._account_lastupdated = moment().tz("Asia/Bangkok").unix();
        data._account_lastupdatedby = _updateby.employee_document_id;
        data._account_lastupdatedby_employee = JSON.stringify(_updateby);

        const columns = Object.keys(data);
        const values = Object.values(data);

        let sql =
    "UPDATE account SET " +
    columns.join(" = ? ,") +
    " = ? WHERE account_id = " +
    id;

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Account.delete = async (id) => {
    try {
        const result = await db.query("DELETE FROM account WHERE account.account_id = ?", [id]);
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = Account;
