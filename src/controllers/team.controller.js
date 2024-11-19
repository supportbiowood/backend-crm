const teamModel = require("../models/team.mode");
const employeeTeamModel = require("../models/employeeTeam.model");
const generator = require("../utils/generate");
exports.getAll = async (req, res) => {
    try {
        let teamResult = await teamModel.getAll();
        let employeePromiseList = [];
        teamResult.forEach(team => employeePromiseList.push(employeeTeamModel.getByTeamDocumentId(team.team_document_id)));
        const employeeTeamResult = await Promise.all(employeePromiseList);
        teamResult.forEach((team, index) => {
            employeeTeamResult[index].forEach(employee => delete employee['employee_password']);
            team.employee_list = employeeTeamResult[index];
        });
        return res.send({ status: "success", data: teamResult });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.getByTeamId = async (req, res) => {
    try {
        const employeeTeamResult = await employeeTeamModel.getByTeamId(req.params.team_id);
        return res.send({ status: "success", data: employeeTeamResult });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.getByTeamDocumentId = async (req, res) => {
    try {
        const teamResult = await teamModel.getByTeamDocumentId(req.params.team_document_id);
        teamResult.employee_list = await employeeTeamModel.getByTeamDocumentId(req.params.team_document_id);
        return res.send({ status: "success", data: teamResult });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.updateTeamByDocumentId = async (req, res) => {
    try {
        const newTeamData = new teamModel(req.body);
        const teamUpdateResult = await teamModel.updateByTeamDocumentId(req.params.team_document_id, newTeamData);
        const employeeTeamUpdateResult = await employeeTeamModel.updateEmployeeToTeam(
            req.params.team_document_id,
            (req.body.employee_list && req.body.employee_list.length > 0) ?
                req.body.employee_list : []);

        return res.send({
            status: "success",
            data: {
                team_result: teamUpdateResult,
                Gemployee_team_result: employeeTeamUpdateResult
            }
        });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.create = async (req, res) => {
    try {
        const newTeamData = new teamModel(req.body);
        newTeamData.team_document_id = (await generator.genDocumentId("TM", "team")).document_id;
        const teamResult = await teamModel.create(newTeamData);
        let employeeTeamResult;
        if (req.body.employee_list && req.body.employee_list.length > 0) {
            employeeTeamResult = await employeeTeamModel.updateEmployeeToTeam(newTeamData.team_document_id, req.body.employee_list);
        }
        teamResult.document_id = newTeamData.team_document_id;

        return res.send({ status: "success", data: { team_result: teamResult, employee_team_result: employeeTeamResult || null } });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.deleteTeamById = async (req, res) => {
    try {
        const employeeTeamResult = await employeeTeamModel.deleteByTeamId(req.params.team_id);
        const teamResult = await teamModel.deleteById(req.params.team_id);
        return res.send({ status: "success", data: { team_result: teamResult, employee_team_result: employeeTeamResult } });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.deleteTeamByDocumentId = async (req, res) => {
    try {
        const employeeTeamResult = await employeeTeamModel.deleteByTeamDocumentId(req.params.team_document_id);
        const teamResult = await teamModel.deleteByTeamDocumentId(req.params.team_document_id);
        return res.send({ status: "success", data: { team_result: teamResult, employee_team_result: employeeTeamResult } });
    } catch (error) {
        res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
