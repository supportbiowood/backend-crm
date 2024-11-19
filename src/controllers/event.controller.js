const axios = require("axios");
const eventModel = require("../models/event.model");
const contactModel = require("../models/contact.model");
const projectModel = require("../models/project.model");
const employeeModel = require("../models/employee.model");
const personModel = require("../models/person.model");
const projectActivityModel = require("../models/projectActivity.model");
const activityModel = require("../models/activity.model");
const contactChannelModel = require("../models/contactChannel.model");

const moment = require("moment");
require("moment-timezone");

function transformEventStatus(event_status) {
    switch (event_status) {
        case "planned":
            return "วางแผน";
        case "scheduled":
            return "นัดหมาย";
        case "checkin":
            return "เช็คอิน";
        case "finished":
            return "เสร็จสิ้น";
        case "cancelled":
            return "ยกเลิกนัด";
    }
}

exports.getAll = async (req, res) => {
    try {
        const eventResult = (await eventModel.getAll()) || [];
        const key = [
            "event_employee",
            "project",
            "contact",
            "person"
        ];
        const promiseFunctionList = [];
        for (let each of eventResult) {
            promiseFunctionList.push(employeeModel.getByDocumentId(each.event_employee_document_id));
            promiseFunctionList.push(projectModel.getById(each.project_id));
            promiseFunctionList.push(contactModel.getById(each.contact_id));
            promiseFunctionList.push(personModel.getById(each.person_id));
        }
        const resultList = await Promise.all(promiseFunctionList);
        for (let i = 0; i < eventResult.length; i++) {
            eventResult[i].event_status_text = transformEventStatus(eventResult[i].event_status);
            eventResult[i].event_employee = resultList[i * 4];
            eventResult[i].project = resultList[i * 4 + 1];
            eventResult[i].contact = resultList[i * 4 + 2];
            eventResult[i].person = resultList[i * 4 + 3];
        }
        return res.send({
            status: "success",
            data: eventResult,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const result = await eventModel.getById(req.params.id);
        result.event_employee = await employeeModel.getByDocumentId(
            result.event_employee_document_id
        );
        result.project = await projectModel.getById(result.project_id);
        result.contact = await contactModel.getById(result.contact_id);
        result.person = await personModel.getById(result.person_id);
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getAllOptions = async (req, res) => {
    try {
        let keys = [
            "event_employee",
            "project",
            "contact",
            "person"
        ];
        let queryParams = req.query;
        let { begin_date: beginDate, end_date: endDate } = queryParams;
        let sqlCondition = "1";

        if (beginDate && endDate) {
            sqlCondition += 
            ` AND ((event.event_plan_start_date BETWEEN ${beginDate} AND  ${endDate})
            OR (event.event_plan_end_date BETWEEN ${beginDate} AND  ${endDate})
            OR (event.event_schedule_start_date BETWEEN ${beginDate} AND  ${endDate})
            OR (event.event_schedule_end_date BETWEEN ${beginDate} AND  ${endDate})
            OR (event.event_checkin_start_date BETWEEN ${beginDate} AND  ${endDate})
            OR (event.event_checkin_dest_date BETWEEN ${beginDate} AND  ${endDate}))
            `;
        }
        if (req.query.event_employee_document_id) {
            sqlCondition = sqlCondition + ` AND event_employee_document_id = '${req.query.event_employee_document_id}'`;
        }
        const eventResult = await eventModel.getAllOptions(sqlCondition);

        let selectedParams = keys.filter((key) => {
            const parsedKey = parseInt(queryParams[key]);
            if (parsedKey) {
                return key;
            }
        });
        let promiseFunctionList = [];
        for (let each of eventResult) {
            for (let param of selectedParams) {
                switch (param) {
                    case "event_employee":
                        promiseFunctionList.push(employeeModel.getByDocumentId(each.employee_document_id));
                        break;
                    case "project":
                        promiseFunctionList.push(projectModel.getById(each.project_id));
                        break;
                    case "contact":
                        promiseFunctionList.push(contactModel.getById(each.contact_id));
                        break;
                    case "person":
                        promiseFunctionList.push(personModel.getById(each.person_id));
                        break;
                }
            }
        }
        const resultList = await Promise.all(promiseFunctionList);
        for (let i = 0; i < eventResult.length; i++) {
            for (let j = 0; j < selectedParams.length; j++) {
                eventResult[i][selectedParams[j]] = resultList[selectedParams.length * i + j];
            }
        }

        return res.send({
            status: "success",
            data: eventResult,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    const newData = new eventModel({
        ...req.body,
        event_employee_id: req.user.employee_id,
        event_employee_document_id: req.user.employee_document_id,
    });
    try {
        if (newData.event_status === "planned") {
            delete newData['event_schedule_start_date'];
            delete newData['event_schedule_end_date'];
        }

        if (newData.event_status === "scheduled") {
            delete newData['event_plan_start_date'];
            delete newData['event_plan_end_date'];
        }
        newData.person_id = newData.person_id !== undefined && newData.person_id !== null && newData.person_id !== "" ? parseInt(newData.person_id) : null;
        newData.project_id = newData.project_id !== undefined && newData.project_id !== null && newData.project_id !== "" ? parseInt(newData.project_id) : null;
        newData.contact_id = newData.contact_id !== undefined && newData.contact_id !== null && newData.contact_id !== "" ? parseInt(newData.contact_id) : null;
        const result = await eventModel.create(newData, req.user);

        //query event from database
        const event_data_db = await eventModel.getById(result.insertId);

        // prepare projectActivity data type event
        let project_activity_prep = {
            owner_id: newData.project_document_id,
            owner_type: "PROJECT",
            project_id: newData.project_id,
            activity_type: "event",
            activity_data: {
                event: event_data_db,
                event_plan_start_date: event_data_db.event_plan_start_date,
                event_plan_end_date: event_data_db.event_plan_end_date,
                event_schedule_start_date: event_data_db.event_schedule_start_date,
                event_schedule_end_date: event_data_db.event_schedule_end_date,
                event_checkin_start_date: event_data_db.event_checkin_start_date,
                event_checkin_dest_date: event_data_db.event_checkin_dest_date,
                event_distance_value: event_data_db.event_distance_value,
                event_distance_text: event_data_db.event_distance_text,
                event_duration_value: event_data_db.event_duration_value,
                event_duration_text: event_data_db.event_duration_text,
                event_status: event_data_db.event_status,
                description: `เพิ่ม ${event_data_db.event_topic} สถานะ ${transformEventStatus(event_data_db.event_status)}`
            }
        };

        if (project_activity_prep.activity_data.event.contact_id !== null) {
            project_activity_prep.activity_data.event.contact = await contactModel.getById(project_activity_prep.activity_data.event.contact_id);
            project_activity_prep.activity_data.event.contact.contact_channel_list = await contactChannelModel.getByRefId(project_activity_prep.activity_data.event.contact_id, "contact");
        } else {
            project_activity_prep.activity_data.event.contact = null;
        }
        project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_data);
        const newProjectActivityData = new projectActivityModel(project_activity_prep);
        //create projectActivity with project_activity_prep
        await projectActivityModel.create(newProjectActivityData, req.user);

        const newActivityData = new activityModel(project_activity_prep);
        await activityModel.create(newActivityData, req.user);

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.update = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        const event_old_data_db = await eventModel.getById(req.params.id);

        if (typeof (req.body.person_id) === "string") {
            if (req.body.person_id !== "") {
                req.body.person_id = parseInt(req.body.person_id);
            } else {
                req.body.person_id = null;
            }
        }

        if (typeof (req.body.contact_id) === "string") {
            if (req.body.contact_id !== "") {
                req.body.contact_id = parseInt(req.body.contact_id);
            } else {
                req.body.contact_id = null;
            }
        }

        if (typeof (req.body.project_id) === "string") {
            if (req.body.project_id !== "") {
                req.body.project_id = parseInt(req.body.project_id);
            } else {
                req.body.project_id = null;
            }
        }

        if (req.body.event_schedule_start_date !== null && req.body.event_schedule_start_date !== "" && req.body.event_schedule_end_date !== null && req.body.event_schedule_end_date !== "") {
            req.body.event_status = "scheduled";
        }

        const result = await eventModel.update(
            req.params.id,
            req.body,
            req.user
        );

        const event_new_data_db = await eventModel.getById(req.params.id);

        if (event_old_data_db.event_status !== event_new_data_db.event_status) {
            //prepare projectActivity data type event
            let project_activity_prep = {
                owner_id: event_new_data_db.project_document_id,
                owner_type: "PROJECT",
                project_id: event_new_data_db.project_id,
                activity_type: "event",
                activity_data: {
                    event: event_new_data_db,
                    event_plan_start_date: event_new_data_db.event_plan_start_date,
                    event_plan_end_date: event_new_data_db.event_plan_end_date,
                    event_schedule_start_date: event_new_data_db.event_schedule_start_date,
                    event_schedule_end_date: event_new_data_db.event_schedule_end_date,
                    event_checkin_start_date: event_new_data_db.event_checkin_start_date,
                    event_checkin_dest_date: event_new_data_db.event_checkin_dest_date,
                    event_distance_value: event_new_data_db.event_distance_value,
                    event_distance_text: event_new_data_db.event_distance_text,
                    event_duration_value: event_new_data_db.event_duration_value,
                    event_duration_text: event_new_data_db.event_duration_text,
                    event_status: event_new_data_db.event_status,
                    description: `เปลี่ยนสถานะของ ${req.body.event_topic} จาก ${transformEventStatus(event_old_data_db.event_status)} เป็น ${transformEventStatus(event_new_data_db.event_status)}`
                }
            };

            if (project_activity_prep.activity_data.event.contact_id !== null) {
                project_activity_prep.activity_data.event.contact = await contactModel.getById(project_activity_prep.activity_data.event.contact_id);
                project_activity_prep.activity_data.event.contact.contact_channel_list = await contactChannelModel.getByRefId(project_activity_prep.activity_data.event.contact_id, "contact");
            } else {
                project_activity_prep.activity_data.event.contact = null;
            }
            project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_data);
            const newProjectActivityData = new projectActivityModel(project_activity_prep);
            //create projectActivity with project_activity_prep
            await projectActivityModel.create(newProjectActivityData, req.user);

            const newActivityData = new activityModel(project_activity_prep);
            await activityModel.create(newActivityData, req.user);
        }
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.updateCancelStatus = async (req, res) => {
    try {

        //query old event data from database
        const event_old_data_db = await eventModel.getById(req.params.id).then((result) => {
            if (result !== null) {
                return result;
            } else {
                console.log("Don't have this event_id in database.");
            }
        });
        req.body.event_status = "cancelled";
        //udpate event_status
        const result = await eventModel.update(req.params.id, { event_status: req.body.event_status, event_cancel_date: moment().tz("Asia/Bangkok").unix(), event_remark: req.body.event_remark }, req.user);

        const event_new_data_db = await eventModel.getById(req.params.id);
        //prepare projectActivity data type event
        let project_activity_prep = {
            owner_id: event_new_data_db.project_document_id,
            owner_type: "PROJECT",
            project_id: event_new_data_db.project_id,
            activity_type: "event",
            activity_data: {
                event: event_new_data_db,
                event_plan_start_date: event_new_data_db.event_plan_start_date,
                event_plan_end_date: event_new_data_db.event_plan_end_date,
                event_schedule_start_date: event_new_data_db.event_schedule_start_date,
                event_schedule_end_date: event_new_data_db.event_schedule_end_date,
                event_checkin_start_date: event_new_data_db.event_checkin_start_date,
                event_checkin_dest_date: event_new_data_db.event_checkin_dest_date,
                event_distance_value: event_new_data_db.event_distance_value,
                event_distance_text: event_new_data_db.event_distance_text,
                event_duration_value: event_new_data_db.event_duration_value,
                event_duration_text: event_new_data_db.event_duration_text,
                event_status: event_new_data_db.event_status,
                description: `เปลี่ยนสถานะของ ${event_new_data_db.event_topic} จาก ${transformEventStatus(event_old_data_db.event_status)} เป็น ${transformEventStatus(event_new_data_db.event_status)}`
            }
        };

        if (project_activity_prep.activity_data.event.contact_id !== null) {
            project_activity_prep.activity_data.event.contact = await contactModel.getById(project_activity_prep.activity_data.event.contact_id);
            project_activity_prep.activity_data.event.contact.contact_channel_list = await contactChannelModel.getByRefId(project_activity_prep.activity_data.event.contact_id, "contact");
        } else {
            project_activity_prep.activity_data.event.contact = null;
        }
        project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_data);
        const newProjectActivityData = new projectActivityModel(project_activity_prep);
        //create projectActivity with project_activity_prep
        await projectActivityModel.create(newProjectActivityData, req.user);

        const newActivityData = new activityModel(project_activity_prep);
        await activityModel.create(newActivityData, req.user);

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.updateCheckInStart = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        //query old event data from database
        const event_old_data_db = await eventModel.getById(req.params.id);

        //prepare data send to google map api
        let latlng =
            "" +
            req.body.event_checkin_start_latitude +
            "," +
            req.body.event_checkin_start_longitude;
        let apiKey = "AIzaSyCAjf42kQ7YZ10o_zNSuJH1htD9kw5POvE";
        let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${apiKey}&language=th-TH`;

        //send latitude and longitude to google map api
        const resGoogleMapApi = await axios.get(url).then((response) => {
            return response.data.results[0];
        });
        req.body.event_checkin_start_location_name =
            resGoogleMapApi.formatted_address;
        req.body.event_checkin_start_date = moment().tz("Asia/Bangkok").unix();
        req.body.event_status = "checkin";

        //update event with data event_check_in_start
        const result = await eventModel.updateCheckInStart(
            req.params.id,
            req.body,
            req.user
        );
        result.event_checkin_start_location_name = req.body.event_checkin_start_location_name;

        const event_new_data_db = await eventModel.getById(req.params.id);
        //prepare projectActivity data type event
        let project_activity_prep = {
            owner_id: event_new_data_db.project_document_id,
            owner_type: "PROJECT",
            project_id: event_new_data_db.project_id,
            activity_type: "event",
            activity_data: {
                event: event_new_data_db,
                event_plan_start_date: event_new_data_db.event_plan_start_date,
                event_plan_end_date: event_new_data_db.event_plan_end_date,
                event_schedule_start_date: event_new_data_db.event_schedule_start_date,
                event_schedule_end_date: event_new_data_db.event_schedule_end_date,
                event_checkin_start_date: event_new_data_db.event_checkin_start_date,
                event_checkin_dest_date: event_new_data_db.event_checkin_dest_date,
                event_distance_value: event_new_data_db.event_distance_value,
                event_distance_text: event_new_data_db.event_distance_text,
                event_duration_value: event_new_data_db.event_duration_value,
                event_duration_text: event_new_data_db.event_duration_text,
                event_status: event_new_data_db.event_status,
                description: `เปลี่ยนสถานะของ ${event_new_data_db.event_topic} จาก ${transformEventStatus(event_old_data_db.event_status)} เป็น ${transformEventStatus(event_new_data_db.event_status)}`
            }
        };

        if (project_activity_prep.activity_data.event.contact_id !== null) {
            project_activity_prep.activity_data.event.contact = await contactModel.getById(project_activity_prep.activity_data.event.contact_id);
            project_activity_prep.activity_data.event.contact.contact_channel_list = await contactChannelModel.getByRefId(project_activity_prep.activity_data.event.contact_id, "contact");
        } else {
            project_activity_prep.activity_data.event.contact = null;
        }
        project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_data);
        const newProjectActivityData = new projectActivityModel(project_activity_prep);
        //create projectActivity with project_activity_prep
        await projectActivityModel.create(newProjectActivityData, req.user);

        const newActivityData = new activityModel(project_activity_prep);
        await activityModel.create(newActivityData, req.user);

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.updateCheckInDest = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        //query event by eventID
        const event_old_data_db = await eventModel.getById(req.params.id);

        //get distance from google map api
        const origins =
            "" +
            event_old_data_db.event_checkin_start_latitude +
            "," +
            event_old_data_db.event_checkin_start_longitude;
        const destinations =
            "" +
            req.body.event_checkin_dest_latitude +
            "," +
            req.body.event_checkin_dest_longitude;
        const apiKey = "AIzaSyCGrCo4Od9pA3Z_W8JUbbgF28a1j6yVV4Q";
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?mode=driving&origins=${origins}&destinations=${destinations}&language=th-TH&key=${apiKey}`;

        const resGoogleMapAPI = await axios.get(url).then((response) => {
            return {
                destination_addresses: response.data.destination_addresses[0],
                distance: response.data.rows[0].elements[0].distance,
                duration: response.data.rows[0].elements[0].duration,
            };
        });

        req.body.event_checkin_dest_location_name =
            resGoogleMapAPI.destination_addresses;
        req.body.event_checkin_dest_date = moment().tz("Asia/Bangkok").unix();
        req.body.event_distance_value = resGoogleMapAPI.distance.value;
        req.body.event_distance_text = resGoogleMapAPI.distance.text;
        req.body.event_duration_value = resGoogleMapAPI.duration.value;
        req.body.event_duration_text = resGoogleMapAPI.duration.text;
        req.body.event_status = "finished";

        //update event with data event_distance and event_checkin_dest
        const result = await eventModel.updateCheckInDest(
            req.params.id,
            req.body,
            req.user
        );
        
        result.event_checkin_start_location_name = req.body.event_checkin_start_location_name;
        result.event_checkin_dest_location_name = req.body.event_checkin_dest_location_name;

        const event_new_data_db = await eventModel.getById(req.params.id);
        //prepare projectActivity data type event
        let project_activity_prep = {
            owner_id: event_new_data_db.project_document_id,
            owner_type: "PROJECT",
            project_id: event_new_data_db.project_id,
            activity_type: "event",
            activity_data: {
                event: event_new_data_db,
                event_plan_start_date: event_new_data_db.event_plan_start_date,
                event_plan_end_date: event_new_data_db.event_plan_end_date,
                event_schedule_start_date: event_new_data_db.event_schedule_start_date,
                event_schedule_end_date: event_new_data_db.event_schedule_end_date,
                event_checkin_start_date: event_new_data_db.event_checkin_start_date,
                event_checkin_dest_date: event_new_data_db.event_checkin_dest_date,
                event_distance_value: event_new_data_db.event_distance_value,
                event_distance_text: event_new_data_db.event_distance_text,
                event_duration_value: event_new_data_db.event_duration_value,
                event_duration_text: event_new_data_db.event_duration_text,
                event_status: event_new_data_db.event_status,
                description: `เปลี่ยนสถานะของ ${event_new_data_db.event_topic} จาก ${transformEventStatus(event_old_data_db.event_status)} เป็น ${transformEventStatus(event_new_data_db.event_status)}`
            }
        };

        if (project_activity_prep.activity_data.event.contact_id !== null) {
            project_activity_prep.activity_data.event.contact = await contactModel.getById(project_activity_prep.activity_data.event.contact_id);
            project_activity_prep.activity_data.event.contact.contact_channel_list = await contactChannelModel.getByRefId(project_activity_prep.activity_data.event.contact_id, "contact");
        } else {
            project_activity_prep.activity_data.event.contact = null;
        }
        project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_data);
        const newProjectActivityData = new projectActivityModel(project_activity_prep);
        //create projectActivity with project_activity_prep
        await projectActivityModel.create(newProjectActivityData, req.user);

        const newActivityData = new activityModel(project_activity_prep);
        await activityModel.create(newActivityData, req.user);

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.updateFinishStatus = async (req, res) => {
    try {

        //query old event data from database
        const event_old_data_db = await eventModel.getById(req.params.id).then((result) => {
            if (result !== null) {
                return result;
            } else {
                console.log("Don't have this event_id in database.");
            }
        });
        req.body.event_status = "finished";
        //udpate event_status
        const result = await eventModel.updateStatus(req.params.id, req.body, req.user);

        const event_new_data_db = await eventModel.getById(req.params.id);
        //prepare projectActivity data type event
        let project_activity_prep = {
            owner_id: event_new_data_db.project_document_id,
            owner_type: "PROJECT",
            project_id: event_new_data_db.project_id,
            activity_type: "event",
            activity_data: {
                event: event_new_data_db,
                event_plan_start_date: event_new_data_db.event_plan_start_date,
                event_plan_end_date: event_new_data_db.event_plan_end_date,
                event_schedule_start_date: event_new_data_db.event_schedule_start_date,
                event_schedule_end_date: event_new_data_db.event_schedule_end_date,
                event_checkin_start_date: event_new_data_db.event_checkin_start_date,
                event_checkin_dest_date: event_new_data_db.event_checkin_dest_date,
                event_distance_value: event_new_data_db.event_distance_value,
                event_distance_text: event_new_data_db.event_distance_text,
                event_duration_value: event_new_data_db.event_duration_value,
                event_duration_text: event_new_data_db.event_duration_text,
                event_status: event_new_data_db.event_status,
                description: `เปลี่ยนสถานะของ ${event_new_data_db.event_topic} จาก ${transformEventStatus(event_old_data_db.event_status)} เป็น ${transformEventStatus(event_new_data_db.event_status)}`
            }
        };

        if (project_activity_prep.activity_data.event.contact_id !== null) {
            project_activity_prep.activity_data.event.contact = await contactModel.getById(project_activity_prep.activity_data.event.contact_id);
            project_activity_prep.activity_data.event.contact.contact_channel_list = await contactChannelModel.getByRefId(project_activity_prep.activity_data.event.contact_id, "contact");
        } else {
            project_activity_prep.activity_data.event.contact = null;
        }
        project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_data);
        const newProjectActivityData = new projectActivityModel(project_activity_prep);
        //create projectActivity with project_activity_prep
        await projectActivityModel.create(newProjectActivityData, req.user);

        const newActivityData = new activityModel(project_activity_prep);
        await activityModel.create(newActivityData, req.user);

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.delete = async (req, res) => {
    try {
        const result = await eventModel.delete(req.params.id);
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
