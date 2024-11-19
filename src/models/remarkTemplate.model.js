const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let RemarkTemplate = function (data) {
    this.remark_template_name = data.remark_template_name;
    this.template = data.template;
};

let model = "remark_template";

RemarkTemplate.getAll = async (id) => {
    try {
        const result = await db.query("SELECT * FROM remark_template", [id]);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

RemarkTemplate.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM remark_template WHERE remark_template_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

RemarkTemplate.create = async (data, _createdby) => {
    data._remark_template_created = moment().tz("Asia/Bangkok").unix();
    data._remark_template_createdby = _createdby.employee_id;
    data._remark_template_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query("INSERT INTO remark_template SET ?", data);
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

RemarkTemplate.update = async (id, data, _updateby) => {
    data._remark_template_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._remark_template_lastupdateby = _updateby.employee_id;
    data._remark_template_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
    "UPDATE remark_template SET " +
    columns.join(" = ? ,") +
    " = ? WHERE remark_template_id = " +
    id;

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

RemarkTemplate.delete = async (id) => {
    try {
        const result = await db.query('DELETE FROM remark_template WHERE remark_template_id = ?', id );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = RemarkTemplate;
