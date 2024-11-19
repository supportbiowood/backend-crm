const moment = require("moment");
const db = require("../utils/database");
const fs = require("fs");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const salesOrderModel = require("../models/salesOrder.model.js");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const quotationModel = require("../models/quotation.model");
const deliveryNoteModel = require("../models/deliveryNote.model");
const salesInvoiceModel = require("../models/salesInvoice.model");
const salesReturnModel = require("../models/salesReturn.model");

const salesOrderTemplate = require("../templates/salesOrder");

const { addDocumentActivity } = require("../utils/activity");
const itemValidation = require("../utils/item");

const { ActivityRefTypeEnum, ActivityDocumentCategory  } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.SALES_ORDER;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

const { genDocumentId } = require("../utils/generate");

exports.getAll = async (req, res) => {
    try {
        let result = await salesOrderModel.getAll();

        return res.send({
            status: "success",
            data: result.reverse(),
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.getByDocumentId = async (req, res) => {
    try {
        let result = await salesOrderModel.getByDocumentId(req.params.document_id);

        let deliveryNoteList = await deliveryNoteModel.getAllBySalesOrderDocumentId(result.sales_order_document_id) || [];
        let salesInvoiceList = await salesInvoiceModel.getAllBySalesOrderDocumentId(result.sales_order_document_id) || [];
        let salesReturnList = await salesReturnModel.getAllBySalesOrderDocumentId(result.sales_order_document_id) || [];


        result.delivery_note_list = await deliveryNoteList.filter((so) => so.sales_order_status !== 'cancelled');
        result.sales_invoice_list = await salesInvoiceList.filter((si) => si.sales_invoice_status !== 'cancelled');
        result.sales_return_list = await salesReturnList.filter((sr) => sr.sales_return_status !== 'cancelled');
    
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
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

    if (
        req.body.sales_order_template_remark_id === undefined || req.body.sales_order_template_remark_id === "") {
        req.body.sales_order_template_remark_id = null;
    }

    if (req.body.sales_order_remark === undefined || req.body.sales_order_remark === "") {
        req.body.sales_order_remark = null;
    }

    try {
        const newSalesOrderData = new salesOrderModel(req.body);
        itemValidation.validateItemSale(newSalesOrderData.sales_order_data);
        const genSalesOrderDocumentId = await genDocumentId("SO", "sales_order");
        newSalesOrderData.sales_order_document_id = genSalesOrderDocumentId.document_id;
        newSalesOrderData.sales_order_status = "draft";

        const result = await salesOrderModel.create(newSalesOrderData, req.user);

        //add documentId to result data
        result.documentId = genSalesOrderDocumentId.document_id;

        //create project activity
        if(req.body.billing_info){
            await addDocumentActivity(
                req.body.billing_info.project_id, 
                result.insertId, 
                documentName, 
                genSalesOrderDocumentId.document_id,
                documentCategory,
                "สร้าง", 
                req.user);
        }

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
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

    if (req.body.sales_order_template_remark_id === undefined ||req.body.sales_order_template_remark_id === "") {
        req.body.sales_order_template_remark_id = null;
    }

    if (req.body.sales_order_remark === undefined || req.body.sales_order_remark === "") {
        req.body.sales_order_remark = null;
    }

    try {
        if(req.body.sales_order_status === undefined || req.body.sales_order_status === null || req.body.sales_order_status === ""){
            throw new Error(`sales_order_status is not value`);
        }
    
        const newSalesOrderData = new salesOrderModel(req.body);
        itemValidation.validateItemSale(newSalesOrderData.sales_order_data);
        newSalesOrderData.billing_info = JSON.stringify(newSalesOrderData.billing_info);
        newSalesOrderData.sale_list = JSON.stringify(newSalesOrderData.sale_list);
        newSalesOrderData.sales_order_data = JSON.stringify(newSalesOrderData.sales_order_data);

        const result = await salesOrderModel.updateByDocumentId(req.params.document_id, newSalesOrderData, req.user);

        //create project activity
        if(req.body.billing_info){
            await addDocumentActivity(
                req.body.billing_info.project_id, 
                req.body.sales_order_id, 
                documentName, 
                req.body.sales_order_document_id, 
                documentCategory, 
                "แก้ไข", 
                req.user);
        }

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
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

    if (req.body.sales_order_template_remark_id === undefined ||req.body.sales_order_template_remark_id === "") {
        req.body.sales_order_template_remark_id = null;
    }

    if (req.body.sales_order_remark === undefined || req.body.sales_order_remark === "") {
        req.body.sales_order_remark = null;
    }

    try {

        req.body.sales_order_status = "wait_approve";

        if(req.body.sales_order_id === undefined ){
            const newSalesOrderData = new salesOrderModel(req.body);
            itemValidation.validateItemSale(newSalesOrderData.sales_order_data);
            const genSalesOrderDocumentId = await genDocumentId("SO", "sales_order");
            newSalesOrderData.sales_order_document_id = genSalesOrderDocumentId.document_id;

            const result = await salesOrderModel.create(newSalesOrderData, req.user);
            //add documentId to result data
            result.documentId = genSalesOrderDocumentId.document_id;

            if(req.body.billing_info){
                await addDocumentActivity(
                    req.body.billing_info.project_id, 
                    result.insertId, 
                    documentName, 
                    genSalesOrderDocumentId.document_id, 
                    documentCategory, 
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id, 
                    result.insertId, 
                    documentName, 
                    genSalesOrderDocumentId.document_id, 
                    documentCategory,
                    "รออนุมัติ", 
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });

        }else{
            const newSalesOrderData = new salesOrderModel(req.body);
            itemValidation.validateItemSale(newSalesOrderData.sales_order_data);
            newSalesOrderData.billing_info = JSON.stringify(newSalesOrderData.billing_info);
            newSalesOrderData.sale_list = JSON.stringify(newSalesOrderData.sale_list);
            newSalesOrderData.sales_order_data = JSON.stringify(newSalesOrderData.sales_order_data);
  
            const result = await salesOrderModel.update(req.body.sales_order_id, newSalesOrderData, req.user);
  
            //create project activity
            if(req.body.billing_info){
                await addDocumentActivity(
                    req.body.billing_info.project_id, 
                    req.body.sales_order_id, 
                    documentName, 
                    req.body.sales_order_document_id,
                    documentCategory, "รออนุมัติ", 
                    req.user);
            }
  
            return res.send({
                status: "success",
                data: result,
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
exports.notApprove = async (req, res) => {
    try {
        const result = await salesOrderModel.updateByDocumentId(
            req.params.document_id,
            { sales_order_status: "not_approve" , not_approve_reason: req.body.not_approve_reason || null },
            req.user
        );

        const salesOrderResult = await salesOrderModel.getByDocumentId(req.params.document_id);

        if(salesOrderResult.billing_info){
            await addDocumentActivity(
                salesOrderResult.billing_info.project_id, 
                salesOrderResult.sales_order_id, 
                documentName, 
                salesOrderResult.sales_order_document_id, 
                documentCategory, 
                req.body.not_approve_reason || "ไม่อนุมัติ",
                req.user);
        }

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.approve = async (req, res)=>{
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    const mysql = await db.getConnection();
    await mysql.beginTransaction();

    try{
        if(req.body.sales_order_id === undefined){
            const newSalesOrderData = new salesOrderModel(req.body);
            itemValidation.validateItemSale(newSalesOrderData.sales_order_data);
            const genSalesOrderDocumentId = await genDocumentId("SO", "sales_order");
            newSalesOrderData.sales_order_document_id = genSalesOrderDocumentId.document_id;
            newSalesOrderData.sales_order_status = "approved";
            newSalesOrderData.sales_order_stage = "sales_order";

            const result = await salesOrderModel.create(newSalesOrderData, req.user);

            //add documentId to result data
            result.documentId = genSalesOrderDocumentId.document_id;

            if (req.body.quotation_document_id !== null) {
                await quotationModel.updateByDocumentId(req.body.quotation_document_id, { quotation_status: "closed", quotation_stage: "sales_order"}, req.user);
            }

            //create project activity
            if(req.body.billing_info){
                await addDocumentActivity(
                    req.body.billing_info.project_id, 
                    result.insertId, 
                    documentName, 
                    genSalesOrderDocumentId.document_id, 
                    documentCategory, 
                    "สร้าง", 
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId, 
                    documentName, 
                    genSalesOrderDocumentId.document_id, 
                    documentCategory, 
                    "อนุมัติ", 
                    req.user);
            }

            return res.send({
                status: "success",
                data: result
            });
        }else{
            const newSalesOrderData = new salesOrderModel(req.body);
            itemValidation.validateItemSale(newSalesOrderData.sales_order_data);
            newSalesOrderData.sales_order_status = "approved";
            newSalesOrderData.sales_order_stage = "sales_order";
            newSalesOrderData.billing_info = JSON.stringify(newSalesOrderData.billing_info);
            newSalesOrderData.sale_list = JSON.stringify(newSalesOrderData.sale_list);
            newSalesOrderData.sales_order_data = JSON.stringify(newSalesOrderData.sales_order_data);
            newSalesOrderData.sales_order_approveby = req.user.employee_id;
            newSalesOrderData.sales_order_approveby_employee = JSON.stringify(req.user);

            const result = await salesOrderModel.update(req.body.sales_order_id, newSalesOrderData, req.user);

            if (req.body.quotation_document_id !== null) {
                await quotationModel.updateByDocumentId(req.body.quotation_document_id, {quotation_status: "closed", quotation_stage: "sales_order"}, req.user);
            }

            if(req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id, 
                    req.body.sales_order_id, 
                    documentName, 
                    req.body.sales_order_document_id,
                    documentCategory, 
                    "อนุมัติ", 
                    req.user);
            }

            await mysql.commit();
            await mysql.release();
            return res.send({
                status: "success",
                data: result,
            });
        }
    }catch(error){
        await mysql.rollback();
        await mysql.release();
        console.log("Rollback successful");
        console.dir(error, { depth: null });

        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.copyDocument = async (req, res) => {

    try {
        const salesOrderResult = await salesOrderModel.getByDocumentId(req.params.document_id);

        if (salesOrderResult !== undefined) {
            let result = {
                quotation_document_id: salesOrderResult.quotation_document_id,
                sales_order_stage: "quotation",
                billing_info: salesOrderResult.billing_info,
                sales_order_data: salesOrderResult.sales_order_data,
                sale_list: salesOrderResult.sale_list,
                sales_order_template_remark_id: salesOrderResult.sales_order_template_remark_id,
                sales_order_remark: salesOrderResult.sales_order_remark,
                shipping_cost: salesOrderResult.shipping_cost,
                additional_discount: salesOrderResult.additional_discount,
                vat_exempted_amount: salesOrderResult.vat_exempted_amount,
                vat_0_amount: salesOrderResult.vat_0_amount,
                vat_7_amount: salesOrderResult.vat_7_amount,
                vat_amount: salesOrderResult.vat_amount,
                net_amount: salesOrderResult.net_amount,
                withholding_tax: salesOrderResult.withholding_tax,
                total_amount: salesOrderResult.total_amount
            };
            return res.send({
                status: "success",
                data: result,
            });
        }else{
            throw new Error("ไม่พบเอกสาร");
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.genDocument = async (req, res) => {
    try {
        const salesOrderResult = await salesOrderModel.getByDocumentId(
            req.params.document_id
        );

        if (salesOrderResult !== undefined) {
            salesOrderResult.sales_order_issue_date = moment(salesOrderResult.sales_order_issue_date).format("DD/MM/YYYY");
            salesOrderResult.sales_order_due_date = moment(salesOrderResult.sales_order_due_date).format("DD/MM/YYYY");
            salesOrderResult.sales_order_expect_date = moment(salesOrderResult.sales_order_expect_date).format("DD/MM/YYYY");
            salesOrderResult.billing_info.address = salesOrderResult.billing_info.address === "" ? "-" : salesOrderResult.billing_info.address;
            const pdf_name = `${salesOrderResult.sales_order_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                salesOrderTemplate(salesOrderResult),
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

exports.generateSalesInvoiceData = async (req, res) => {
    try {
        const salesOrderResult = await salesOrderModel.getByDocumentId(req.params.document_id);
        if (salesOrderResult !== undefined) {
            let result = {
                sales_order_document_id: salesOrderResult.sales_order_document_id,
                sales_invoice_stage: "sales_order",
                billing_info: salesOrderResult.billing_info,
                sales_invoice_data: salesOrderResult.sales_order_data,
                sale_list: salesOrderResult.sale_list,
                sales_invoice_template_remark_id: salesOrderResult.sales_order_template_remark_id,
                sales_invoice_remark: salesOrderResult.sales_order_remark,
                shipping_cost: salesOrderResult.shipping_cost,
                additional_discount: salesOrderResult.additional_discount,
                vat_exempted_amount: salesOrderResult.vat_exempted_amount,
                vat_0_amount: salesOrderResult.vat_0_amount,
                vat_7_amount: salesOrderResult.vat_7_amount,
                vat_amount: salesOrderResult.vat_amount,
                net_amount: salesOrderResult.net_amount,
                withholding_tax: salesOrderResult.withholding_tax,
                total_amount: salesOrderResult.total_amount,
            };
            return res.send({
                status: "success",
                data: result,
            });
        } else {
            return res.status(400).send({
                status: "error",
                message: `ไม่มีรหัสเอกสาร ${req.params.document_id}`,
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.delete = async (req, res) => {

    const mysql = await db.getConnection();
    await mysql.beginTransaction();

    try{
        const salesOrderResult = await salesOrderModel.getByDocumentId(req.params.document_id);

        if(salesOrderResult){
            let salesInvoiceListResult = await salesInvoiceModel.getAllBySalesOrderDocumentId(salesOrderResult.sales_order_document_id);
            salesInvoiceListResult = await salesInvoiceListResult.filter((si) => si.sales_invoice_status !== "cancelled");
      
            let deliveryNoteListResult = await deliveryNoteModel.getAllBySalesOrderDocumentId(salesOrderResult.sales_order_document_id);
            deliveryNoteListResult = await deliveryNoteListResult.filter((deliveryNote) => deliveryNote.delivery_note_status !== "cancelled");

            //if sales order have sales invoice list and delivery note list will can not void document
            if(salesInvoiceListResult.length === 0 && deliveryNoteListResult.length ===0){

                //void sales order document
                const result = await salesOrderModel.updateByDocumentId(req.params.document_id, {sales_order_status: "cancelled"}, req.user);

                //create project activity
                if(salesOrderResult.billing_info){
                    await addDocumentActivity(
                        salesOrderResult.billing_info.project_id, 
                        salesOrderResult.sales_order_id, 
                        documentName, 
                        salesOrderResult.sales_order_document_id, 
                        documentCategory, 
                        "ยกเลิก", 
                        req.user);
                }

                //if this sales order have quotation document id will check it's have any sales order it have same quotation document id
                if(salesOrderResult.quotation_document_id !== null && salesOrderResult.quotation_document_id !== ""){
                    let salesOrderListResult = await salesOrderModel.getByQuotationDocumentId(salesOrderResult.quotation_document_id);
                    salesOrderListResult = await salesOrderListResult.filter((so) => so.sales_order_status !== "cancelled");

                    //if don't have other sales order it have same quotion id will change quotation status to closed and stage to quotation
                    if(salesOrderListResult.length === 0){
                        await quotationModel.updateByDocumentId(salesOrderResult.quotation_document_id, {quotation_status: "closed", quotation_stage: "quotation"}, req.user);
                    }
                }

                await mysql.commit();
                await mysql.release();
                return res.send({
                    status: "success",
                    data: result
                });
            }else{
                throw new Error('กรุณายกเลิกเอกสารที่เกี่ยวข้อง');
            }
        }else{
            throw new Error('ไม่พบเอกสาร');
        }
    }catch(error){
        await mysql.rollback();
        await mysql.release();
        console.log("Rollback successful");
        console.dir(error, { depth: null });

        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
