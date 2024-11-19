const contactModel = require("../models/contact.model");
const contactChannelModel = require("../models/contactChannel.model");
const personModel = require("../models/person.model");

const contactCustomSelectAttribute = [
    "contact_is_customer",
    "contact_is_vendor",
    "contact_business_category",
    "contact_commercial_name",
    "contact_individual_first_name",
    "contact_individual_last_name",
    "contact_merchant_name"
];

exports.getAll = async (req, res) => {
    try {
        let personResult;
        if (req.query.contact_id) personResult = await personModel.getByContactId(req.query.contact_id) || [];
        else personResult = await personModel.getAll() || [];
        let promiseFunctionList = [];
        personResult.forEach((person) => {
            promiseFunctionList.push(contactModel.getCustomByCondition(contactCustomSelectAttribute, `contact_id = ${person.contact_id}`));
            promiseFunctionList.push(contactChannelModel.getByRefId(person.person_id, "person"));
        });

        let resultList = await Promise.all(promiseFunctionList);
        personResult.forEach((person, index) => {
            person.contact_info = resultList[index * 2];
            person.person_contact_channel_list = resultList[index * 2 + 1];
        });

        return res.send({
            status: "success",
            data: personResult,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error} `,
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const result = await personModel.getById(req.params.id);
        result.contact_info = await contactModel.getCustomByCondition(contactCustomSelectAttribute, `contact_id = ${result.contact_id}`);
        result.person_contact_channel_list = await contactChannelModel.getByRefId(req.params.id, "person");
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error} `,
        });
    }
};

exports.getByContactId = async (req, res) => {
    try {
        const personResult = await personModel.getByContactId(req.params.id) || [];
        let promiseFunctionList = [];
        personResult.forEach((person) => {
            promiseFunctionList.push(contactModel.getCustomByCondition(contactCustomSelectAttribute, `contact_id = ${person.contact_id}`));
            promiseFunctionList.push(contactChannelModel.getByRefId(person.person_id, "person"));
        });

        let resultList = await Promise.all(promiseFunctionList);
        personResult.forEach((person, index) => {
            person.contact_info = resultList[index * 2];
            person.person_contact_channel_list = resultList[index * 2 + 1];
        });

        delete personResult["employee_password"];
        return res.send({
            status: "success",
            data: personResult,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error} `,
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
    const newData = new personModel(req.body);
    try {
        const result = await personModel.create(newData);
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error} `,
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
        const result = await personModel.update(req.params.id, req.body);
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error} `,
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await personModel.delete(req.params.id);
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error} `,
        });
    }
};
