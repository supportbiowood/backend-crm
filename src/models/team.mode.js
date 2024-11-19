const db = require("../utils/database");

let Team = function (data) {
    this.team_name = data.team_name;
    this.team_description = data.team_description;
};

let model = "team";

Team.getAll = async () => {
    try {
        const teamResult = await db.query("select * from team");
        return teamResult[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

Team.getById = async (team_id) => {
    try {
        const teamResult = await db.query(`select * from team where team_id = ${team_id}`);
        return teamResult[0][0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

Team.getByTeamDocumentId = async (team_document_id) => {
    try {
        const teamResult = await db.query(`select * from team where team_document_id = '${team_document_id}'`);
        return teamResult[0][0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

Team.create = async (data) => {
    try {
        const createResult = await db.query("insert into team set ? ", [data]);
        return createResult[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

Team.updateByteamId = async (team_id, data) => {
    try {
        const columns = Object.keys(data);
        const values = Object.values(data);
        let sql = `update team set ${columns.join(" = ?, ")} = ? \
                    where team_id = ${team_id} `;
        const updateResult = await db.query(sql, values);
        return updateResult;
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};
Team.updateByTeamDocumentId = async (team_document_id, data) => {
    try {
        let sql = `update team set ? \
                    where team_document_id = '${team_document_id}' `;
        const updateResult = await db.query(sql, [data]);
        return updateResult;
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};


Team.deleteById = async (team_id) => {
    try {
        const deleteResult = await db.query(`delete from team where team_id = ${team_id}`);
        return deleteResult[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};
Team.deleteByTeamDocumentId = async (team_document_id) => {
    try {
        const deleteResult = await db.query(`delete from team where team_document_id = '${team_document_id}'`);
        return deleteResult[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};
module.exports = Team;