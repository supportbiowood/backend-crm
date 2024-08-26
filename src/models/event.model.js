const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Event = function (data) {
    this.event_employee_id = data.event_employee_id;
    this.event_employee_document_id = data.event_employee_document_id;
    this.event_plan_start_date = data.event_plan_start_date;
    this.event_plan_end_date = data.event_plan_end_date;
    this.event_schedule_start_date = data.event_schedule_start_date;
    this.event_schedule_end_date = data.event_schedule_end_date;
    this.event_topic = data.event_topic;
    this.project_id = data.project_id;
    this.project_document_id = data.project_document_id;
    this.contact_id = data.contact_id;
    this.contact_document_id = data.contact_document_id;
    this.person_id = data.person_id;
    this.person_document_id = data.person_document_id;
    this.event_project_stage = data.event_project_stage;
    this.event_status = data.event_status;
    this.event_dest_location_name = data.event_dest_location_name;
    this.event_dest_latitude = data.event_dest_latitude;
    this.event_dest_longitude = data.event_dest_longitude;
    this.event_dest_google_map_link = data.event_dest_google_map_link;
    this.event_checkin_start_date = data.event_checkin_start_date;
    this.event_checkin_start_location_name = data.event_checkin_start_location_name;
    this.event_checkin_start_latitude = data.event_checkin_start_latitude;
    this.event_checkin_start_longitude = data.event_checkin_start_longitude;
    this.event_checkin_dest_date = data.event_checkin_dest_date;
    this.event_checkin_dest_location_name = data.event_checkin_dest_location_name;
    this.event_checkin_dest_latitude = data.event_checkin_dest_latitude;
    this.event_checkin_dest_longitude = data.event_checkin_dest_longitude;
    this.event_distance_value = data.event_distance_value;
    this.event_distance_text = data.event_distance_text;
    this.event_duration_value = data.event_duration_value;
    this.event_duration_text = data.event_duration_text;
    this.event_remark = data.event_remark;
};

let model = "event";

Event.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM event");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Event.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM event WHERE event.event_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Event.getAllOptions = async (condition = "1") => {
    try {
        let sql = `SELECT * FROM event WHERE ${condition}`;
        const result = await db.query(sql);
        // console.log(model + " model get success", result);
        return result[0] || [];
    } catch (error) {
        // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Event.getByProjectId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM event WHERE event.project_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Event.getByContactId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM event WHERE event.contact_id = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Event.getByCreatedId = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM event WHERE event._event_createdby = ?",
            [id]
        );
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Event.create = async (data, _createdby) => {
    data._event_created = moment().tz("Asia/Bangkok").unix();
    data._event_createdby = _createdby.employee_document_id;
    data._event_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query(
            "INSERT INTO `event` SET ?", data
        );
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Event.update = async (id, data, _lastupdateby) => {
    data._event_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._event_lastupdateby = _lastupdateby.employee_document_id;

    data._event_lastupdateby_employee = JSON.stringify(_lastupdateby);
    delete data["event_id"];
    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql = "UPDATE event SET " + columns.join(" = ? ,") + " = ? WHERE event.event_id = " + id;

    try {
        const result = await db.query(
            sql, values
        );
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Event.updateStatus = async (id, data, _lastupdateby) => {
    data._event_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._event_lastupdateby = _lastupdateby.employee_document_id;

    data._event_lastupdateby_employee = JSON.stringify(_lastupdateby);

    try {
        const result = await db.query(
            "UPDATE event SET event.event_status = ?, event.event_remark = ?, event._event_lastupdate = ?, event._event_lastupdateby = ?, event._event_lastupdateby_employee = ? WHERE event.event_id = ?",
            [
                data.event_status,
                data.event_remark,
                data._event_lastupdate,
                data._event_lastupdateby,
                data._event_lastupdateby_employee,
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

Event.updateCheckInStart = async (id, data, _lastupdateby) => {
    data._event_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._event_lastupdateby = _lastupdateby.employee_document_id;

    data._event_lastupdateby_employee = JSON.stringify(_lastupdateby);

    try {
        const result = await db.query(
            "UPDATE event SET event_status = ?, event_checkin_start_date = ?, event_checkin_start_location_name = ?, event_checkin_start_latitude = ?, event_checkin_start_longitude = ?, _event_lastupdate = ?, _event_lastupdateby = ?, _event_lastupdateby_employee = ? WHERE event_id = ?",
            [
                data.event_status,
                data.event_checkin_start_date,
                data.event_checkin_start_location_name,
                data.event_checkin_start_latitude,
                data.event_checkin_start_longitude,
                data._event_lastupdate,
                data._event_lastupdateby,
                data._event_lastupdateby_employee,
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

Event.updateCheckInDest = async (id, data, _lastupdateby) => {
    data._event_lastupdate = moment().tz("Asia/Bangkok").unix();
    data._event_lastupdateby = _lastupdateby.employee_document_id;

    data._event_lastupdateby_employee = JSON.stringify(_lastupdateby);

    try {
        const result = await db.query(
            "UPDATE event SET event_status = ?, event_checkin_dest_date = ?, event_checkin_dest_location_name = ?, event_checkin_dest_latitude = ?, event_checkin_dest_longitude = ?, event_distance_value = ?, event_distance_text = ?, event_duration_value = ?, event_duration_text = ?, _event_lastupdate = ?, _event_lastupdateby = ?, _event_lastupdateby_employee = ? WHERE event_id = ?",
            [
                data.event_status,
                data.event_checkin_dest_date,
                data.event_checkin_dest_location_name,
                data.event_checkin_dest_latitude,
                data.event_checkin_dest_longitude,
                data.event_distance_value,
                data.event_distance_text,
                data.event_duration_value,
                data.event_duration_text,
                data._event_lastupdate,
                data._event_lastupdateby,
                data._event_lastupdateby_employee,
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

Event.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM event WHERE event.event_id = ?",
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

module.exports = Event;
