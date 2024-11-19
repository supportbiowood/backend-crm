const db = require("../utils/database");

let EmployeeRole = function (data) {
    this.role_document_id = data.role_document_id;
    this.employee_document_id = data.employee_document_id;
};

let model = "emmployee_role";

EmployeeRole.getAll = async () => {
    try {
        const result = await db.query("select * from employee_role");
        return result[0];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

/**
 * get all employees that has the role
 * @param {string} role_document_id 
 * @returns array of employee object
 */
EmployeeRole.getByRoleDocumentId = async (role_document_id) => {
    try {
        const result = await db.query("select employee.employee_document_id, employee.employee_document_id, employee.employee_firstname, \
                                            employee.employee_lastname, employee.employee_img_url, employee.employee_position, \
                                            employee.employee_department, employee.employee_phone, employee.employee_status \
                                        from employee_role \
                                        inner join employee \
                                        on employee_role.employee_document_id = employee.employee_document_id \
                                        where role_document_id = ?", [role_document_id]);
        return result[0];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

/**
 * get all role of an employee
 * @param {string} employee_document_id 
 * @returns array of Role, each role include role_document_id, role_name, role_description, permission_list
 */
EmployeeRole.getByEmployeeDocumentId = async (employee_document_id) => {
    try {
        const result = await db.query("select role.* \
                                        from employee_role \
                                        inner join role \
                                            on employee_role.role_document_id = role.role_document_id \
                                        where employee_document_id = ?", [employee_document_id]);
        return result[0];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

/**
 * 
 * @param {array} employee_document_id_list - list of employeeId after update
 * @param {string} role_document_id 
 * @returns  { Object }  { remove_result: removeResult[0], insert_result: insert_result[0]  }
 */
EmployeeRole.updateEmployeeListToRole = async (employee_document_id_list, role_document_id) => {
    try {
        // insertValuesString => "(e1, role_document_id), (e2, role_document_id), (e3, role_document_id)"
        const insertValuesString = employee_document_id_list.map((employee_document_id) => `( '${employee_document_id}', '${role_document_id}' )`).join(", ");
        const removeValueString = employee_document_id_list.length > 0 ? employee_document_id_list.map(employee_document_id => `'${employee_document_id}'`) : 0;
        let removeNotInListSQL = `delete from employee_role \
                                  where role_document_id = '${role_document_id}' \
                                    and employee_document_id not in ( ${removeValueString} )`;
        let insertIfNotHaveSQL = `insert ignore into employee_role (employee_document_id, role_document_id) values ${insertValuesString}`;
        const removeResult = await db.query(removeNotInListSQL);
        const insertResult = employee_document_id_list.length > 0 ? await db.query(insertIfNotHaveSQL) : [];
        return { remove_result: removeResult[0], insert_result: insertResult[0] };
    } catch (error) {
        console.log("update multiple role to employee error");
        throw new Error(`${model} model get ${error}`);
    }
};

/**
 * 
 * @param {string} employee_document_id
 * @param {array} role_document_id_list - list of role id and need to assign to employee 
 * @returns  { Object }  { remove_result: removeResult[0], insert_result: insert_result[0]  }
 */
EmployeeRole.updateRoleListEmployee = async (employee_document_id, role_document_id_list) => {
    try {
        // insertValuesString => "(employeeId, r1), (employeeId, r2), (employeeId, r3)"
        role_document_id_list = role_document_id_list && role_document_id_list.length > 0 ?
            role_document_id_list.map(role_document_id => `'${role_document_id}'`) : [`'0'`];

        const insertValuesString = role_document_id_list.map((role_document_id) => `( '${employee_document_id}', ${role_document_id} )`).join(", ");
        let removeNotInListSQL = `delete from employee_role \
                                  where employee_document_id = '${employee_document_id}' \
                                    and role_document_id not in ( ${role_document_id_list.join(',')} )`;
        let insertIfNotHaveSQL = `insert ignore into employee_role (employee_document_id, role_document_id) values ${insertValuesString}`;
        const removeResult = await db.query(removeNotInListSQL);
        const insertResult = role_document_id_list && role_document_id_list[0] !== `'0'` ? await db.query(insertIfNotHaveSQL) : [[]];
        return { remove_result: removeResult[0], insert_result: insertResult[0] };
    } catch (error) {
        console.log("update multiple employee error");
        throw new Error(`${model} model get ${error}`);
    }
};

EmployeeRole.deleteByRoleDocumentId = async (role_document_id) => {
    try {
        const result = await db.query("delete from employee_role where role_document_id = ?", [role_document_id]);
        return result[0];
    } catch (error) {
        throw new Error(`${model} model get ${error}`);
    }
};

module.exports = EmployeeRole;
