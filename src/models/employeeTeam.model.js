const db = require("../utils/database");

let EmployeeTeam = function (data) {
    this.team_document_id = data.team_document_id;
    this.employee_document_id = data.employee_document_id;
    this.employee_level = data.employee_level;
    this.is_in_charge = data.is_in_charge;
};

let model = "employeeTeam";

EmployeeTeam.getAll = async () => {
    try {
        const result = await db.query("select * from employee_team order by team_document_id, employee_level ");
        return result[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

EmployeeTeam.getTeamByEmployeeDocumentId = async (employee_document_id) => {
    try {
        let sql = `select t.team_document_id, t.team_name, t.team_description, et.* \
                    from employee_team et \
                    join team t on et.team_document_id = t.team_document_id  \
                    where employee_document_id = '${employee_document_id}'`;
        const result = await db.query(sql);
        return result[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

EmployeeTeam.getByTeamDocumentId = async (team_document_id) => {
    try {
        let sql = `select *
                    from employee_team et \
                    inner join team t on et.team_document_id = t.team_document_id \
                    inner join employee e on et.employee_document_id = e.employee_document_id \
                    where et.team_document_id = '${team_document_id}'
                    order by employee_level`;
        const result = await db.query(sql);
        return result[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};

EmployeeTeam.updateEmployeeToTeam = async (team_document_id, employee_team_list) => {
    try {
        const employeeIdList = employee_team_list.map(employeeTeam => `'${employeeTeam.employee_document_id}'`);
        const insertValuesString = employee_team_list.map(
            (employeeTeam) =>
                `( '${team_document_id}', '${employeeTeam.employee_document_id}', ${employeeTeam.employee_level}, ${employeeTeam.is_in_charge || 0} )`)
            .join(", ");
        let removeSql = `delete from employee_team where employee_document_id not in ( ${employeeIdList.length > 0 ? employeeIdList.join(',') : `'0'`} ) and team_document_id = '${team_document_id}'`;
        let insertSql = `insert into employee_team (team_document_id, employee_document_id, employee_level, is_in_charge) \
                    values ${insertValuesString} \
                    on duplicate key update employee_level = VALUES(employee_level), is_in_charge = VALUES(is_in_charge)`;
        const removeResult = await db.query(removeSql);
        const insertResult = employee_team_list.length > 0 ? await db.query(insertSql) : [[]];
        return { remove_result: removeResult[0], insert_result: insertResult[0] };
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }

};

EmployeeTeam.deleteByTeamDocumentId = async (team_document_id) => {
    try {
        const deleteResult = await db.query(`delete from employee_team where team_document_id = '${team_document_id}'`);
        return deleteResult[0];
    } catch (error) {
        throw new Error(`${model} model insert ${error}`);
    }
};


module.exports = EmployeeTeam;