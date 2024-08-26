const db = require("../utils/database");
const moment = require("moment");
let EngineerModel = function (data) {
    this.revision_name = data.revision_name || null;
    this.engineer_start_date = data.engineer_start_date;
    this.engineer_end_date = data.engineer_end_date;
    this.engineer_list = data.engineer_list; //json
    this.engineer_issue_date = data.engineer_issue_date;
    this.project_info = data.project_info; //json
    this.reproduction = data.reproduction;
    this.installation = data.installation;
    this.adjustment = data.adjustment;
    this.job_project_type = data.job_project_type;
    this.job_description = data.job_description;
    this.job_priority = data.job_priority;
    this.delivery_method = data.delivery_method;
    this.delivery_count = data.delivery_count;
    this.delivery_floor = data.delivery_floor;
    this.delivery_scaffold = data.delivery_scaffold;
    this.delivery_cartage_method = data.delivery_cartage_method; //array
    this.created_by = data.created_by;
    this.engineer_status = data.engineer_status;
    this.engineer_data = data.engineer_data; //json
    // this.input_attachments = data.input_attachments || []; //array
    // this.deliver_attachments = data.deliver_attachments || []; //array
    // this.remark_attachments = data.remark_attachments || []; //array
    this._job_approved_date = data._job_approved_date;
    this._job_approved_by = data._job_approved_by;
    this._review_approved_date = data._review_approved_date;
    this._review_approved_by = data._review_approved_by;
    this.engineer_remark = data.engineer_remark;
    this.not_approve_reason = data.not_approve_reason;
};

let table = "engineer";

EngineerModel.create = async (data, created_by) => {
    try {
        const newDate = moment().tz("Asia/Bangkok").unix();
        data.engineer_issue_date = newDate;
        data.created_by = created_by.employee_document_id;
        data.project_info = JSON.stringify(data.project_info);
        data.engineer_list = JSON.stringify(data.engineer_list);
        data.delivery_cartage_method = JSON.stringify(data.delivery_cartage_method);
        data.engineer_data = JSON.stringify(data.engineer_data);
        data.input_attachments = JSON.stringify(data.input_attachments);
        data.deliver_attachments = JSON.stringify(data.deliver_attachments);
        data.remark_attachments = JSON.stringify(data.remark_attachments);
        data._last_updated_by = created_by.employee_document_id;
        data._last_updated_date = newDate;
        const columns = Object.keys(data);
        // const values = Object.values(data).map(value => value ? value : null);
        const values = Object.values(data);
        let sql =
            `insert into ${table} ( ${columns.join(", ")} ) \
            values (${Array(columns.length).fill("?")}) `;
        let result = await db.query(sql, values);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.create: ${error.message}`);
    }

};

EngineerModel.getAll = async () => {
    try {
        let sql =
            `\
        select e.* \
        from engineer as e \
        join(select distinct engineer.engineer_document_id, MAX(revision_id) as revision_id \
        from engineer \
        group by engineer_document_id) as t \
            on e.engineer_document_id = t.engineer_document_id \
                   and e.revision_id = t.revision_id
        order by e.engineer_issue_date desc`;

        let result = await db.query(sql);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.getAll: ${error.message}`);
    }
};

EngineerModel.getById = async (id) => {
    try {
        let result = await db.query(`SELECT * FROM ${table} WHERE id = ?`, id);
        return result[0][0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.getById: ${error.message}`);
    }
};

EngineerModel.getByDocumentId = async (document_id) => {
    try {
        let result = await db.query(`SELECT * FROM ${table} WHERE engineer_document_id = ? order by revision_id desc`, document_id);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.getByDocumentId: ${error.message}`);
    }
};

EngineerModel.getRevisionByDocumentId = async (document_id) => {
    try {
        let result = await db.query(`SELECT revision_id, revision_name FROM ${table} WHERE engineer_document_id = ? order by revision_id desc`, document_id);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.getRevisionByDocumentId: ${error.message}`);
    }
};

EngineerModel.getByDocumentIdRevisionId = async (document_id, revision_id) => {
    try {
        let result = await db.query(`SELECT * FROM ${table} WHERE engineer_document_id = ? and revision_id = ?`, [document_id, revision_id]);
        return result[0][0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.getByDocumentIdRevisionId: ${error.message}`);
    }
};

EngineerModel.getByCondition = async (statement = '1') => {
    try {
        let result = await db.query(`SELECT * FROM ${table} WHERE ${statement}`);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.getByCondition: ${error.message}`);
    }
};

EngineerModel.fullFilterTotalRow = async (statement = 'where 1') => {
    try {
        let result = await db.query(`
        select count(*) as total
        from engineer as e 
        right join(
            select distinct engineer.engineer_document_id as t_doc_id, MAX(revision_id) as t_revision_id 
            from engineer 
            group by engineer_document_id
            ) as t 
            on e.engineer_document_id = t.t_doc_id 
                   and e.revision_id = t.t_revision_id
        ${statement}
        `);
        return result[0][0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.fullFilter: ${error.message}`);
    }
};

EngineerModel.fullFilter = async (statement = 'where 1') => {
    try {
        let result = await db.query(`
        select e.* 
        from engineer as e 
        right join(
            select distinct engineer.engineer_document_id as t_doc_id, MAX(revision_id) as t_revision_id 
            from engineer 
            group by engineer_document_id
            ) as t 
            on e.engineer_document_id = t.t_doc_id 
                   and e.revision_id = t.t_revision_id
        ${statement}
        `);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.fullFilter: ${error.message}`);
    }
};

EngineerModel.updateByDocumentIdCustom = async (document_id, data, revision_id, update_by) => {
    try {
        data._last_updated_by = update_by.employee_document_id;
        data._last_updated_date = moment().tz("Asia/Bangkok").unix();
        let result = await db.query(`UPDATE ${table} SET ? WHERE engineer_document_id = ? and revision_id = ?`, [data, document_id, revision_id]);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.updateByDocumentIdCustom: ${error.message}`);
    }
};

EngineerModel.updateById = async (document_id, data, update_by) => {
    try {
        data.project_info = JSON.stringify(data.project_info);
        data.delivery_cartage_method = JSON.stringify(data.delivery_cartage_method);
        data.engineer_data = JSON.stringify(data.engineer_data);
        data.input_attachments = JSON.stringify(data.input_attachments);
        data.deliver_attachments = JSON.stringify(data.deliver_attachments);
        data.remark_attachments = JSON.stringify(data.remark_attachments);
        data._last_updated_by = update_by.employee_document_id;
        data._last_updated_date = moment().tz("Asia/Bangkok").unix();
        let result = await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [data, document_id]);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.updateById: ${error.message}`);
    }
};

EngineerModel.updateByDocumentId = async (document_id, data, revision_id, updated_by) => {
    try {

        for (let key in Object.keys(data)) {
            switch (key) {
                case "project_info":
                    data.project_info = JSON.stringify(data.project_info);
                    break;
                case "engineer_list":
                    data.engineer_list = JSON.stringify(data.engineer_list);
                    break;
                case "delivery_cartage_method":
                    data.delivery_cartage_method = JSON.stringify(data.delivery_cartage_method);
                    break;
                case "engineer_data":
                    data.engineer_data = JSON.stringify(data.engineer_data);
                    break;
                case "input_attachments":
                    data.input_attachments = JSON.stringify(data.input_attachments);
                    break;
                case "deliver_attachments":
                    data.deliver_attachments = JSON.stringify(data.deliver_attachments);
                    break;
                case "remark_attachments":
                    data.remark_attachments = JSON.stringify(data.remark_attachments);
                    break;
                default:
                    break;
            }
        }
        data._last_updated_by = updated_by.employee_document_id;
        data._last_updated_date = moment().tz("Asia/Bangkok").unix();
        let result = await db.query(`UPDATE ${table} SET ? WHERE engineer_document_id = ? and revision_id = ?`, [data, document_id, revision_id]);
        return result[0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.updateByDocumentId: ${error.message}`);
    }
};

EngineerModel.deleteByDocumentId = async (document_id, delete_by) => {
    try {
        const _last_updated_by = delete_by.employee_document_id;
        const _last_updated_date = moment().tz("Asia/Bangkok").unix();
        let result = await db.query(`UPDATE ${table} SET status = 'delete', _last_updated_by = '${_last_updated_by}', _last_updated_date '${_last_updated_date}'  WHERE engineer_document_id = ?`, [document_id]);
        return result[0][0];
    } catch (error) {
        throw new Error(`Error in EngineerModel.deleteByDocumentId: ${error.message}`);
    }
};

module.exports = EngineerModel;