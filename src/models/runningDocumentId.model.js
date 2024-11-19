const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let RunningDocumentId = function (data) {
    this.document_type = data.document_type;
    this.last_document_id = data.last_document_id;
    this.document_year = data.document_year;
    this.document_month = data.document_month;
};

let model = 'runningDocumentId';

RunningDocumentId.getByType = async (type) => {
    try {
        const result = await db.query(
            "SELECT * FROM running_document_id WHERE document_type = ?",
            [type]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

RunningDocumentId.create = async (data) => {
    try {
        const result = await db.query(
            "INSERT INTO running_document_id SET ?",
            data
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

RunningDocumentId.update = async (type, data, _updateby) => {
    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE running_document_id SET " +
    columns.join(" = ? ,") +
    " = ? WHERE document_type = '" +
    type+"'";

    try {

        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = RunningDocumentId;
