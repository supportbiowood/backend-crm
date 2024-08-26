const moment = require("moment");

const activityModel = require("../models/activity.model");
const projectModel = require("../models/project.model");

const {
    ActivityRefTypeOwnerType,
    ActivityRefTypeEnum,
    ActivityRefTypeDocumentThaiName,
    ActivityDocumentCategory } = require("../enums/activityEnum");

/**
 * Add document activity to activity logs
 * @param {int} projectId 
 * @param {int} refId - references document id
 * @param {string} refType - references document type
 * @param {string} refDocumentId - references document's document id
 * @param {string} documentCategory - type of ducument
 * @param {string} description - description of document
 * @param {object} user - user object who do something to document
 * @returns 
 */
const addDocumentActivity = async (
    projectId, refId, refType, refDocumentId, documentCategory, description, user) => {
    let documentThaiName = ActivityRefTypeDocumentThaiName(refType);

    //Add Project Activity if there is project id
    if (projectId) {
        const project = await projectModel.getById(projectId);
        if (project) {
            let data = {
                owner_id: project.project_document_id,
                owner_type: "PROJECT",
                activity_type: "document",
                activity_data: {
                    ref_id: refId,
                    ref_document_id: refDocumentId,
                    project_id: projectId,
                    document_category: documentCategory,
                    document_type: refType,
                    document_name: `${documentThaiName} - ${refDocumentId}`,
                    description: `${description}${documentThaiName}`,
                    _created: moment().tz("Asia/Bangkok").unix(),
                    _createdby: user.employee_document_id,
                    _createdby_employee: user,
                }
            };

            try {
                const newProjectActivityData = new activityModel(data);
                newProjectActivityData.activity_data = JSON.stringify(newProjectActivityData.activity_data);
                await activityModel.create(newProjectActivityData, user);
            } catch (error) {
                console.trace(error);
                throw error;
            }
        }
    }

    //Add Document Activity
    let data = {
        owner_id: refDocumentId,
        owner_type: ActivityRefTypeOwnerType(refType),
        activity_type: "document",
        activity_data: {
            ref_id: refId,
            ref_document_id: refDocumentId,
            project_id: projectId,
            document_category: documentCategory,
            document_type: refType,
            document_name: `${documentThaiName} - ${refDocumentId}`,
            description: `${description}${documentThaiName}`,
            _created: moment().tz("Asia/Bangkok").unix(),
            _createdby: user.employee_document_id,
            _createdby_employee: user,
        }
    };
    try {
        const newProjectActivityData = new activityModel(data);
        newProjectActivityData.activity_data = JSON.stringify(newProjectActivityData.activity_data);
        await activityModel.create(newProjectActivityData, user);
        return "success";
    } catch (error) {
        console.trace(error);
        throw error;
    }

};

export { addDocumentActivity };