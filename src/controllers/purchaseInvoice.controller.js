const db = require("../utils/database");
const fs = require("fs");
const moment = require("moment");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const purchaseInvoiceModel = require("../models/purchaseInvoice.model");
const paymentMadeModel = require("../models/paymentMade.model");
const debitNoteModel = require("../models/debitNote.model");
const combinedPaymentModel = require("../models/combinedPayment.model");

const purchaseInvoiceTemplate = require("../templates/purchaseInvoice");

const calculate = require("../utils/calculate");
const itemValidation = require("../utils/item");
const { genDocumentId } = require("../utils/generate");

const purchaseInvoice = require("../templates/purchaseInvoice");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");
const { validateItemPurchase } = require("../utils/item");

const documentName = ActivityRefTypeEnum.PURCHASE_INVOICE;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await purchaseInvoiceModel.getAll();

        return res.send({
            status: "success",
            data: result.reverse()
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.getByDocumentId = async (req, res) => {
    try {
        const result = await purchaseInvoiceModel.getByDocumentId(req.params.document_id);

        let paymentMadeList = await paymentMadeModel.getByRefTypeAndRefDocumentId("purchase_invoice", result.purchase_invoice_document_id);

        result.payment_made_list = await paymentMadeList.filter((pm) => pm.payment_made_status === 'payment_complete');

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};

exports.getByContactId = async (req, res) => {
    try {
        const result = [];
        const purchaseInvoiceResult = await purchaseInvoiceModel.getByContactId(req.params.contact_id);

        for (let purchaseInvoice of purchaseInvoiceResult) {
            let amountToPay = await calculate.amountToPayOfPurchaseAccount(purchaseInvoice.purchase_invoice_document_id);

            if (amountToPay !== 0) {
                let data = {
                    purchase_invoice_id: purchaseInvoice.purchase_invoice_id,
                    purchase_invoice_document_id: purchaseInvoice.purchase_invoice_document_id,
                    issue_date: purchaseInvoice.purchase_invoice_issue_date,
                    total_amount: purchaseInvoice.total_amount,
                    amount_to_pay: amountToPay,
                };
                result.push(data);
            }
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

exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.purchase_invoice_template_remark_id === undefined || req.body.purchase_invoice_template_remark_id === "") {
        req.body.purchase_invoice_template_remark_id = null;
    }

    if (req.body.purchase_invoice_remark === undefined || req.body.purchase_invoice_remark === "") {
        req.body.purchase_invoice_remark = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    try {
        const newPurchaseInvoiceData = new purchaseInvoiceModel(req.body);
        validateItemPurchase(newPurchaseInvoiceData.purchase_invoice_data);
        const genPIDocumentId = await genDocumentId("PI", "purchase_invoice");
        newPurchaseInvoiceData.purchase_invoice_document_id = genPIDocumentId.document_id;
        newPurchaseInvoiceData.purchase_invoice_status = "draft";

        const purchaseInvoiceCreatedResult = await purchaseInvoiceModel.create(newPurchaseInvoiceData, req.user);

        //add documentId to result data
        purchaseInvoiceCreatedResult.documentId = genPIDocumentId.document_id;

        await addDocumentActivity(
            null,
            purchaseInvoiceCreatedResult.insertId,
            documentName,
            genPIDocumentId.document_id,
            documentCategory,
            "สร้าง",
            req.user);

        return res.send({
            status: "success",
            data: purchaseInvoiceCreatedResult
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
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

    if (req.body.purchase_invoice_template_remark_id === undefined || req.body.purchase_invoice_template_remark_id === "") {
        req.body.purchase_invoice_template_remark_id = null;
    }

    if (req.body.purchase_invoice_remark === undefined || req.body.purchase_invoice_remark === "") {
        req.body.purchase_invoice_remark = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    try {
        if (req.body.purchase_invoice_status === undefined || req.body.purchase_invoice_status === null || req.body.purchase_invoice_status === "") {
            throw new Error(`purchase_invoice_status is not value`);
        }

        const newPurchaseInvoiceData = new purchaseInvoiceModel(req.body);
        itemValidation.validateItemPurchase(newPurchaseInvoiceData.purchase_invoice_data);
        newPurchaseInvoiceData.vendor_info = JSON.stringify(newPurchaseInvoiceData.vendor_info);
        newPurchaseInvoiceData.purchase_invoice_data = JSON.stringify(newPurchaseInvoiceData.purchase_invoice_data);

        if (req.body.purchase_invoice_approveby !== null && req.body.purchase_invoice_approveby !== undefined) {
            newPurchaseInvoiceData.purchase_invoice_approveby = req.body.purchase_invoice_approveby;
        }
        if (req.body.purchase_invoice_approveby_employee !== null && req.body.purchase_invoice_approveby_employee !== undefined) {
            newPurchaseInvoiceData.purchase_invoice_approveby_employee = JSON.stringify(req.body.purchase_invoice_approveby_employee);
        }

        const result = await purchaseInvoiceModel.updateByDocumentId(req.params.document_id, newPurchaseInvoiceData, req.user);

        await addDocumentActivity(
            null,
            req.body.purchase_invoice_id,
            documentName,
            req.body.purchase_invoice_document_id,
            documentCategory,
            "แก้ไข",
            req.user);

        return res.send({
            status: "success",
            data: result
        });
    } catch (error) {
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

    if (req.body.purchase_invoice_template_remark_id === undefined || req.body.purchase_invoice_template_remark_id === "") {
        req.body.purchase_invoice_template_remark_id = null;
    }

    if (req.body.purchase_invoice_remark === undefined || req.body.purchase_invoice_remark === "") {
        req.body.purchase_invoice_remark = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    try {
        req.body.purchase_invoice_status = "wait_approve";

        if (req.body.purchase_invoice_id === undefined) {
            const newPurchaseInvoiceData = new purchaseInvoiceModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseInvoiceData.purchase_invoice_data);
            const genPIDocumentId = await genDocumentId("PI", "purchase_invoice");
            newPurchaseInvoiceData.purchase_invoice_document_id = genPIDocumentId.document_id;

            const result = await purchaseInvoiceModel.create(newPurchaseInvoiceData, req.user);

            //add documentId to result data
            result.documentId = genPIDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPIDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPIDocumentId.document_id,
                documentCategory,
                "รออนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newPurchaseInvoiceData = new purchaseInvoiceModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseInvoiceData.purchase_invoice_data);
            newPurchaseInvoiceData.vendor_info = JSON.stringify(newPurchaseInvoiceData.vendor_info);
            newPurchaseInvoiceData.purchase_invoice_data = JSON.stringify(newPurchaseInvoiceData.purchase_invoice_data);

            const result = await purchaseInvoiceModel.update(req.body.purchase_invoice_id, newPurchaseInvoiceData, req.user);

            await addDocumentActivity(
                null,
                req.body.purchase_invoice_id,
                documentName,
                req.body.purchase_invoice_document_id,
                documentCategory,
                "รออนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.notApprove = async (req, res) => {
    try {
        const purchaseInvoiceUpdatedResult = await purchaseInvoiceModel.updateByDocumentId(req.params.document_id, { purchase_invoice_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null }, req.user);

        const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(req.params.document_id);

        if (purchaseInvoiceResult) {
            await addDocumentActivity(
                null,
                purchaseInvoiceResult.purchase_invoice_id,
                documentName,
                purchaseInvoiceResult.purchase_invoice_document_id,
                documentCategory,
                req.body.not_approve_reason || "ไม่อนุมัติ",
                req.user);
        }

        return res.send({
            status: "success",
            data: purchaseInvoiceUpdatedResult
        });
    } catch (error) {
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

    if (req.body.purchase_invoice_template_remark_id === undefined || req.body.purchase_invoice_template_remark_id === "") {
        req.body.purchase_invoice_template_remark_id = null;
    }

    if (req.body.purchase_invoice_remark === undefined || req.body.purchase_invoice_remark === "") {
        req.body.purchase_invoice_remark = null;
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    try {
        req.body.purchase_invoice_status = "wait_payment";

        /**
         * if purchase invoice has not been created
         * go and create the document
         */
        if (req.body.purchase_invoice_id === undefined) {
            const newPurchaseInvoiceData = new purchaseInvoiceModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseInvoiceData.purchase_invoice_data);
            const genPIDocumentId = await genDocumentId("PI", "purchase_invoice");
            newPurchaseInvoiceData.purchase_invoice_document_id = genPIDocumentId.document_id;
            newPurchaseInvoiceData.purchase_invoice_approveby = req.user.employee_id;
            newPurchaseInvoiceData.purchase_invoice_approveby_employee = JSON.stringify(req.user.employee_id);

            const result = await purchaseInvoiceModel.create(newPurchaseInvoiceData, req.user);

            //add documentId to result data
            result.documentId = genPIDocumentId.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPIDocumentId.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genPIDocumentId.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newPurchaseInvoiceData = new purchaseInvoiceModel(req.body);
            itemValidation.validateItemPurchase(newPurchaseInvoiceData.purchase_invoice_data);
            newPurchaseInvoiceData.vendor_info = JSON.stringify(newPurchaseInvoiceData.vendor_info);
            newPurchaseInvoiceData.purchase_invoice_data = JSON.stringify(newPurchaseInvoiceData.purchase_invoice_data);
            newPurchaseInvoiceData.purchase_invoice_approveby = req.user.employee_id;
            newPurchaseInvoiceData.purchase_invoice_approveby_employee = JSON.stringify(req.user.employee_id);

            const result = await purchaseInvoiceModel.update(req.body.purchase_invoice_id, newPurchaseInvoiceData, req.user);

            result.documentId = req.body.purchase_invoice_document_id;

            await addDocumentActivity(
                null,
                req.body.purchase_invoice_id,
                documentName,
                req.body.purchase_invoice_document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        }

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.copyDocument = async (req, res) => {
    try {
        const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(req.params.document_id);

        if (purchaseInvoiceResult !== undefined) {
            let result = {
                purchase_order_document_id: purchaseInvoiceResult.purchase_order_document_id,
                vendor_info: purchaseInvoiceResult.vendor_info,
                external_ref_document_id: purchaseInvoiceResult.external_ref_document_id,
                purchase_invoice_data: purchaseInvoiceResult.purchase_invoice_data,
                purchase_invoice_template_remark_id: purchaseInvoiceResult.purchase_invoice_template_remark_id,
                purchase_invoice_remark: purchaseInvoiceResult.purchase_invoice_remark,
                inventory_target: purchaseInvoiceResult.inventory_target,
                additional_discount: purchaseInvoiceResult.additional_discount,
                vat_exempted_amount: purchaseInvoiceResult.vat_exempted_amount,
                vat_0_amount: purchaseInvoiceResult.vat_0_amount,
                vat_7_amount: purchaseInvoiceResult.vat_7_amount,
                vat_amount: purchaseInvoiceResult.vat_amount,
                net_amount: purchaseInvoiceResult.net_amount,
                withholding_tax: purchaseInvoiceResult.withholding_tax,
                total_amount: purchaseInvoiceResult.total_amount
            };

            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }
    } catch (error) {
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(
            req.params.document_id
        );

        if (purchaseInvoiceResult !== undefined) {
            purchaseInvoiceResult.purchase_invoice_issue_date = moment(purchaseInvoiceResult.purchase_invoice_issue_date).format("DD/MM/YYYY");
            purchaseInvoiceResult.purchase_invoice_due_date = moment(purchaseInvoiceResult.purchase_invoice_due_date).format("DD/MM/YYYY");
            const pdf_name = `${purchaseInvoiceResult.purchase_invoice_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                purchaseInvoiceTemplate(purchaseInvoiceResult),
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

exports.generatePaymentMadeData = async (req, res) => {
    try {
        const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(req.params.document_id);
        if (purchaseInvoiceResult !== undefined) {

            let amountToPay = await calculate.amountToPayOfPurchaseAccount(purchaseInvoiceResult.purchase_invoice_document_id);

            let result = {
                ref_type: "purchase_invoice",
                ref_document_id: purchaseInvoiceResult.purchase_invoice_document_id,
                vendor_info: purchaseInvoiceResult.vendor_info,
                payment_made_data: [
                    {
                        document_id: purchaseInvoiceResult.purchase_invoice_document_id,
                        issue_date: purchaseInvoiceResult.purchase_invoice_issue_date,
                        due_date: purchaseInvoiceResult.purchase_invoice_due_date,
                        total_amount: purchaseInvoiceResult.total_amount,
                        amount_to_pay: amountToPay,
                        // received_amount: 0 tempolarly comment
                        received_amount: amountToPay
                    }
                ],
                withholding_tax: calculate.withHoldingTaxPurchaseInvoice(purchaseInvoiceResult)
            };
            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร ${req.params.purchase_invoice_document_id}`);
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.delete = async (req, res) => {
    try {
        const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(req.params.document_id);

        if (purchaseInvoiceResult !== undefined) {

            let debitNoteListResult = await debitNoteModel.getAllByPurchaseInvoiceDocumentId(purchaseInvoiceResult.purchase_invoice_document_id);
            debitNoteListResult = await debitNoteListResult.filter((dn) => dn.debit_note_status !== "cancelled");

            let combinedPaymentListResult = await combinedPaymentModel.getByPurchaseInvoiceDocumentId(purchaseInvoiceResult.purchase_invoice_document_id);
            combinedPaymentListResult = await combinedPaymentListResult.filter((bnx) => bnx.combined_payment_status !== "cancelled");

            let paymentMadeListResult = await paymentMadeModel.getByRefTypeAndRefDocumentId("purchase_invoice", purchaseInvoiceResult.purchase_invoice_document_id);
            paymentMadeListResult = await paymentMadeListResult.filter((pm) => pm.payment_made_status !== "cancelled");

            //if have combined payment and payment made can not void document

            if (paymentMadeListResult.length === 0 && combinedPaymentListResult.length === 0 && debitNoteListResult.length === 0) {
                const result = await purchaseInvoiceModel.updateByDocumentId(req.params.document_id, { purchase_invoice_status: "cancelled" }, req.user);

                if (purchaseInvoiceResult) {
                    await addDocumentActivity(
                        null,
                        purchaseInvoiceResult.purchase_invoice_id,
                        documentName,
                        purchaseInvoiceResult.purchase_invoice_document_id,
                        documentCategory,
                        "ยกเลิก",
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result
                });

            } else {
                throw new Error(`กรุณายกเลิกเอกสารที่เกี่ยวข้องก่อน`);
            }
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }

    } catch (error) {
        return res.status(400).send({
            status: "success",
            message: `${error}`
        });
    }
};