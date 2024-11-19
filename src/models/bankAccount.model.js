const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let BankAccount = function(data) {
    this.contact_id = data.contact_id;
    this.bank_account_id = data.bank_account_id;
    this.bank_account_no = data.bank_account_no;
    this.bank_account_bank_name	 = data.bank_account_bank_name	;
    this.bank_account_type = data.bank_account_type;
    this.bank_account_name = data.bank_account_name;
    this.bank_account_branch = data.bank_account_branch;
    this.bank_account_description = data.bank_account_description;
};

let model = "BankAccount";

BankAccount.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM bank_account");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

BankAccount.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM bank_account WHERE bank_account.bank_account_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

BankAccount.getByContactId = async (id) => {
    try {
        const result = await db.query(
            "SELECT bank_account.* FROM bank_account WHERE bank_account.contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

BankAccount.create = async (data) => {
    try {
        const result = await db.query(
            "INSERT INTO `bank_account` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

BankAccount.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE bank_account SET bank_account.contact_id = ?, bank_account.bank_account_no = ?, bank_account.bank_account_bank_name = ?, bank_account.bank_account_type = ?, bank_account.bank_account_name = ?, bank_account.bank_account_branch = ?, bank_account.bank_account_description = ? WHERE bank_account.bank_account_id = ?",
            [
                data.contact_id,
                data.bank_account_no,
                data.bank_account_bank_name,
                data.bank_account_type,
                data.bank_account_name,
                data.bank_account_branch,
                data.bank_account_description,
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
BankAccount.updateContactIdByBankAccountId = async (bankAccountId, contactId) => {
    try {
        const result = await db.query(
            "UPDATE bank_account SET contact_id = ? WHERE bank_account_id = ?",
            [
                contactId,
                bankAccountId
            ]
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

BankAccount.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM bank_account WHERE bank_account.bank_account_id = ?",
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

module.exports = BankAccount;
