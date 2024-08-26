const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let AccountTransaction = function (data) {
    this.account_transaction_id = data.account_transaction_id;
    this.account_transaction_ref_id = data.account_transaction_ref_id;
    this.account_transaction_ref_type = data.account_transaction_ref_type;
    this.account_transaction_type = data.account_transaction_type;
    this.account_id = data.account_id;
    this.amount = data.amount;
    this.account_transaction_detail = data.account_transaction_detail;
    this.account_transaction_vat = data.account_transaction_vat;
};

let model = "AccountTransaction";

AccountTransaction.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM account_transaction");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountTransaction.getByAccountId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_transaction WHERE account_transaction.account_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountTransaction.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_transaction WHERE account_transaction.account_transaction_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountTransaction.getByAccountJournalId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_transaction WHERE account_transaction.account_journal_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountTransaction.create = async (data, _createdby) => {
    try {
        data._account_transaction_created = moment().tz("Asia/Bangkok").unix();
        data._account_transaction_createdby = _createdby.employee_id;
        data._account_transaction_createdby_employee = JSON.stringify(_createdby);

        const result = await db.query(
            "INSERT INTO `account_transaction` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

AccountTransaction.update = async (id, data, _updateby) => {
    try {
        data._account_transaction_lastupdate = moment().tz("Asia/Bangkok").unix();
        data._account_transaction_lastupdateby = _updateby.employee_id;
        data._account_transaction_lastupdateby_employee = JSON.stringify(_updateby);

        const columns = Object.keys(data);
        const values = Object.values(data);

        let sql =
            "UPDATE account_transaction SET " +
            columns.join(" = ? ,") +
            " = ? WHERE account_transaction_id = " +
            id;

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

AccountTransaction.delete = async (id) => {
    try {
        const result = await db.query("DELETE FROM account_transaction WHERE account_transaction.account_transaction_id = ?", [id]);
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = AccountTransaction;
