const moment = require("moment");
const db = require("../utils/database");

const fs = require("fs");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const billingNoteModel = require("../models/billingNote.model");
const runningDocumentIdModel = require("../models/runningDocumentId.model");
const salesInvoiceModel = require("../models/salesInvoice.model");
const paymentReceiptModel = require("../models/paymentReceipt.model");

const calculate = require("../utils/calculate");
const { genDocumentId } = require("../utils/generate");

const billingNoteTemplate = require("../templates/billingNote");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.BILLING_NOTE;
const documentCategory = ActivityDocumentCategory.SALES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await billingNoteModel.getAll();

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
exports.getById = async (req, res) => {
    try {
        const result = await billingNoteModel.getByDocumentId(req.params.document_id);

        let paymentReceiptList = await paymentReceiptModel.getByRefTypeAndRefDocumentId("billing_note", result.billing_note_document_id) || [];
        result.payment_receipt_list = await paymentReceiptList.filter((rt) => rt.payment_receipt_status !== 'cancelled');

        let salesInvoices = [];

        for (let siDocId of result.sales_invoice_document_id_list) {
            let si = await salesInvoiceModel.getByDocumentId(siDocId);
            if (si) {
                salesInvoices.push(si);
            }
        }

        result.sales_invoices = salesInvoices;

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

exports.getSalesInvoice = async (req, res) => {
    try {
        const salesInvoiceResultList = await salesInvoiceModel.getByContactId(
            req.params.contact_id
        );

        let result = [];
        for (let salesInvoice of salesInvoiceResultList) {
            let amountToPay = await calculate.amountToPayOfSalesAccount(salesInvoice.sales_invoice_document_id);
            if (salesInvoice.total_amount - amountToPay < salesInvoice.total_amount) {
                let resultPrep = {
                    sales_invoice: salesInvoice,
                    billing_note_data: {
                        document_id: salesInvoice.sales_invoice_document_id,
                        issue_date: salesInvoice.sales_invoice_issue_date,
                        due_date: salesInvoice.sales_invoice_due_date,
                        total_amount: salesInvoice.total_amount,
                        paid_amount: salesInvoice.total_amount - amountToPay,
                        billing_amount: amountToPay
                    }
                };
                result.push(resultPrep);
            }
        }

        return res.send({
            status: "success",
            data: result
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
        req.body.billing_note_template_remark_id === undefined ||
        req.body.billing_note_template_remark_id === ""
    ) {
        req.body.billing_note_template_remark_id = null;
    }

    if (
        req.body.billing_note_remark === undefined ||
        req.body.billing_note_remark === ""
    ) {
        req.body.billing_note_remark = null;
    }

    try {
        const newBillingNoteData = new billingNoteModel(req.body);
        const genDocumentIdResult = await genDocumentId("BN", "billing_note");
        newBillingNoteData.billing_note_document_id = genDocumentIdResult.document_id;
        newBillingNoteData.billing_note_status = "draft";
        newBillingNoteData.sales_invoice_document_id_list = JSON.stringify(newBillingNoteData.sales_invoice_document_id_list);
        newBillingNoteData.sales_invoice_project_list = JSON.stringify(newBillingNoteData.sales_invoice_project_list);

        const result = await billingNoteModel.create(newBillingNoteData, req.user);

        //add documentId to result data
        result.documentId = genDocumentIdResult.document_id;

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                result.insertId,
                documentName,
                genDocumentIdResult.document_id,
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
    try {
        if (req.body.billing_note_status === undefined || req.body.billing_note_status === null || req.body.billing_note_status === "") {
            throw new Error(`billing_note_status is not value`);
        }

        const newBillingNoteData = new billingNoteModel(req.body);
        newBillingNoteData.billing_info = JSON.stringify(newBillingNoteData.billing_info);
        newBillingNoteData.document_list = JSON.stringify(newBillingNoteData.document_list);
        newBillingNoteData.sales_invoice_document_id_list = JSON.stringify(newBillingNoteData.sales_invoice_document_id_list);
        newBillingNoteData.sales_invoice_project_list = JSON.stringify(newBillingNoteData.sales_invoice_project_list);


        if (req.body.billing_note_approveby !== null && req.body.billing_note_approveby !== undefined) {
            newBillingNoteData.billing_note_approveby = req.body.billing_note_approveby;
        }
        if (req.body.billing_note_approveby_employee !== null && req.body.billing_note_approveby_employee !== undefined) {
            newBillingNoteData.billing_note_approveby_employee = JSON.stringify(req.body.billing_note_approveby_employee);
        }

        const result = await billingNoteModel.updateByDocumentId(req.params.document_id, newBillingNoteData, req.user);

        //create project activity
        if (req.body.billing_info) {
            await addDocumentActivity(
                req.body.billing_info.project_id,
                req.body.billing_note_id,
                documentName,
                req.body.billing_note_document_id,
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

    try {
        if (req.body.billing_note_id !== undefined) {
            const newBillingNoteData = new billingNoteModel(req.body);
            newBillingNoteData.billing_note_status = "wait_approve";
            newBillingNoteData.billing_info = JSON.stringify(newBillingNoteData.billing_info);
            newBillingNoteData.document_list = JSON.stringify(newBillingNoteData.document_list);
            newBillingNoteData.sales_invoice_document_id_list = JSON.stringify(newBillingNoteData.sales_invoice_document_id_list);
            newBillingNoteData.sales_invoice_project_list = JSON.stringify(newBillingNoteData.sales_invoice_project_list);

            const result = await billingNoteModel.update(req.body.billing_note_id, newBillingNoteData, req.user);

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.billing_note_id,
                    documentName,
                    req.body.billing_note_document_id,
                    documentCategory,
                    "รออนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        } else {
            if (req.body.billing_note_template_remark_id === undefined || req.body.billing_note_template_remark_id === "") {
                req.body.billing_note_template_remark_id = null;
            }

            if (req.body.billing_note_remark === undefined || req.body.billing_note_remark === "") {
                req.body.billing_note_remark = null;
            }

            const newBillingNoteData = new billingNoteModel(req.body);
            const genDocumentIdResult = await genDocumentId("BN", "billing_note");
            newBillingNoteData.billing_note_document_id = genDocumentIdResult.document_id;
            newBillingNoteData.billing_note_status = "wait_approve";
            newBillingNoteData.sales_invoice_document_id_list = JSON.stringify(newBillingNoteData.sales_invoice_document_id_list);
            newBillingNoteData.sales_invoice_project_list = JSON.stringify(newBillingNoteData.sales_invoice_project_list);


            const result = await billingNoteModel.create(newBillingNoteData, req.user);

            //add documentId to result data
            result.documentId = genDocumentIdResult.document_id;

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "รออนุมัติ",
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
exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    try {
        if (req.body.billing_note_id !== undefined) {
            const newBillingNoteData = new billingNoteModel(req.body);
            newBillingNoteData.billing_note_status = "wait_payment";
            newBillingNoteData.billing_info = JSON.stringify(
                newBillingNoteData.billing_info
            );
            newBillingNoteData.document_list = JSON.stringify(
                newBillingNoteData.document_list
            );
            newBillingNoteData.sales_invoice_document_id_list = JSON.stringify(
                newBillingNoteData.sales_invoice_document_id_list
            );
            newBillingNoteData.sales_invoice_project_list = JSON.stringify(
                newBillingNoteData.sales_invoice_project_list
            );

            const result = await billingNoteModel.update(req.body.billing_note_id, newBillingNoteData, req.user);

            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    req.body.billing_note_id,
                    documentName,
                    req.body.billing_note_document_id,
                    documentCategory,
                    "อนุมัติ",
                    req.user);
            }

            return res.send({
                status: "success",
                data: result,
            });
        } else {
            if (
                req.body.billing_note_template_remark_id === undefined ||
                req.body.billing_note_template_remark_id === ""
            ) {
                req.body.billing_note_template_remark_id = null;
            }

            if (
                req.body.billing_note_remark === undefined ||
                req.body.billing_note_remark === ""
            ) {
                req.body.billing_note_remark = null;
            }

            const newBillingNoteData = new billingNoteModel(req.body);
            const genDocumentIdResult = await genDocumentId("BN", "billing_note");
            newBillingNoteData.billing_note_document_id = genDocumentIdResult.document_id;
            newBillingNoteData.billing_note_status = "wait_payment";
            newBillingNoteData.sales_invoice_document_id_list = JSON.stringify(newBillingNoteData.sales_invoice_document_id_list);
            newBillingNoteData.sales_invoice_project_list = JSON.stringify(newBillingNoteData.sales_invoice_project_list);

            const result = await billingNoteModel.create(newBillingNoteData, req.user);

            //add documentId to result data
            result.documentId = genDocumentIdResult.document_id;

            //create project activity
            if (req.body.billing_info) {
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "สร้าง",
                    req.user);
                await addDocumentActivity(
                    req.body.billing_info.project_id,
                    result.insertId,
                    documentName,
                    genDocumentIdResult.document_id,
                    documentCategory,
                    "อนุมัติ",
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
        const result = await billingNoteModel.updateByDocumentId(req.params.document_id, { billing_note_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null }, req.user);

        const billingNoteResult = await billingNoteModel.getByDocumentId(req.params.document_id);

        //create project activity
        if (billingNoteResult.billing_info) {
            await addDocumentActivity(
                billingNoteResult.billing_info.project_id,
                billingNoteResult.billing_note_id,
                documentName,
                billingNoteResult.billing_note_document_id,
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

exports.generatePaymentReceiptData = async (req, res) => {
    try {
        const billingNoteResult = await billingNoteModel.getByDocumentId(req.params.document_id);

        if (billingNoteResult !== undefined) {
            let withHoldingTaxList = [];
            for (let siDocument of billingNoteResult.document_list) {
                siDocument.received_amount = siDocument.billing_amount;
                let salesInvoiceResult = await salesInvoiceModel.getByDocumentId(siDocument.document_id);
                withHoldingTaxList.push(
                    calculate.withHoldingTaxSaleInvoice(salesInvoiceResult));
                delete siDocument["billing_amount"];
            }
            let withHoldingTaxType = calculate.mergeWithHoldingTaxType(withHoldingTaxList);
            let withHoldingTax;
            if (!withHoldingTaxType || withHoldingTaxType === null) {
                withHoldingTax = null;
            } else {
                withHoldingTax = { tax: withHoldingTaxType, withholding_tax_amount: billingNoteResult.withholding_tax };
            }

            let result = {
                payment_receipt_document_id: null,
                ref_type: "billing_note",
                ref_document_id: billingNoteResult.billing_note_document_id,
                billing_info: billingNoteResult.billing_info,
                payment_receipt_data: billingNoteResult.document_list,
                total_amount: billingNoteResult.total_amount,
                withholding_tax: withHoldingTax
            };
            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร ${req.params.billing_note_document_id}`);
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
        const billingNoteResult = await billingNoteModel.getByDocumentId(req.params.document_id);

        if (billingNoteResult !== undefined) {
            billingNoteResult.billing_note_issude_date = moment(
                billingNoteResult.billing_note_issude_date
            ).format("DD/MM/YYYY");
            billingNoteResult.billing_note_due_date = moment(
                billingNoteResult.billing_note_due_date
            ).format("DD/MM/YYYY");

            const pdf_name = `${billingNoteResult.billing_note_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(billingNoteTemplate(billingNoteResult), {
                format: "A4",
                directory: ".",
                filename: pdf_path,
            });

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

exports.delete = async (req, res) => {
    try {
        const billingNoteResult = await billingNoteModel.getByDocumentId(req.params.document_id);

        if (billingNoteResult !== undefined) {

            let paymentReceiptListResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("billing_note", billingNoteResult.billing_note_document_id);
            paymentReceiptListResult = await paymentReceiptListResult.filter((rt) => rt.payment_receipt_status === "partial_payment" && rt.payment_receipt_status === "wait_payment");

            //if billing note have payment receipt will can not void document
            if (paymentReceiptListResult.length === 0) {

                const result = await billingNoteModel.updateByDocumentId(req.params.document_id, { billing_note_status: "cancelled" }, req.user);

                //create project activity
                if (billingNoteResult.billing_info) {
                    await addDocumentActivity(
                        billingNoteResult.billing_info.project_id,
                        billingNoteResult.billing_note_id,
                        documentName,
                        billingNoteResult.billing_note_document_id,
                        documentCategory,
                        "ยกเลิก",
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result,
                });
            }
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
