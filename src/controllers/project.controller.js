const db = require("../utils/database");

const projectModel = require("../models/project.model");
const contactModel = require("../models/contact.model");
const tagModel = require("../models/tag.model");
const employeeModel = require("../models/employee.model");
const personModel = require("../models/person.model");
const addressModel = require("../models/address.model");
const contactChannelModel = require("../models/contactChannel.model");
const accountModel = require("../models/account.model");
const bankAccountModel = require("../models/bankAccount.model");
const attachmentModel = require("../models/attachment.model");
const eventModel = require("../models/event.model");
const warrantyModel = require("../models/warranty.model");
const projectContactModel = require("../models/projectContact.model");
const projectEmployeeModel = require("../models/projectEmployee.model");
const projectTagModel = require("../models/projectTag.model");
const projectStatusLogModel = require("../models/projectStatusLog.model");
const projectActivityModel = require("../models/projectActivity.model");
const activityModel = require("../models/activity.model");
const moment = require("moment");

const { genDocumentId } = require("../utils/generate");

function transformProjectStatus(project_status) {
    switch (project_status) {
        case "new":
            return "โปรเจคใหม่";
        case "ongoing":
            return "กำลังดำเนินการ";
        case "quotation":
            return "เสนอราคา";
        case "quotation_accepted":
            return "ยอมรับใบเสนอราคา";
        case "closed_fail":
            return "ปิดไม่ได้";
        case "finished":
            return "จบโครงการ";
        case "service":
            return "ดูแลงาน";
        case "service_ended":
            return "ดูแลงานเสร็จสิ้น";
        case "delete":
            return "ลบโปรเจค";
    }
}

exports.getAll = async (req, res) => {
    try {
        let projectResult;
        if (req.query.contact_id)
            projectResult = (await projectModel.getByContactId(req.query.contact_id)) || [];
        else projectResult = (await projectModel.getAll()) || [];

        let key = [
            'tag_list',
            'project_employee_list',
            'project_address',
            'project_billing_address',
            'attachment_list',
            'event_list',
            'warranty_list',
            'project_contact_list'
        ];
        let promiseFunctionList = [];
        for (let project of projectResult) {
            promiseFunctionList.push(tagModel.getByProjectId(project.project_id));
            promiseFunctionList.push(employeeModel.getByProjectId(project.project_id));
            promiseFunctionList.push(addressModel.getById(project.project_address_id));
            promiseFunctionList.push(addressModel.getById(project.project_billing_address_id));
            promiseFunctionList.push(attachmentModel.getByRefId(project.project_id, "project"));
            promiseFunctionList.push(eventModel.getByProjectId(project.project_id));
            promiseFunctionList.push(warrantyModel.getByProjectId(project.project_id));
            promiseFunctionList.push(projectContactModel.getContactMemberByProjectId(project.project_id));
        }
        let resultList = await Promise.all(promiseFunctionList);
        for (let i = 0; i < projectResult.length; i++) {
            projectResult[i]['project_status'] = transformProjectStatus(projectResult[i]['project_status']);
            for (let keyItem of key) {
                projectResult[i][keyItem] = resultList[i * key.length + key.indexOf(keyItem)];
            }
        }

        res.send({
            status: "success",
            data: projectResult,
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getAllOptions = async (req, res) => {
    try {

        let sql_condition = "1";
        if (req.query)
            sql_condition = sql_condition +
                (req.query.contact_document_id ? ` AND project_document_id in 
                    (SELECT DISTINCT(project.project_document_id)
                    FROM project LEFT JOIN project_contact ON project_contact.project_document_id = project.project_document_id
                    WHERE project_contact.contact_document_id = '${req.query.contact_document_id}')` : "") +
                (req.query.team_document_id ? ` AND project._project_createdby in 
                    ( select employee.employee_document_id from employee 
                    right join employee_team on employee_team.employee_document_id = employee.employee_document_id 
                    where team_document_id = '${req.query.team_document_id}' )` : "") +
                (req.query.project_status === 'ongoing' ? ` and project_status not like 'delete' and project_status not like 'finished'` : "");
        const projectResult = await projectModel.getAllOptions(sql_condition);

        let queryParams = req.query;
        let selectedParams = Object.keys(queryParams).filter((key) => queryParams[key] === '1');
        let promiseFunctionList = [];
        for (let project of projectResult) {
            for (let param of selectedParams) {
                switch (param) {
                    case "tag_list":
                        promiseFunctionList.push(tagModel.getByProjectId(project.project_id));
                        break;
                    case "project_employee_list":
                        promiseFunctionList.push(employeeModel.getByProjectId(project.project_id));
                        break;
                    case "project_address":
                        promiseFunctionList.push(addressModel.getById(project.project_address_id));
                        break;
                    case "project_billing_address":
                        promiseFunctionList.push(addressModel.getById(project.project_billing_address_id));
                        break;
                    case "attachment_list":
                        promiseFunctionList.push(attachmentModel.getByRefId(project.project_id, "project"));
                        break;
                    case "event_list":
                        promiseFunctionList.push(eventModel.getByProjectId(project.project_id));
                        break;
                    case "warranty_list":
                        promiseFunctionList.push(warrantyModel.getByProjectId(project.project_id));
                        break;
                    case "project_contact_list":
                        promiseFunctionList.push(projectContactModel.getContactMemberByProjectId(project.project_id));
                        break;
                }
            }
        }
        let resultList = await Promise.all(promiseFunctionList);
        for (let i = 0; i < projectResult.length; i++) {
            for (let param of selectedParams) {
                projectResult[i][param] = resultList[i * selectedParams.length + selectedParams.indexOf(param)];
            }
        }
        res.send({
            status: "success",
            data: projectResult,
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const project = await projectModel.getById(req.params.id);
        if (project && project.project_id) {
            let key = [
                "tag_list",
                "project_employee_list",
                "project_address",
                "project_billing_address",
                "attachment_list",
                "event_list",
                "warranty_list",
                "project_contact_list",
                "project_status_log_list"
            ];
            project.is_engineering = false;
            project.is_logistic = false;
            project.is_payment = false;
            let promiseFunctionList = [
                tagModel.getByProjectId(project.project_id),
                employeeModel.getByProjectId(project.project_id),
                addressModel.getById(project.project_address_id),
                addressModel.getById(project.project_billing_address_id),
                attachmentModel.getByRefId(project.project_id, "project"),
                eventModel.getByProjectId(project.project_id),
                warrantyModel.getByProjectId(project.project_id),
                projectContactModel.getContactMemberByProjectId(req.params.id),
                projectStatusLogModel.getByProjectId(project.project_id)
            ];
            let resultList = await Promise.all(promiseFunctionList);
            for (let i = 0; i < key.length; i++) {
                project[key[i]] = resultList[i];
            }
            let warrantyPromiseList = [];
            for (let warranty of project.warranty_list) {
                warrantyPromiseList.push(attachmentModel.getByRefId(warranty.warranty_id, "warranty"));
            }

            let contactChannelPromiseList = [];
            let personChannelPromiseList = [];
            for (let project_contact of project.project_contact_list) {
                contactChannelPromiseList.push(contactChannelModel.getByRefId(project_contact.contact_id, "contact"));
                personChannelPromiseList.push(contactChannelModel.getByRefId(project_contact.person_id, "person"));
            }

            let warrantyResultList = await Promise.all(warrantyPromiseList);
            for (let i = 0; i < project.warranty_list.length; i++) {
                project.warranty_list[i].attachment_list = warrantyResultList[i];
            }
            let contactChannelResultList = await Promise.all(contactChannelPromiseList);
            let personChannelResultList = await Promise.all(personChannelPromiseList);
            for (let i = 0; i < project.project_contact_list.length; i++) {
                project.project_contact_list[i].contact_channel_list = contactChannelResultList[i];
                project.project_contact_list[i].person_channel_list = personChannelResultList[i];
            }
            project.project_document_list = [];
        }
        res.send({
            status: "success",
            data: project,
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        //create address [project_address]
        req.body.project_address.address_ref_type = "project";
        req.body.project_address.address_type = "registration";
        req.body.project_address.address_name = "สถานที่ตั้งโครงการ";
        const resultProjectAddress = await addressModel.create(
            req.body.project_address
        );
        req.body.project_address_id = resultProjectAddress.insertId;

        //create address [billing_address]
        req.body.project_billing_address.address_ref_type = "project";
        req.body.project_billing_address.address_type = "billing";
        req.body.project_billing_address.address_name = "ที่อยู่เรียกเก็บบิล";
        const resultProjectBillingAddress = await addressModel.create(
            req.body.project_billing_address
        );
        req.body.project_billing_address_id = resultProjectBillingAddress.insertId;

        //create Project
        const genDocumentIdResult = await genDocumentId("PJ", "project");
        const newData = new projectModel(req.body);
        newData.project_document_id = genDocumentIdResult.document_id;
        const result = await projectModel.create(newData, req.user);

        const projectId = result.insertId;

        //update project_id to project_address
        await addressModel.updateRefId(resultProjectAddress.insertId, { ref_id: projectId });
        //update project_id to project_billing_address
        await addressModel.updateRefId(resultProjectBillingAddress.insertId, { ref_id: projectId });

        //create warranty
        if (req.body.warranty && req.body.warranty !== null && req.body.warranty_list.length !== 0) {
            let warranty_list = req.body.warranty_list;

            for (let warranty of warranty_list) {
                warranty.project_id = result.insertId;
                const newWarrantyData = new warrantyModel(warranty);
                const warrantyResult = await warrantyModel.create(newWarrantyData);

                //create attachment in warranty
                if (warranty.warranty_attachment_list.length !== 0) {
                    let warranty_attachment_list = warranty.warranty_attachment_list;

                    for (let attachment of warranty_attachment_list) {
                        attachment.attachment_type = "warranty";
                        attachment.ref_id = warrantyResult.insertId;
                        const newAttachmentData = new attachmentModel(attachment);
                        await attachmentModel.create(newAttachmentData,
                            req.user
                        );
                    }
                }
            }
        }

        //create project_contact
        if (req.body.project_contact_list.length !== 0) {
            let project_contact_list = req.body.project_contact_list;

            for (let project_contact of project_contact_list) {
                project_contact.project_id = projectId;
                const newProjectContactData = new projectContactModel(project_contact);
                await projectContactModel.create(newProjectContactData);
            }
        }

        //create project_employee
        if (req.body.project_employee_list.length !== 0) {
            let project_employee_list = req.body.project_employee_list;

            for (let project_employee of project_employee_list) {
                project_employee.project_id = projectId;

                const newProjectEmployeeModel = new projectEmployeeModel(project_employee);
                //create project_employee
                await projectEmployeeModel.create(newProjectEmployeeModel);
            }
        }

        //create attachment
        if (req.body.attachment_list.length !== 0) {
            let attachment_list = req.body.attachment_list;

            for (let attachment of attachment_list) {
                attachment.ref_id = projectId;
                attachment.attachment_type = "project";
                const newData = new attachmentModel(attachment);
                await attachmentModel.create(newData, req.user);
            }
        }

        //create Tag and projectTag
        if (req.body.tag_list.length !== 0) {
            let tag_list = req.body.tag_list;
            let tag_list_prep = [];

            for (let tag of tag_list) {
                //check tag name in tag table
                let tagResult = await tagModel.getByTagName(tag.tag_name);

                //if tag_name is undefined will create new Tag
                if (tagResult === undefined) {
                    //create new Tag
                    const newTagResult = await tagModel.create(tag);

                    let tag_prep = {
                        tag_id: newTagResult.insertId,
                        tag_name: tag.tag_name,
                    };
                    tag_list_prep.push(tag_prep);
                } else {
                    tag_list_prep.push(tagResult);
                }
            }

            //create projectTag
            for (let tag of tag_list_prep) {
                tag.project_id = projectId;
                const newProjectTagData = new projectTagModel(tag);
                await projectTagModel.create(newProjectTagData);
            }
        }

        //prepare data project_stage_log_data
        const projectStatusLogData = {
            project_id: projectId,
            new_status: req.body.project_status,
            project_status_log_remark: null,
        };
        //create project_stage_log
        const projectStatusResult = await projectStatusLogModel.create(projectStatusLogData, req.user);

        //query project_status_log from database
        const project_status_log_db = await projectStatusLogModel.getById(projectStatusResult.insertId);

        //prepare project_activity data type status_change
        let project_activity_prep = {
            owner_id: genDocumentIdResult.document_id,
            owner_type: "PROJECT",
            project_id: projectId,
            activity_type: "status_change",
            activity_item: {
                project_status_log: project_status_log_db,
                change_type: "เพิ่ม",
                old_status: project_status_log_db.old_status,
                new_status: project_status_log_db.new_status,
                description: `เพิ่มโปรเจคใหม่`
            }
        };
        project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_item);
        //create projectActivity type status_change
        const newProjectActivityData = new projectActivityModel(project_activity_prep);
        await projectActivityModel.create(newProjectActivityData, req.user);

        const newActivityData = new activityModel(project_activity_prep);
        await activityModel.create(newActivityData, req.user);

        res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.update = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    const mysql = await db.getConnection();
    await mysql.beginTransaction();

    const newData = new projectModel(req.body);
    try {
        const oldProjectData = await projectModel.getById(req.params.id);

        if (oldProjectData.project_status !== req.body.project_status) {
            //prepare project_status_log data
            let projectStatusLogData = {
                project_id: req.params.id,
                project_document_id: oldProjectData.project_document_id,
                old_status: oldProjectData.project_status,
                new_status: req.body.project_status,
                project_status_log_remark: null
            };
            //create project_status_log
            const projectStatusLogResult = await projectStatusLogModel.create(projectStatusLogData, req.user);

            //query project_status_log from database
            const project_status_log_db = await projectStatusLogModel.getById(projectStatusLogResult.insertId);

            //prepare project_activity data type status_change
            let project_activity_prep = {
                owner_id: req.body.project_document_id,
                owner_type: "PROJECT",
                project_id: req.params.id,
                activity_type: "status_change",
                activity_item: {
                    project_status_log: project_status_log_db,
                    change_type: "เปลี่ยนแปลง",
                    old_status: project_status_log_db.old_status,
                    new_status: project_status_log_db.new_status,
                    description: `เปลี่ยนแปลงสถานะจาก ${await transformProjectStatus(project_status_log_db.old_status)} เป็น ${await transformProjectStatus(project_status_log_db.new_status)}`
                }
            };
            project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_item);
            //create projectActivity type status_change
            const newProjectActivityData = new projectActivityModel(project_activity_prep);
            await projectActivityModel.create(newProjectActivityData, req.user);

            const newActivityData = new activityModel(project_activity_prep);
            await activityModel.create(newActivityData, req.user);
        }

        newData.project_address_id = req.body.project_address.address_id;
        newData.project_billing_address_id = req.body.project_billing_address.address_id;
        const result = await projectModel.update(
            req.params.id,
            newData,
            req.user
        );

        //update address [project address]
        await addressModel.update(
            req.body.project_address.address_id,
            req.body.project_address
        );

        //update address [project billing address]
        await addressModel.update(
            req.body.project_billing_address.address_id,
            req.body.project_billing_address
        );

        //query warranty in project from db
        const warranty_list_db = await warrantyModel.getByProjectId(req.params.id);
        let delete_warranty_list = [];


        //loop get delete_warranty_list
        for (let warranty_db of warranty_list_db ? warranty_list_db : []) {
            let has_warranty = false;
            for (let warranty_req of req.body.warranty_list ? req.body.warranty_list : []) {
                if (warranty_db.warranty_id === warranty_req.warranty_id) {
                    has_warranty = true;
                    break;
                }
            }
            if (!has_warranty) {
                delete_warranty_list.push(warranty_db);
            }
        }


        //delete person don't have in req.body.person_list
        for (let warranty of delete_warranty_list ? delete_warranty_list : []) {
            await warrantyModel.delete(warranty.warranty_id);
        }

        //update and create new warranty
        for (let warranty of req.body.warranty_list ? req.body.warranty_list : []) {
            if (warranty.warranty_id === undefined) {
                warranty.project_id = req.params.id;

                const newWarrantyData = new warrantyModel(warranty);
                const resultWarranty = await warrantyModel.create(newWarrantyData);

                for (let attachment of warranty.warranty_attachment_list ? warranty.warranty_attachment_list : []) {
                    attachment.attachment_type = "warranty";
                    attachment.ref_id = resultWarranty.insertId;

                    const newAttachmentData = new attachmentModel(attachment);
                    await attachmentModel.create(newAttachmentData,
                        req.user
                    );
                }
            } else {
                //if have warranty_id will update warranty data

                //if warranty status is "approved" will save warranty_approver_name
                if (warranty.warranty_status === "approved") {
                    let employeeResult = await employeeModel.getById(req.user.employee_id);
                    let warranty_approver_name =
                        "" + req.user.employee_firstname + " " + req.user.employee_lastname;
                    warranty.warranty_approver_name = warranty_approver_name;
                    warranty.warranty_approver_document_id = employeeResult.employee_document_id;
                    warranty.warranty_approved_date = moment().unix();

                }
                const newWarrantyData = new warrantyModel(warranty);
                await warrantyModel.update(warranty.warranty_id, newWarrantyData);

                //query attachment in warranty from db
                const attachment_list_db = await attachmentModel.getByRefId(warranty.warranty_id,
                    "warranty"
                );

                let delete_attachment_list = [];
                //loop get delete_attachment_list
                for (let attachment_db of attachment_list_db ? attachment_list_db : []) {
                    let has_attachment = false;
                    for (let attachment_req of warranty.warranty_attachment_list ? warranty.warranty_attachment_list : []) {
                        if (attachment_db.attachment_id === attachment_req.attachment_id) {
                            has_attachment = true;
                            break;
                        }
                    }
                    if (!has_attachment) {
                        delete_attachment_list.push(attachment_db);
                    }
                }

                //delete attachment don't have in req.body.attachment_list
                for (let attachment of delete_attachment_list ? delete_attachment_list : []) {
                    await attachmentModel.delete(attachment.attachment_id);
                }

                //create new attachment in warranty
                for (let attachment of warranty.warranty_attachment_list ? warranty.warranty_attachment_list : []) {
                    if (attachment.attachment_id === undefined) {
                        attachment.attachment_type = "warranty";
                        attachment.ref_id = warranty.warranty_id;

                        const newAttachmentData = new attachmentModel(attachment);
                        await attachmentModel.create(newAttachmentData,
                            req.user
                        );
                    }
                }
            }
        }

        //query project_contact in project from db
        const project_contact_list_db = await projectContactModel.getByProjectId(
            req.params.id
        );
        let delete_project_contact_list = [];

        //loop get delete_project_contact_list
        for (let project_contact_db of project_contact_list_db ? project_contact_list_db : []) {
            let has_project_contact = false;
            for (let project_contact_req of req.body.project_contact_list ? req.body.project_contact_list : []) {
                if (project_contact_db.project_contact_id ===
                    project_contact_req.project_contact_id
                ) {
                    has_project_contact = true;
                    break;
                }
            }
            if (!has_project_contact) {
                delete_project_contact_list.push(project_contact_db);
            }
        }

        //delete project_contact don't have in req.body.project_contact_list
        for (let project_contact of delete_project_contact_list ? delete_project_contact_list : []) {
            await projectContactModel.delete(project_contact.project_contact_id);
        }

        //create new project_contact in project
        for (let project_contact of req.body.project_contact_list ? req.body.project_contact_list : []) {
            if (project_contact.project_contact_id === undefined) {
                project_contact.project_id = req.params.id;

                const newProjectContactData = new projectContactModel(project_contact);
                await projectContactModel.create(newProjectContactData);
            } else {
                //if have project_contact_id will update data in project_contact
                const newProjectContactData = new projectContactModel(project_contact);
                await projectContactModel.update(project_contact.project_contact_id,
                    newProjectContactData
                );
            }
        }

        //query project_employee in project from db
        const project_employee_list_db = await projectEmployeeModel.getByProjectId(
            req.params.id
        );
        let delete_project_employee_list = [];

        //loop get delete_project_employee
        for (let project_employee_db of project_employee_list_db ? project_employee_list_db : []) {
            let has_project_employee = false;
            for (let project_employee_req of req.body.project_employee_list ? req.body.project_employee_list : []) {
                if (project_employee_db.project_employee_id ===
                    project_employee_req.project_employee_id
                ) {
                    has_project_employee = true;
                    break;
                }
            }
            if (!has_project_employee) {
                delete_project_employee_list.push(project_employee_db);
            }
        }

        //delete project_employee don't have in req.body.project_employee_list
        for (let project_employee of delete_project_employee_list ? delete_project_employee_list : []) {

            //delete project_employee
            await projectEmployeeModel.delete(project_employee.project_employee_id);

            //query employee data from database
            const employee_data_db = await employeeModel.getById(project_employee.employee_id);

            //prepare project_activity data type contact_change
            let project_activity_prep = {
                owner_id: req.body.project_document_id,
                owner_type: "PROJECT",
                project_id: req.params.id,
                activity_type: "contact_change",
                activity_item: {
                    change_type: "ลบ",
                    employee: employee_data_db,
                    description: `ลบ ${employee_data_db.employee_firstname} ${employee_data_db.employee_lastname} จากผู้รับผิดชอบ`
                }
            };

            project_activity_prep.activity_item.employee.role = project_employee.role;
            project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_item);
            //create projectActivity type contact_change
            const newProjectActivityData = new projectActivityModel(project_activity_prep);
            await projectActivityModel.create(newProjectActivityData, req.user);

            const newActivityData = new activityModel(project_activity_prep);
            await activityModel.create(newActivityData, req.user);
        }

        //create new project_employee in project
        for (let project_employee of req.body.project_employee_list ? req.body.project_employee_list : []) {
            if (project_employee.project_employee_id === undefined) {
                project_employee.project_id = req.params.id;

                const newProjectEmployeeData = new projectEmployeeModel(project_employee
                );
                await projectEmployeeModel.create(newProjectEmployeeData);

                //query employee data from database
                const employee_data_db = await employeeModel.getById(project_employee.employee_id);

                //prepare project_activity data type contact_change
                let project_activity_prep = {
                    owner_id: req.body.project_document_id,
                    owner_type: "PROJECT",
                    project_id: req.params.id,
                    activity_type: "contact_change",
                    activity_item: {
                        change_type: "เพิ่ม",
                        employee: employee_data_db,
                        description: `เพิ่ม ${employee_data_db.employee_firstname} ${employee_data_db.employee_lastname} ในผู้รับผิดชอบ`
                    }
                };

                project_activity_prep.activity_item.employee.role = project_employee.role;
                project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_item);
                //create projectActivity type contact_change
                const newProjectActivityData = new projectActivityModel(project_activity_prep);
                await projectActivityModel.create(newProjectActivityData, req.user);

                const newActivityData = new activityModel(project_activity_prep);
                await activityModel.create(newActivityData, req.user);
            } else {
                //query old project_employee_data from database
                const oldProjectEmployeeData = await projectEmployeeModel.getById(project_employee.project_employee_id);

                //if have project_employee_id will update data in project_employee
                const newProjectEmployeeData = new projectEmployeeModel(project_employee
                );
                await projectEmployeeModel.update(project_employee.project_employee_id,
                    newProjectEmployeeData
                );

                if (oldProjectEmployeeData.employee_id !== project_employee.employee_id) {
                    //query employee data from database
                    const old_employee_data = await employeeModel.getById(oldProjectEmployeeData.employee_id);
                    const new_employee_data = await employeeModel.getById(project_employee.employee_id);

                    let project_activity_prep = {
                        owner_id: req.body.project_document_id,
                        owner_type: "PROJECT",
                        project_id: req.params.id,
                        activity_type: "contact_change",
                        activity_item: {
                            change_type: "เปลี่ยนแปลง",
                            employee: new_employee_data,
                            description: `เปลี่ยน ${oldProjectEmployeeData.role} จาก ${old_employee_data.employee_firstname} ${old_employee_data.employee_lastname} เป็น ${new_employee_data.employee_firstname} ${new_employee_data.employee_lastname} `
                        }
                    };

                    // project_activity_prep.activity_item.employee.role = oldProjectEmploeeData.role;
                    project_activity_prep.activity_data = JSON.stringify(project_activity_prep.activity_item);
                    //create projectActivity type contact_change
                    const newProjectActivityData = new projectActivityModel(project_activity_prep);
                    await projectActivityModel.create(newProjectActivityData, req.user);

                    const newActivityData = new activityModel(project_activity_prep);
                    await activityModel.create(newActivityData, req.user);
                }
            }
        }

        //query attachment in project from db
        const attachment_list_db = await attachmentModel.getByRefId(
            req.params.id,
            "project"
        );
        let delete_attachment_list = [];

        //loop get delete_attachment_list
        for (let attachment_db of attachment_list_db ? attachment_list_db : []) {
            let has_attachment = false;
            for (let attachment_req of req.body.attachment_list ? req.body.attachment_list : []) {
                if (attachment_db.attachment_id === attachment_req.attachment_id) {
                    has_attachment = true;
                    break;
                }
            }
            if (!has_attachment) {
                delete_attachment_list.push(attachment_db);
            }
        }

        //delete attachment don't have in req.body.attachment_list
        for (let attachment of delete_attachment_list ? delete_attachment_list : []) {
            await attachmentModel.delete(attachment.attachment_id);
        }

        //create new attachment in contact
        for (let attachment of req.body.attachment_list ? req.body.attachment_list : []) {
            if (attachment.attachment_id === undefined) {
                attachment.attachment_type = "project";
                attachment.ref_id = req.params.id;

                const newAttachmentData = new attachmentModel(attachment);
                await attachmentModel.create(newAttachmentData, req.user);
            }
        }

        //delete all tag of project
        await projectTagModel.deleteByProjectId(req.params.id);

        if (req.body.tag_list.length !== 0) {
            let tag_list = req.body.tag_list;
            let tag_list_prep = [];

            for (let tag of tag_list ? tag_list : []) {
                //check tag name in tag table
                let tagResult = await tagModel.getByTagName(tag.tag_name);

                //if tag_name is undefined will create new Tag
                if (tagResult === undefined) {
                    //create new Tag
                    const newTagResult = await tagModel.create(tag);

                    let tag_prep = {
                        tag_id: newTagResult.insertId,
                        tag_name: tag.tag_name,
                    };
                    tag_list_prep.push(tag_prep);
                } else {
                    tag_list_prep.push(tagResult);
                }
            }

            //create projectTag
            for (let tag of tag_list_prep ? tag_list_prep : []) {
                tag.project_id = req.params.id;

                const newProjectTagData = new projectTagModel(tag);
                await projectTagModel.create(newProjectTagData);
            }
        }

        await mysql.commit();
        await mysql.release();
        res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        console.log("Rollback successful");
        console.dir(error, { depth: null });
        await mysql.rollback(function (error) {
            res.status(400).send({
                status: "error",
                message: `${error}`,
            });
        });

        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await projectModel.delete(req.params.id, req.user);
        res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
