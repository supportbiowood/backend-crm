const moment = require("moment");
const db = require("../utils/database");
const fs = require("fs");
const Promise = require("bluebird");
const pdf = Promise.promisifyAll(require("html-pdf"));

const expensesModel = require("../models/expenses.model");
const paymentMadeModel = require("../models/paymentMade.model");
const paymentChannelModel = require("../models/paymentChannel.model");

const { genDocumentId } = require("../utils/generate");

const expensesTemplate = require("../templates/expenses");

exports.getAll = async (req, res) => {
    try {
        const result = await expensesModel.getAll();

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
        const result = await expensesModel.getByDocumentId(req.params.document_id);

        let paymentMadeList = await paymentMadeModel.getByRefTypeAndRefDocumentId("expenses", result.expenses_document_id);

        paymentMadeList = await paymentMadeList.filter((pm) => pm.payment_made_status === "payment_complete");

        if (paymentMadeList.length !== 0) {
            for (let paymentMade of paymentMadeList) {
                if (paymentMade.payment_channel_id !== null) {
                    let paymentChannelResult = await paymentChannelModel.getById(paymentMade.payment_channel_id);

                    paymentMade.payment_channel_type = paymentChannelResult.payment_channel_type;
                    paymentMade.payment_channel_info = paymentChannelResult.payment_channel_info;
                } else {
                    paymentMade.payment_channel_type = null;
                    paymentMade.payment_channel_info = null;
                }
            }
        }

        result.payment_made_list = paymentMadeList;
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

    if (req.body.expenses_remark_template_id === undefined || req.body.expenses_remark_template_id === "") {
        req.body.expenses_remark_template_id = null;
    }

    if (req.body.expenses_remark === undefined || req.body.expenses_remark === "") {
        req.body.expenses_remark = null;
    }

    try {
        const newExpensesData = new expensesModel(req.body);
        const genEXPDocumentIdResult = await genDocumentId("EXP", "expenses");
        newExpensesData.expenses_document_id = genEXPDocumentIdResult.document_id;
        newExpensesData.expenses_status = "draft";

        const result = await expensesModel.create(newExpensesData, req.user);

        //add documentId to result data
        result.documentId = genEXPDocumentIdResult.document_id;

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

    if (req.body.expenses_remark_template_id === undefined || req.body.expenses_remark_template_id === "") {
        req.body.expenses_remark_template_id = null;
    }

    if (req.body.expenses_remark === undefined || req.body.expenses_remark === "") {
        req.body.expenses_remark = null;
    }

    try {
        if (req.body.expenses_status === undefined || req.body.expenses_status === null || req.body.expenses_status === "") {
            throw new Error(`expenses_status is not value`);
        }

        const newExpensesData = new expensesModel(req.body);
        newExpensesData.vendor_info = JSON.stringify(newExpensesData.vendor_info);
        newExpensesData.expenses_data = JSON.stringify(newExpensesData.expenses_data);

        const result = await expensesModel.updateByDocumentId(req.params.document_id, newExpensesData, req.user);

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

    if (req.body.expenses_remark_template_id === undefined || req.body.expenses_remark_template_id === "") {
        req.body.expenses_remark_template_id = null;
    }

    if (req.body.expenses_remark === undefined || req.body.expenses_remark === "") {
        req.body.expenses_remark = null;
    }

    try {
        req.body.expenses_status = "wait_approve";

        if (req.body.expenses_id === undefined) {
            const newExpensesData = new expensesModel(req.body);
            const genEXPDocumentIdResult = await genDocumentId("EXP", "expenses");
            newExpensesData.expenses_document_id = genEXPDocumentIdResult.document_id;

            const result = await expensesModel.create(newExpensesData, req.user);

            //add documentId to result data
            result.documentId = genEXPDocumentIdResult.document_id;

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newExpensesData = new expensesModel(req.body);
            newExpensesData.vendor_info = JSON.stringify(newExpensesData.vendor_info);
            newExpensesData.expenses_data = JSON.stringify(newExpensesData.expenses_data);

            const result = await expensesModel.update(req.body.expenses_id, newExpensesData, req.user);

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
        const result = await expensesModel.updateByDocumentId(req.params.document_id, { expenses_status: "not_approve", not_approve_reason: req.body.not_approve_reason || null }, req.user);

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

    if (req.body.expenses_remark_template_id === undefined || req.body.expenses_remark_template_id === "") {
        req.body.expenses_remark_template_id = null;
    }

    if (req.body.expenses_remark === undefined || req.body.expenses_remark === "") {
        req.body.expenses_remark = null;
    }

    try {
        req.body.expenses_status = "wait_payment";

        if (req.body.expenses_id === undefined) {
            const newExpensesData = new expensesModel(req.body);
            const genEXPDocumentIdResult = await genDocumentId("EXP", "expenses");
            newExpensesData.expenses_document_id = genEXPDocumentIdResult.document_id;
            newExpensesData.expenses_approveby = req.user.employee_id;
            newExpensesData.expenses_approveby_employee = JSON.stringify(req.user);

            const result = await expensesModel.create(newExpensesData, req.user);

            //add documentId to result data
            result.documentId = genEXPDocumentIdResult.document_id;

            return res.send({
                status: "success",
                data: result
            });
        } else {
            const newExpensesData = new expensesModel(req.body);
            newExpensesData.vendor_info = JSON.stringify(newExpensesData.vendor_info);
            newExpensesData.expenses_data = JSON.stringify(newExpensesData.expenses_data);
            newExpensesData.expenses_approveby = req.user.employee_id;
            newExpensesData.expenses_approveby_employee = JSON.stringify(req.user);

            const result = await expensesModel.update(req.body.expenses_id, newExpensesData, req.user);

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
        const expensesResult = await expensesModel.getByDocumentId(req.params.document_id);

        if (expensesResult !== undefined) {
            let result = {
                external_ref_document_id: expensesResult.external_ref_document_id,
                inventory_target: expensesResult.inventory_target,
                vendor_info: expensesResult.vendor_info,
                expenses_data: expensesResult.expenses_data,
                expenses_remark_template_id: expensesResult.expenses_remark_template_id,
                expenses_remark: expensesResult.expenses_remark,
                additional_discount: expensesResult.additional_discount,
                vat_exempted_amount: expensesResult.vat_exempted_amount,
                vat_0_amount: expensesResult.vat_0_amount,
                vat_7_amount: expensesResult.vat_7_amount,
                vat_amount: expensesResult.vat_amount,
                net_amount: expensesResult.net_amount,
                withholding_tax: expensesResult.withholding_tax,
                total_amount: expensesResult.total_amount
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
            status: "error",
            message: `${error}`
        });
    }
};
exports.genDocument = async (req, res) => {
    try {
        const expensesResult = await expensesModel.getByDocumentId(req.params.document_id);

        if (expensesResult !== undefined) {
            expensesResult.expenses_issue_date = moment(expensesResult.expenses_issue_date).format("DD/MM/YYYY");
            expensesResult.expenses_due_date = moment(expensesResult.expenses_due_date).format("DD/MM/YYYY");

            const pdf_name = `${expensesResult.expenses_document_id}.pdf`;

            let pdf_path = process.cwd() + "/src/documents/" + pdf_name;

            let result = await pdf.createAsync(
                expensesTemplate(expensesResult),
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
        const expensesResult = await expensesModel.getByDocumentId(req.params.document_id);

        if (expensesResult !== undefined) {
            let result = {
                ref_type: "expenses",
                ref_document_id: expensesResult.expenses_document_id,
                vendor_info: expensesResult.vendor_info,
                payment_made_data: [
                    {
                        document_id: expensesResult.expenses_document_id,
                        issue_date: expensesResult.expenses_issue_date,
                        due_date: expensesResult.expenses_due_date,
                        net_amount: expensesResult.total_amount,
                        amountToPay: expensesResult.total_amount,
                        received_amount: expensesResult.total_amount
                    }
                ],
                total_amount: expensesResult.total_amount
            };

            return res.send({
                status: "success",
                data: result
            });
        } else {
            throw new Error(`ไม่พบเอกสาร ${req.params.expenses_document_id}`);
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
        const expensesResult = await expensesModel.getByDocumentId(req.params.document_id);

        if (expensesResult !== undefined) {
            let paymentMadeListResult = await paymentMadeModel.getByRefTypeAndRefDocumentId("expenses", expensesResult.expenses_document_id);
            paymentMadeListResult = await paymentMadeListResult.filter((pm) => pm.payment_made_status !== "cancelled");

            if (paymentMadeListResult.length === 0) {
                const result = await expensesModel.updateByDocumentId(req.params.document_id, { expenses_status: "cancelled" }, req.user);

                return res.send({
                    status: "success",
                    data: result
                });
            } else {
                throw new Error(`กรุณายกเลิกเอกสารที่เกี่ยวข้อง`);
            }
        } else {
            throw new Error(`ไม่พบเอกสาร`);
        }

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`
        });
    }
};