const contactModel = require("../models/contact.model");
const tagModel = require("../models/tag.model");
const personModel = require("../models/person.model");
const addressModel = require("../models/address.model");
const contactChannelModel = require("../models/contactChannel.model");
const accountModel = require("../models/account.model");
const bankAccountModel = require("../models/bankAccount.model");
const attachmentModel = require("../models/attachment.model");
const eventModel = require("../models/event.model");
const contactTagModel = require("../models/contactTag.model");
const projectContactModel = require("../models/projectContact.model");
const employeeModel = require("../models/employee.model");
const { filterQuery, formatFulltextSearch, formatQuery } = require("../utils/sqlmapper");
const { genDocumentId } = require("../utils/generate");

const contactKeys = [
    "tag_name",
    "contact_id",
    "contact_document_id",
    "contact_is_customer",
    "contact_is_vendor",
    "contact_business_category",
    "contact_commercial_type",
    "contact_commercial_name",
    "contact_individual_prefix_name",
    "contact_individual_first_name",
    "contact_individual_last_name",
    "contact_merchant_name",
    "contact_tax_no",
    "contact_registration_address_id",
    "lead_source_name",
    // "contact_img_url",
    // "account_receivable_id",
    // "account_payable_id",
    // "contact_payment_type",
    // "contact_is_credit_limit",
    // "contact_credit_limit_amount",
    "contact_status",
    // "_contact_created",
    // "_contact_createdby",
    // "_contact_createdby_employee",
    // "_contact_lastupdate",
    // "_contact_lastupdateby",
    // "_contact_lastupdateby_employee",
    "ref_id",
    "contact_channel_list",
    "project_count",
    "contact_name",
    "contact_type",
];

exports.getAll = async (req, res) => {
    try {
        let contactResult = (await contactModel.getAll()) || [];

        if (req.query.type === "vendor") {
            contactResult = await contactResult.filter(
                (contact) => contact.contact_is_vendor === 1
            );
        }

        let key = [
            "tag_list",
            "person_list",
            "contact_registration_address",
            "contact_address_list",
            "contact_channel_list",
            "account_receivable",
            "account_payable",
            "bank_account_list",
            "attachment_list",
            "event_list",
            "project_list",
        ];
        let promiseFunctionList = [];

        for (let contact of contactResult) {
            promiseFunctionList.push(tagModel.getByContactId(contact.contact_id));
            promiseFunctionList.push(personModel.getByContactId(contact.contact_id));
            promiseFunctionList.push(addressModel.getById(contact.contact_registration_address_id));
            promiseFunctionList.push(
                addressModel.getByRefIdAndRefTypeAndContactType(
                    contact.contact_id,
                    "contact",
                    "other"
                )
            );
            promiseFunctionList.push(contactChannelModel.getByRefId(contact.contact_id, "contact"));
            promiseFunctionList.push(accountModel.getById(contact.account_receivable_id));
            promiseFunctionList.push(accountModel.getById(contact.account_payable_id));
            promiseFunctionList.push(bankAccountModel.getByContactId(contact.contact_id));
            promiseFunctionList.push(attachmentModel.getByRefId(contact.contact_id, "contact"));
            promiseFunctionList.push(eventModel.getByContactId(contact.contact_id));
            promiseFunctionList.push(projectContactModel.getProjectByContactId(contact.contact_id));
        }
        let resultList = await Promise.all(promiseFunctionList);

        for (let i = 0; i < contactResult.length; i++) {
            contactResult[i].tag_list = resultList[i * key.length];
            contactResult[i].person_list = resultList[i * key.length + 1];
            contactResult[i].contact_registration_address = resultList[i * key.length + 2];
            contactResult[i].contact_address_list = resultList[i * key.length + 3];
            contactResult[i].contact_channel_list = resultList[i * key.length + 4];
            contactResult[i].account_receivable = resultList[i * key.length + 5];
            contactResult[i].account_payable = resultList[i * key.length + 6];
            contactResult[i].bank_account_list = resultList[i * key.length + 7];
            contactResult[i].attachment_list = resultList[i * key.length + 8];
            contactResult[i].event_list = resultList[i * key.length + 9];
            contactResult[i].project_list = resultList[i * key.length + 10];
            contactResult[i].project_count = resultList[i * key.length + 10].length;
        }

        res.send({
            status: "success",
            data: contactResult,
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
        let keys = [
            "contact_registration_address",
            "tag_list",
            "person_list",
            "contact_address_list",
            "contact_channel_list",
            "account_receivable",
            "account_payable",
            "bank_account_list",
            "attachment_list",
            "event_list",
            "project_list",
        ];
        let queryParams = req.query;
        let page = 0;
        let pageSize = 10;
        if (parseInt(queryParams.page) !== isNaN && parseInt(queryParams.page_size) !== isNaN) {
            page = Math.abs(parseInt(queryParams.page));
            pageSize = Math.abs(parseInt(queryParams.page_size));
            delete queryParams.page;
            delete queryParams.page_size;
        }
        let contactResult = (await contactModel.getAllAvailable(page, pageSize)) || [];
        if (req.query.type === "vendor") {
            contactResult = await contactResult.filter(
                (contact) => contact.contact_is_vendor === 1
            );
        }
        let selectedParams = keys.filter((key) => {
            const parsedKey = parseInt(queryParams[key]);
            if (parsedKey) {
                return key;
            }
        });
        let promiseFunctionList = [];
        for (let contact of contactResult) {
            for (let key of keys) {
                if (selectedParams.includes(key)) {
                    switch (key) {
                        case "contact_registration_address":
                            promiseFunctionList.push(
                                addressModel.getById(contact.contact_registration_address_id)
                            );
                            break;
                        case "tag_list":
                            promiseFunctionList.push(tagModel.getByContactId(contact.contact_id));
                            break;
                        case "person_list":
                            promiseFunctionList.push(
                                personModel.getByContactId(contact.contact_id)
                            );
                            break;
                        case "contact_address_list":
                            promiseFunctionList.push(
                                addressModel.getByRefIdAndRefTypeAndContactType(
                                    contact.contact_id,
                                    "contact",
                                    "other"
                                )
                            );
                            break;
                        case "contact_channel_list":
                            promiseFunctionList.push(
                                contactChannelModel.getByRefId(contact.contact_id, "contact")
                            );
                            break;
                        case "account_receivable":
                            promiseFunctionList.push(
                                accountModel.getById(contact.account_receivable_id)
                            );
                            break;
                        case "account_payable":
                            promiseFunctionList.push(
                                accountModel.getById(contact.account_payable_id)
                            );
                            break;
                        case "bank_account_list":
                            promiseFunctionList.push(
                                bankAccountModel.getByContactId(contact.contact_id)
                            );
                            break;
                        case "attachment_list":
                            promiseFunctionList.push(
                                attachmentModel.getByRefId(contact.contact_id, "contact")
                            );
                            break;
                        case "event_list":
                            promiseFunctionList.push(eventModel.getByContactId(contact.contact_id));
                            break;
                        case "project_list":
                            promiseFunctionList.push(
                                projectContactModel.getProjectByContactId(contact.contact_id)
                            );
                            break;
                    }
                }
            }
        }
        let resultList = await Promise.all(promiseFunctionList);
        for (let i = 0; i < contactResult.length; i++) {
            for (let paramIndex = 0; paramIndex < selectedParams.length; paramIndex++) {
                contactResult[i][selectedParams[paramIndex]] =
                    resultList[i * selectedParams.length + paramIndex];
                if (selectedParams[paramIndex] === "project_list") {
                    contactResult[i]["project_count"] =
                        resultList[i * selectedParams.length + paramIndex].length;
                }
            }
        }

        res.send({
            status: "success",
            data: contactResult,
        });
    } catch (error) {
        console.trace(error);
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getTotalRow = async (req, res) => {
    try {
        let contactResult = await contactModel.getTotalRow();
        res.send({
            status: "success",
            data: contactResult,
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.fullFilter = async (req, res) => {
    try {
        console.log("API fullFilter called");
        console.log("Request Body:", req.body);
        const filteredResult = await contactModel.fullFilter(formatQuery("where 1 ", req.body.filterModel, req.body.sortModel, req.body.pageModel, contactKeys, req.body.search));
        res.send({
            status: "success",
            data: filteredResult,
        });
    } catch (error) {
        console.error("Error")
        // console.log(`error filter`);
        // console.dir(error);
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.fullFilterTotalRow = async (req, res) => {
    try {
        let sql =
            filterQuery(" where 1 ", req.body.filterModel) +  ' AND ' +
            formatFulltextSearch(contactKeys, req.body.search);
        const filteredResult = await contactModel.fullFilterTotalRow(sql);
        res.send({
            status: "success",
            data: filteredResult,
        });
    } catch (error) {
        console.log(`error filter table`);
        console.dir(error);
        res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.getById = async (req, res) => {
    try {
        let contact = await contactModel.getById(req.params.id);
        contact.tag_list = await tagModel.getByContactId(contact.contact_id);
        contact.person_list = await personModel.getByContactId(contact.contact_id);

        //add contact_channel of person to person data
        for (let person of contact.person_list) {
            person.person_contact_channel_list = await contactChannelModel.getByRefId(
                person.person_id,
                "person"
            );
        }

        contact.contact_registration_address = await addressModel.getById(
            contact.contact_registration_address_id
        );
        contact.contact_address_list = await addressModel.getByRefIdAndRefTypeAndContactType(
            req.params.id,
            "contact",
            "other"
        );
        contact.contact_channel_list = await contactChannelModel.getByRefId(
            contact.contact_id,
            "contact"
        );
        contact.account_receivable = await accountModel.getById(contact.account_receivable_id);
        contact.account_payable = await accountModel.getById(contact.account_payable_id);
        contact.bank_account_list = await bankAccountModel.getByContactId(contact.contact_id);
        contact.attachment_list = await attachmentModel.getByRefId(contact.contact_id, "contact");
        contact.event_list = await eventModel.getByContactId(contact.contact_id);
        contact.project_list = await projectContactModel.getProjectByContactId(contact.contact_id);

        res.send({
            status: "success",
            data: contact,
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
        //contact_address
        if (req.body.contact_registration_address !== null) {
            let contact_registration_address = req.body.contact_registration_address;
            contact_registration_address.address_ref_type = "contact";
            contact_registration_address.address_type = "registration";
            contact_registration_address.address_name = "ที่อยู่จดทะเบียน";
            const resultAddress = await addressModel.create(contact_registration_address);
            req.body.contact_registration_address_id = resultAddress.insertId;
        }

        //create contact
        const genDocumentIdResult = await genDocumentId("CT", "contact");
        const newData = new contactModel(req.body);
        newData.contact_document_id = genDocumentIdResult.document_id;
        const result = await contactModel.create(newData, req.user);

        const contactId = result.insertId;

        //update contact_id to contact_registration_address
        await addressModel.updateRefId(req.body.contact_registration_address_id, {
            ref_id: contactId,
        });

        //create address other type
        if (req.body.contact_address_list.length !== 0 || req.body.contact_address_list !== null) {
            let contact_address_list = req.body.contact_address_list;

            for (let contact_address of contact_address_list) {
                contact_address.address_ref_type = "contact";
                contact_address.address_type = "other";
                contact_address.ref_id = contactId;

                const resultAddress = await addressModel.create(contact_address);
            }
        }

        //create person and person_contact_channel in contact
        if (req.body.person_list.length !== 0) {
            let person_list = req.body.person_list;

            for (let person of person_list) {
                person.contact_id = contactId;
                const personData = new personModel(person);
                //create person data
                const personResult = await personModel.create(personData);

                //create contact_channel of person
                if (person.person_contact_channel_list.length !== 0) {
                    let person_contact_channel_list = person.person_contact_channel_list;

                    for (let contact_channel of person_contact_channel_list) {
                        contact_channel.contact_channel_type = "person";
                        contact_channel.ref_id = personResult.insertId;
                        await contactChannelModel.create(contact_channel);
                    }
                }
            }
        }

        //create channel contac
        if (req.body.contact_channel_list.length !== 0) {
            let contact_channel_list = req.body.contact_channel_list;

            for (let contact_channel of contact_channel_list) {
                contact_channel.ref_id = contactId;
                contact_channel.contact_channel_type = "contact";

                await contactChannelModel.create(contact_channel);
            }
        }

        //create bank_account
        if (req.body.bank_account_list.length !== 0) {
            let bank_account_list = req.body.bank_account_list;

            for (let bank_account of bank_account_list) {
                bank_account.contact_id = contactId;
                await bankAccountModel.create(bank_account);
            }
        }

        //create attachment
        if (req.body.attachment_list.length !== 0) {
            let attachment_list = req.body.attachment_list;

            for (let attachment of attachment_list) {
                let new_attachment = new attachmentModel(attachment);
                new_attachment.attachment_type = "contact";
                new_attachment.ref_id = contactId;
                await attachmentModel.create(new_attachment, req.user);
            }
        }

        //create Tag and contactTag
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

            //create contactTag
            for (let tag of tag_list_prep) {
                tag.contact_id = contactId;
                const newContactTagData = new contactTagModel(tag);
                await contactTagModel.create(newContactTagData);
            }
        }

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
    const newData = new contactModel(req.body);
    try {
        newData.contact_registration_address_id = req.body.contact_registration_address.address_id;

        const result = await contactModel.update(req.params.id, newData, req.user);

        //update contact_registration_address
        await addressModel.update(
            req.body.contact_registration_address.address_id,
            req.body.contact_registration_address
        );

        //query contact_address type other from database
        const contact_address_list_db = await addressModel.getByRefIdAndRefTypeAndContactType(
            req.params.id,
            "contact",
            "other"
        );
        let delete_contact_address_list = [];

        //loop get delete contact_address
        for (let contact_address_db of contact_address_list_db) {
            let has_address = false;
            for (let contact_address_req of req.body.contact_address_list) {
                if (contact_address_db.address_id === contact_address_req.address_id) {
                    has_address = true;
                    break;
                }
            }
            if (!has_address) {
                delete_contact_address_list.push(contact_address_db);
            }
        }

        //delete contact_address type other don't have in req.body.contact_address_type
        for (let contact_address of delete_contact_address_list) {
            await addressModel.delete(contact_address.address_id);
        }

        //update and create new contact_address
        for (let contact_address of req.body.contact_address_list) {
            if (contact_address.address_id === undefined) {
                contact_address.address_ref_type = "contact";
                contact_address.address_type = "other";
                contact_address.ref_id = req.params.id;
                const newContactAddressData = new addressModel(contact_address);
                await addressModel.create(newContactAddressData);
            } else {
                // if have bank_account_id will update data in bank_account
                const newContactAddressData = new addressModel(contact_address);
                await addressModel.update(contact_address.address_id, newContactAddressData);
            }
        }

        //delete all contact_channel_list in contact
        await contactChannelModel.deleteByContactChannelTypeAndRefId("contact", req.params.id);

        //create contact_channel again
        for (let contact_channel of req.body.contact_channel_list) {
            contact_channel.contact_channel_type = "contact";
            contact_channel.ref_id = req.params.id;

            const newContactChannelData = new contactChannelModel(contact_channel);
            await contactChannelModel.create(newContactChannelData);
        }

        //query person in contact
        const person_list_db = await personModel.getByContactId(req.params.id);
        let delete_person_list = [];

        //loop check
        for (let person_db of person_list_db) {
            let has_person = false;
            for (let person_req of req.body.person_list) {
                if (person_db.person_id === person_req.person_id) {
                    has_person = true;
                    break;
                }
            }
            if (!has_person) {
                delete_person_list.push(person_db);
            }
        }

        //delete person don't have in req.body.person_list
        for (let person of delete_person_list) {
            await personModel.delete(person.person_id);
        }

        //update and create new person
        for (let person of req.body.person_list) {
            //if person_id = undefined is new person
            if (person.person_id === undefined) {
                person.contact_id = req.params.id;
                const newPersonData = new personModel(person);
                const personResult = await personModel.create(newPersonData);

                //create contact channel of person
                if (person.person_contact_channel_list.length !== 0) {
                    let person_contact_channel_list = person.person_contact_channel_list;

                    for (let contact_channel of person_contact_channel_list) {
                        contact_channel.contact_channel_type = "person";
                        contact_channel.ref_id = personResult.insertId;

                        const newContactChannelData = new contactChannelModel(contact_channel);
                        await contactChannelModel.create(newContactChannelData);
                    }
                }
            } else {
                // if have person_id will update data in person
                const newPersonData = new personModel(person);
                await personModel.update(person.person_id, newPersonData);

                //delete all contact channel of person
                await contactChannelModel.deleteByContactChannelTypeAndRefId(
                    "person",
                    person.person_id
                );

                //create it again with new data
                if (person.person_contact_channel_list.length !== 0) {
                    let person_contact_channel_list = person.person_contact_channel_list;

                    for (let contact_channel of person_contact_channel_list) {
                        contact_channel.contact_channel_type = "person";
                        contact_channel.ref_id = person.person_id;

                        const newContactChannelData = new contactChannelModel(contact_channel);
                        await contactChannelModel.create(newContactChannelData);
                    }
                }
            }
        }

        //query bankAccount from db
        const bank_account_list_db = await bankAccountModel.getByContactId(req.params.id);
        let delete_bank_account_list = [];

        //loop get delete_bank_account_list
        for (let bank_account_db of bank_account_list_db) {
            let has_bank_account = false;
            for (let bank_account_req of req.body.bank_account_list) {
                if (bank_account_db.bank_account_id === bank_account_req.bank_account_id) {
                    has_bank_account = true;
                    break;
                }
            }
            if (!has_bank_account) {
                delete_bank_account_list.push(bank_account_db);
            }
        }

        //delete bank_account don't have in req.body.bank_account_list
        for (let bank_account of delete_bank_account_list) {
            await bankAccountModel.delete(bank_account.bank_account_id);
        }

        //update and create new bank_account
        for (let bank_account of req.body.bank_account_list) {
            if (bank_account.bank_account_id === undefined) {
                bank_account.contact_id = req.params.id;
                const newBankAccountData = new bankAccountModel(bank_account);
                await bankAccountModel.create(newBankAccountData);
            } else {
                // if have bank_account_id will update data in bank_account
                const newBankAccountData = new bankAccountModel(bank_account);
                await bankAccountModel.update(bank_account.bank_account_id, newBankAccountData);
            }
        }

        //query attachment in contact from db
        const attachment_list_db = await attachmentModel.getByRefId(req.params.id, "contact");
        let delete_attachment_list = [];

        //loop get delete_attachment_list
        for (let attachment_db of attachment_list_db) {
            let has_attachment = false;
            for (let attachment_req of req.body.attachment_list) {
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
        for (let attachment of delete_attachment_list) {
            await attachmentModel.delete(attachment.attachment_id);
        }

        //create new attachment in contact
        for (let attachment of req.body.attachment_list) {
            if (attachment.attachment_id === undefined) {
                attachment.attachment_type = "contact";
                attachment.ref_id = req.params.id;

                const newAttachmentData = new attachmentModel(attachment);
                await attachmentModel.create(newAttachmentData, req.user);
            }
        }

        //delete all tag of contact
        await contactTagModel.deleteByContactId(req.params.id);

        //create tag again
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

            //create contactTag
            for (let tag of tag_list_prep) {
                tag.contact_id = req.params.id;
                const newContactTagData = new contactTagModel(tag);
                await contactTagModel.create(newContactTagData);
            }
        }

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

exports.delete = async (req, res) => {
    try {
        const result = await contactModel.delete(req.params.id, req.user);
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
