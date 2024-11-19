const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let AccountJournal = function (data) {
    this.account_journal_ref_document_id = data.account_journal_ref_document_id;
    this.account_journal_ref_type = data.account_journal_ref_type;
    this.account_journal_status = data.account_journal_status;
    this.account_journal_remark_id = data.account_journal_remark_id;
    this._account_journal_issue_date = data._account_journal_issue_date;
};

let model = "AccountJournal";

AccountJournal.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM account_journal");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountJournal.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_journal WHERE account_journal.account_journal_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountJournal.getByRefDocumentId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_journal WHERE account_journal.account_journal_ref_document_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

AccountJournal.create = async (data, _createdby) => {
    try {
        data._account_journal_created = moment().tz("Asia/Bangkok").unix();
        data._account_journal_createdby = _createdby.employee_id;
        data._account_journal_createdby_employee = JSON.stringify(_createdby);

        const result = await db.query(
            "INSERT INTO `account_journal` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

AccountJournal.update = async (id, data, _updateby) => {
    try {
        data._account_journal_updated = moment().tz("Asia/Bangkok").unix();
        data._account_journal_updatedby = _updateby.employee_id;
        data._account_journal_updatedby_employee = JSON.stringify(_updateby);

        const columns = Object.keys(data);
        const values = Object.values(data);

        let sql =
      "UPDATE account_journal SET " +
      columns.join(" = ? ,") +
      " = ? WHERE account_journal_id = " +
      id;

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};


AccountJournal.updateByDocumentId = async (id, data, _updateby) => {
    try {
        data._account_journal_updated = moment().tz("Asia/Bangkok").unix();
        data._account_journal_updatedby = _updateby.employee_id;
        data._account_journal_updatedby_employee = JSON.stringify(_updateby);

        const columns = Object.keys(data);
        const values = Object.values(data);

        let sql =
    "UPDATE account_journal SET " +
    columns.join(" = ? ,") +
    " = ? WHERE account_journal_ref_document_id = " +
    id;

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

AccountJournal.delete = async (id) => {
    try {
        const result = await db.query("DELETE FROM account_journal WHERE account_journal.account_journal_id = ?", [id]);
        // console.log(model + " model delete success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = AccountJournal;
