const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const purchaseRequestModel = require("../models/purchaseRequest.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const salesOrderModel = require("../models/salesOrder.model");
const purchaseOrderModel = require("../models/purchaseOrder.model");

const purchaseRequestTemplate = require("../templates/purchaseRequest");

const { genDocumentId } = require("../utils/generate");
const itemValidation = require("../utils/item");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory  } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.PURCHASE_REQUEST;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;

exports.getAll = async (req, res) => {
    try{
        const result = await purchaseRequestModel.getAll();

        return res.send({
            status: "success",
            data: result.reverse()
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.getByDocumentId = async (req, res) => {
    try{
        const result = await purchaseRequestModel.getByDocumentId(req.params.document_id);

        let purchaseOrderList = await purchaseOrderModel.getAllByPurchaseRequestDocumentId(result.purchase_request_document_id);

        if(purchaseOrderList)
            result.purchase_order_list = await purchaseOrderList.filter((po) => po.purchase_order_status !== 'cancelled');

        return res.send({
            status: "success",
            data: result
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.getSalesOrderList = async (req, res)=>{
    try{
        let salesOrderListResult = await salesOrderModel.getAll();

        salesOrderListResult= await salesOrderListResult.filter(
            (so)=>so.sales_order_status === "approved" || 
                so.sales_order_status === "closed");

        let result = [];
        for(let salesOrder of salesOrderListResult){
            let purchaseRequestResult = await purchaseRequestModel.getBySalesOrderDocumentId(salesOrder.sales_order_document_id);
            if(purchaseRequestResult===undefined){
                result.push(salesOrder);
            }
        }

        return res.send({
            status: 'success',
            data: result
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.create = async (req, res)=>{
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if(req.body.purchase_request_template_remark_id === undefined || req.body.purchase_request_template_remark_id === ""){
        req.body.purchase_request_template_remark_id = null;
    }

    if(req.body.purchase_request_remark === undefined || req.body.purchase_request_remark === ""){
        req.body.purchase_request_remark = null;
    }

    try{
        const newPurchaseRequestData = new purchaseRequestModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseRequestData.purchase_request_data);
        const genPRDocumentId = await genDocumentId("PR", "purchase_request");
        newPurchaseRequestData.purchase_request_document_id = genPRDocumentId.document_id;
        newPurchaseRequestData.purchase_request_status = "draft";
        const result = await purchaseRequestModel.create(newPurchaseRequestData, req.user);

        //add documentId to result data
        result.documentId = genPRDocumentId.document_id;

        await addDocumentActivity(
            null, 
            result.insertId,
            documentName, 
            genPRDocumentId.document_id, 
            documentCategory, 
            "สร้าง", 
            req.user);

        return res.send({
            status: "success",
            data: result
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.update = async (req, res)=>{
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if(req.body.purchase_request_template_remark_id === undefined || req.body.purchase_request_template_remark_id === ""){
        req.body.purchase_request_template_remark_id = null;
    }

    if(req.body.purchase_request_remark === undefined || req.body.purchase_request_remark === ""){
        req.body.purchase_request_remark = null;
    }

    try{
        if(req.body.purchase_request_status === undefined || req.body.purchase_request_status === null || req.body.purchase_request_status === ""){
            throw new Error(`purchase_request_status is not value`);
        }

        const newPurchaseRequestData = new purchaseRequestModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseRequestData.purchase_request_data);
        newPurchaseRequestData.sales_order_document_id_list = JSON.stringify(newPurchaseRequestData.sales_order_document_id_list);
        newPurchaseRequestData.sales_order_project_list = JSON.stringify(newPurchaseRequestData.sales_order_project_list);
        newPurchaseRequestData.purchase_request_data = JSON.stringify(newPurchaseRequestData.purchase_request_data);
        
        const result = await purchaseRequestModel.updateByDocumentId(req.params.document_id, newPurchaseRequestData, req.user);

        await addDocumentActivity(
            null, 
            req.body.purchase_request_id,
            documentName, 
            req.body.purchase_request_document_id, 
            documentCategory, 
            "แก้ไข", 
            req.user);

        return res.send({
            status: "success",
            data: result
        });
    }catch(error){
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};
exports.waitApprove = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if(req.body.purchase_request_template_remark_id === undefined || req.body.purchase_request_template_remark_id === ""){
        req.body.purchase_request_template_remark_id = null;
    }

    if(req.body.purchase_request_remark === undefined || req.body.purchase_request_remark === ""){
        req.body.purchase_request_remark = null;
    }

    try{
        req.body.purchase_request_status = "wait_approve";
    
        if(req.body.purchase_request_id === undefined){
            const genPRDocumentId = await genDocumentId("PR", "purchase_request");
            req.body.purchase_request_document_id = genPRDocumentId.document_id;
            const newPurchaseRequestData = new purchaseRequestModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseRequestData.purchase_request_data);
            const result = await purchaseRequestModel.create(newPurchaseRequestData, req.user);

            //add documentId to result data
            result.documentId = genPRDocumentId.document_id;

            await addDocumentActivity(
                null, 
                result.insertId,
                documentName, 
                genPRDocumentId.document_id, 
                documentCategory, 
                "สร้าง", 
                req.user);
            await addDocumentActivity(
                null, 
                result.insertId,
                documentName, 
                genPRDocumentId.document_id, 
                documentCategory,  
                "รออนุมัติ", 
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        }else{
            const newPurchaseRequestData = new purchaseRequestModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseRequestData.purchase_request_data);
            newPurchaseRequestData.sales_order_document_id_list = JSON.stringify(newPurchaseRequestData.sales_order_document_id_list);
            newPurchaseRequestData.sales_order_project_list = JSON.stringify(newPurchaseRequestData.sales_order_project_list);
            newPurchaseRequestData.purchase_request_data = JSON.stringify(newPurchaseRequestData.purchase_request_data);

            const result = await purchaseRequestModel.update(req.body.purchase_request_id, newPurchaseRequestData, req.user);

            await addDocumentActivity(
                null, 
                req.body.purchase_order_id,
                documentName, 
                req.body.purchase_request_document_id, 
                documentCategory,  
                "รออนุมัติ", 
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        }
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.notApprove = async (req, res) => {
    try{
        const result = await purchaseRequestModel.updateByDocumentId(req.params.document_id, {purchase_request_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null  }, req.user);

        const purchaseRequestResult = await purchaseRequestModel.getByDocumentId(req.params.document_id);

        if (purchaseRequestResult) {
            await addDocumentActivity(
                null, 
                purchaseRequestResult.purchase_order_id,
                documentName, 
                purchaseRequestResult.purchase_order_document_id, 
                documentCategory,  
                req.body.not_approve_reason || "ไม่อนุมัติ", 
                req.user);
        }

        return res.send({
            status: "success",
            data: result
        });
    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if(req.body.purchase_request_template_remark_id === undefined || req.body.purchase_request_template_remark_id === ""){
        req.body.purchase_request_template_remark_id = null;
    }

    if(req.body.purchase_request_remark === undefined || req.body.purchase_request_remark === ""){
        req.body.purchase_request_remark = null;
    }

    try{
        if(req.body.purchase_request_id === undefined){
            const newPurchaseRequestData = new purchaseRequestModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseRequestData.purchase_request_data);
            const genPRDocumentId = await genDocumentId("PR", "purchase_request");
            newPurchaseRequestData.purchase_request_document_id = genPRDocumentId.document_id;
            newPurchaseRequestData.purchase_request_status = "approved";
            newPurchaseRequestData.purchase_request_approveby = req.user.employee_id;
            newPurchaseRequestData.purchase_request_approveby_employee = JSON.stringify(req.user);
            const result = await purchaseRequestModel.create(newPurchaseRequestData, req.user);

            //add documentId to result data
            result.documentId = genPRDocumentId.document_id;

            await addDocumentActivity(
                null, 
                result.insertId,
                documentName, 
                genPRDocumentId.document_id, 
                documentCategory, 
                "สร้าง", 
                req.user);
            await addDocumentActivity(
                null, 
                result.insertId,
                documentName, 
                genPRDocumentId.document_id, 
                documentCategory,  
                "อนุมัติ", 
                req.user);
    
            return res.send({
                status: "success",
                data: result
            });
        }else{
            const newPurchaseRequestData = new purchaseRequestModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseRequestData.purchase_request_data);
            newPurchaseRequestData.sales_order_document_id_list = JSON.stringify(newPurchaseRequestData.sales_order_document_id_list);
            newPurchaseRequestData.sales_order_project_list = JSON.stringify(newPurchaseRequestData.sales_order_project_list);
            newPurchaseRequestData.purchase_request_data = JSON.stringify(newPurchaseRequestData.purchase_request_data);
            newPurchaseRequestData.purchase_request_status = "approved";
            newPurchaseRequestData.purchase_request_approveby = req.user.employee_id;
            newPurchaseRequestData.purchase_request_approveby_employee = JSON.stringify(req.user);

            const result = await purchaseRequestModel.update(req.body.purchase_request_id, newPurchaseRequestData, req.user);
    
            await addDocumentActivity(
                null, 
                req.body.purchase_request_id,
                documentName, 
                req.body.purchase_request_document_id, 
                documentCategory,  
                "อนุมัติ", 
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        }
    }catch(error){
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};

exports.copyDocument = async (req, res) => {
    try{
        const purchaseRequestData = await purchaseRequestModel.getByDocumentId(req.params.document_id);

        if(purchaseRequestData !== undefined){
            let result = {
                sales_order_document_id_list: purchaseRequestData.sales_order_document_id_list,
                sales_order_project_list: purchaseRequestData.sales_order_project_list,
                purchase_request_data: purchaseRequestData.purchase_request_data,
                purchase_request_template_remark_id: purchaseRequestData.purchase_request_template_remark_id,
                purchase_request_remark: purchaseRequestData.purchase_request_remark
            };

            return res.send({
                status: "success",
                data: result
            });
        }else{
            throw new Error(`ไม่พบเอกสาร`);
        }
    }catch(error){
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const purchaseRequestData = await purchaseRequestModel.getByDocumentId(
            req.params.document_id
        );

        if (purchaseRequestData !== undefined) {
            purchaseRequestData.purchase_request_issue_date = moment(
                purchaseRequestData.purchase_request_issue_date
            ).format("DD/MM/YYYY");
            purchaseRequestData.purchase_request_due_date = moment(
                purchaseRequestData.purchase_request_due_date
            ).format("DD/MM/YYYY");
            const pdf_name = `${purchaseRequestData.purchase_request_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                purchaseRequestTemplate(purchaseRequestData),
                {
                    format: "A4",
                    directory: ".",
                    filename: pdf_path,
                }
            );

            return res.sendFile(pdf_path, async (err) => {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        await fs.unlinkSync(pdf_path);
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        } else {
            return res.status(400).send({
                status: "error",
                message: "ไม่มีเอกสารฉบับนี้",
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.generatePurchaseOrderData = async (req, res) => {
    try{
        const purchaseRequestResult = await purchaseRequestModel.getByDocumentId(req.params.document_id);

        if(purchaseRequestResult !== undefined){
            let result = {
                purchase_request_document_id_list: [purchaseRequestResult.purchase_request_document_id],
                sales_order_project_list: purchaseRequestResult.sales_order_project_list,
                inventory_target: purchaseRequestResult.inventory_target,
                purchase_order_data: purchaseRequestResult.purchase_request_data,
                purchase_order_template_remark_id: purchaseRequestResult.purchase_request_template_remark_id,
                purchase_order_remark: purchaseRequestResult.purchase_request_remark,
            };

            return res.send({
                status: "success",
                data: result
            });
        }else{
            throw new Error(`ไม่พบเอกสาร ${req.params.purchase_request_document_id}`);
        }

    }catch(error){
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.delete = async (req, res) => {
    try{
        const purchaseRequestResult = await purchaseRequestModel.getByDocumentId(req.params.document_id);
        if(purchaseRequestResult !== undefined){

            let purchaseOrderListResult = await purchaseOrderModel.getAllByPurchaseRequestDocumentId(purchaseRequestResult.purchase_request_document_id);
            purchaseOrderListResult = await purchaseOrderListResult.filter((po) => po.purchase_order_status !== "cancelled");

            if(purchaseOrderListResult.length === 0){
                const result = await purchaseRequestModel.updateByDocumentId(req.params.document_id, {purchase_request_status: "cancelled"}, req.user);
    
                if (purchaseRequestResult) {
                    await addDocumentActivity(
                        null, 
                        purchaseRequestResult.purchase_order_id,
                        documentName, 
                        purchaseRequestResult.purchase_order_document_id, 
                        documentCategory,  
                        "ยกเลิก", 
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result
                });
            }else{
                throw new Error(`กรุณายกเลิกเอกสารที่เกี่ยวข้อง`);
            }
        }else{
            throw new Error(`ไม่พบเอกสาร`);
        }

    }catch(error){
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};