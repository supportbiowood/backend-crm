const moment = require("moment");
const db = require("../utils/database");
const fs = require("fs");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const combinedPaymentModel = require("../models/combinedPayment.model");
const purchaseInvoiceModel = require("../models/purchaseInvoice.model");
const paymentMadeModel = require("../models/paymentMade.model");

const { genDocumentId } = require("../utils/generate");
const calculate = require("../utils/calculate");

const combinedPaymentTemplate = require("../templates/combinedPayment");

const { addDocumentActivity } = require("../utils/activity");
const { ActivityRefTypeEnum, ActivityDocumentCategory } = require("../enums/activityEnum");

const documentName = ActivityRefTypeEnum.COMBINED_PAYMENT;
const documentCategory = ActivityDocumentCategory.PURCHASES_ACCOUNT;

exports.getAll = async (req, res) => {
    try {
        const result = await combinedPaymentModel.getAll();

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
exports.getByDocumentId = async (req, res) => {
    try {
        const result = await combinedPaymentModel.getByDocumentId(req.params.document_id);

        let paymentMadeList = await paymentMadeModel.getByRefTypeAndRefDocumentId("combined_payment", result.combined_payment_document_id);
        result.payment_made_list = await paymentMadeList.filter((pm) => pm.payment_made_status === "payment_complete");

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
exports.getPurchaseInvoiceList = async (req, res) => {
    try {
        let purchaseInvoiceListResult = await purchaseInvoiceModel.getByContactId(req.params.contact_id);
        purchaseInvoiceListResult = await purchaseInvoiceListResult.filter((pi) => pi.purchase_invoice_status === "wait_payment" || pi.purchase_invoice_status === "partial_payment");
        let result = [];

        for (let purchaseInvoice of purchaseInvoiceListResult) {
            let amountToPay = await calculate.amountToPayOfPurchaseAccount(purchaseInvoice.purchase_invoice_document_id);
            if (amountToPay !== 0) {
                let data = {
                    purchase_invoice: purchaseInvoice,
                    combined_payment_data: {
                        document_id: purchaseInvoice.purchase_invoice_document_id,
                        issue_date: purchaseInvoice.purchase_invoice_issue_date,
                        due_date: purchaseInvoice.purchase_invoice_due_date,
                        total_amount: purchaseInvoice.total_amount,
                        paid_amount: purchaseInvoice.total_amount - amountToPay,
                        billing_amount: amountToPay
                    }
                };
                result.push(data);
            }
        }

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
exports.create = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.combined_payment_template_remark_id === undefined || req.body.combined_payment_template_remark_id === "") {
        req.body.combined_payment_template_remark_id = null;
    }

    if (req.body.combined_payment_remark === undefined || req.body.combined_payment_remark === "") {
        req.body.combined_payment_remark = null;
    }

    try {
        const newCombinedPaymentData = new combinedPaymentModel(req.body);
        const genBNXDocumentIdResult = await genDocumentId("BNX", "combined_payment");
        newCombinedPaymentData.combined_payment_document_id = genBNXDocumentIdResult.document_id;
        newCombinedPaymentData.combined_payment_status = "draft";

        const result = await combinedPaymentModel.create(newCombinedPaymentData, req.user);

        //add documentId to result data
        result.documentId = genBNXDocumentIdResult.document_id;

        await addDocumentActivity(
            null,
            result.insertId,
            documentName,
            genBNXDocumentIdResult.document_id,
            documentCategory,
            "สร้าง",
            req.user);
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
exports.update = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.combined_payment_template_remark_id === undefined || req.body.combined_payment_template_remark_id === "") {
        req.body.combined_payment_template_remark_id = null;
    }

    if (req.body.combined_payment_remark === undefined || req.body.combined_payment_remark === "") {
        req.body.combined_payment_remark = null;
    }

    try {
        if (req.body.combined_payment_status === undefined || req.body.combined_payment_status === null || req.body.combined_payment_status === "") {
            throw new Error(`combined_payment_status is not value`);
        }

        const newCombinedPaymentData = new combinedPaymentModel(req.body);
        newCombinedPaymentData.vendor_info = JSON.stringify(newCombinedPaymentData.vendor_info);
        newCombinedPaymentData.document_list = JSON.stringify(newCombinedPaymentData.document_list);

        if (req.body.combined_payment_approveby !== null && req.body.combined_payment_approveby !== undefined) {
            newCombinedPaymentData.combined_payment_approveby = req.body.combined_payment_approveby;
        }
        if (req.body.combined_payment_approveby_employee !== null && req.body.combined_payment_approveby_employee !== undefined) {
            newCombinedPaymentData.combined_payment_approveby_employee = JSON.stringify(req.body.combined_payment_approveby_employee);
        }

        const result = await combinedPaymentModel.updateByDocumentId(req.params.document_id, newCombinedPaymentData, req.user);

        await addDocumentActivity(
            null,
            req.body.combined_payment_id,
            documentName,
            req.body.combined_payment_document_id,
            documentCategory,
            "แก้ไข",
            req.user);
        return res.send({
            status: "success",
            data: result
        });

    } catch (error) {
        return res.status(400).send({
            status: 'error',
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

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.combined_payment_template_remark_id === undefined || req.body.combined_payment_template_remark_id === "") {
        req.body.combined_payment_template_remark_id = null;
    }

    if (req.body.combined_payment_remark === undefined || req.body.combined_payment_remark === "") {
        req.body.combined_payment_remark = null;
    }

    try {
        req.body.combined_payment_status = "wait_approve";

        if (req.body.combined_payment_id === undefined) {
            const newCombinedPaymentData = new combinedPaymentModel(req.body);
            const genBNXDocumentIdResult = await genDocumentId("BNX", "combined_payment");
            newCombinedPaymentData.combined_payment_document_id = genBNXDocumentIdResult.document_id;

            const result = await combinedPaymentModel.create(newCombinedPaymentData, req.user);

            //add documentId to result data
            result.documentId = genBNXDocumentIdResult.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genBNXDocumentIdResult.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genBNXDocumentIdResult.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newCombinedPaymentData = new combinedPaymentModel(req.body);
            newCombinedPaymentData.vendor_info = JSON.stringify(newCombinedPaymentData.vendor_info);
            newCombinedPaymentData.document_list = JSON.stringify(newCombinedPaymentData.document_list);

            const result = await combinedPaymentModel.update(req.body.combined_payment_id, newCombinedPaymentData, req.user);

            await addDocumentActivity(
                null,
                req.body.combined_payment_id,
                documentName,
                req.body.combined_payment_document_id,
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
exports.notApprove = async (req, res) => {
    try {
        const result = await combinedPaymentModel.updateByDocumentId(req.params.document_id, { combined_payment_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null }, req.user);

        const combinedPaymentResult = await combinedPaymentModel.getByDocumentId(req.params.document_id);

        if (combinedPaymentResult) {
            await addDocumentActivity(
                null,
                combinedPaymentResult.combined_payment_id,
                documentName,
                combinedPaymentResult.combined_payment_document_id,
                documentCategory,
                req.body.not_approve_reason || "ไม่อนุมัติ",
                req.user);
        }

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
exports.approve = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    if (req.body.external_ref_document_id === undefined || req.body.external_ref_document_id === "") {
        req.body.external_ref_document_id = null;
    }

    if (req.body.combined_payment_template_remark_id === undefined || req.body.combined_payment_template_remark_id === "") {
        req.body.combined_payment_template_remark_id = null;
    }

    if (req.body.combined_payment_remark === undefined || req.body.combined_payment_remark === "") {
        req.body.combined_payment_remark = null;
    }

    try {
        req.body.combined_payment_status = "wait_payment";

        if (req.body.combined_payment_id === undefined) {
            const newCombinedPaymentData = new combinedPaymentModel(req.body);
            const genBNXDocumentIdResult = await genDocumentId("BNX", "combined_payment");
            newCombinedPaymentData.combined_payment_document_id = genBNXDocumentIdResult.document_id;
            newCombinedPaymentData.combined_payment_approveby = req.user.employee_id;
            newCombinedPaymentData.combined_payment_approveby_employee = JSON.stringify(req.user);

            const result = await combinedPaymentModel.create(newCombinedPaymentData, req.user);

            //add documentId to result data
            result.documentId = genBNXDocumentIdResult.document_id;

            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genBNXDocumentIdResult.document_id,
                documentCategory,
                "สร้าง",
                req.user);
            await addDocumentActivity(
                null,
                result.insertId,
                documentName,
                genBNXDocumentIdResult.document_id,
                documentCategory,
                "อนุมัติ",
                req.user);

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newCombinedPaymentData = new combinedPaymentModel(req.body);
            newCombinedPaymentData.vendor_info = JSON.stringify(newCombinedPaymentData.vendor_info);
            newCombinedPaymentData.document_list = JSON.stringify(newCombinedPaymentData.document_list);
            newCombinedPaymentData.combined_payment_approveby = req.user.employee_id;
            newCombinedPaymentData.combined_payment_approveby_employee = JSON.stringify(req.user);

            const result = await combinedPaymentModel.update(req.body.combined_payment_id, newCombinedPaymentData, req.user);

            await addDocumentActivity(
                null,
                req.body.combined_payment_id,
                documentName,
                req.body.combined_payment_document_id,
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
exports.generatePaymentMadeData = async (req, res) => {
    try {
        const combinedPaymentResult = await combinedPaymentModel.getByDocumentId(req.params.document_id);

        if (combinedPaymentResult !== undefined) {
            let withHoldingTaxList = [];
            for (let piDocument of combinedPaymentResult.document_list) {
                piDocument.received_amount = piDocument.billing_amount;
                withHoldingTaxList.push(
                    calculate.withHoldingTaxPurchaseInvoice(
                        await purchaseInvoiceModel.getByDocumentId(piDocument.document_id)));
                delete piDocument["billing_amount"];
            }
            let withHoldingTaxType = calculate.mergeWithHoldingTaxType(withHoldingTaxList);
            let withHoldingTax;
            if (!withHoldingTaxType || withHoldingTaxType === null) {
                withHoldingTax = null;
            } else {
                withHoldingTax = { tax: withHoldingTaxType, withholding_tax_amount: combinedPaymentResult.withholding_tax };
            }
            let result = {
                ref_type: "combined_payment",
                ref_document_id: combinedPaymentResult.combined_payment_document_id,
                vendor_info: combinedPaymentResult.vendor_info,
                payment_made_data: combinedPaymentResult.document_list,
                total_amount: combinedPaymentResult.total_amount,
                withholding_tax: withHoldingTax
            };

            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร ${req.params.combined_payment_document_id}`);
        }
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const combinedPaymentResult = await combinedPaymentModel.getByDocumentId(req.params.document_id);

        if (combinedPaymentResult !== undefined) {
            combinedPaymentResult.combined_payment_issue_date = moment(combinedPaymentResult.combined_payment_issue_date).format("DD/MM/YYYY");
            combinedPaymentResult.combined_payment_due_date = moment(combinedPaymentResult.combined_payment_due_date).format("DD/MM/YYYY");

            const pdf_name = `${combinedPaymentResult.combined_payment_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(combinedPaymentTemplate(combinedPaymentResult), {
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
        const combinedPaymentResult = await combinedPaymentModel.getByDocumentId(req.params.document_id);

        if (combinedPaymentResult !== undefined) {

            let paymentMadeListResult = await paymentMadeModel.getByRefTypeAndRefDocumentId("combined_payment", combinedPaymentResult.combined_payment_document_id);

            //filter paymentMade only status is not cancelled
            paymentMadeListResult = await paymentMadeListResult.filter((pm) => pm.payment_made_status !== 'cancelled');

            if (paymentMadeListResult.length === 0) {
                const result = await combinedPaymentModel.updateByDocumentId(req.params.document_id, { combined_payment_status: "cancelled" }, req.user);

                if (combinedPaymentResult) {
                    await addDocumentActivity(
                        null,
                        combinedPaymentResult.purchase_invoice_id,
                        documentName,
                        combinedPaymentResult.purchase_invoice_document_id,
                        documentCategory,
                        "ยกเลิก",
                        req.user);
                }

                return res.send({
                    status: "success",
                    data: result
                });
            } else {
                throw new Error(`กรุณาลบเอกสารที่เกี่ยวข้องก่อน`);
            }
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }

    } catch (error) {
        return res.status(400).send({
            status: 'error',
            message: `${error}`
        });
    }
};