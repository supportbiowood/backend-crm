const accountModel = require("../models/account.model");
const accountTransactionModel = require("../models/accountTransaction.model");

exports.getAll = async (req, res) => {
    try {
        let result = await accountModel.getAll() || [];
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

exports.getById = async (req, res) => {
    try {
        const result = await accountModel.getById(req.params.id);
        
        if (result) {
            const transactions = accountTransactionModel.getByAccountId(result.account_id);
            if (transactions) {
                result.transactions = transactions;
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
    // ตรวจสอบว่ามีข้อมูลใน req.body หรือไม่
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    // สร้างอ็อบเจ็กต์ใหม่ของ accountModel
    const newData = new accountModel(req.body);
    try {
        // บันทึกข้อมูลใหม่ลงในฐานข้อมูล
        const result = await accountModel.create(newData, req.user);
        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        // จัดการข้อผิดพลาดที่เกิดขึ้น
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
        const result = await accountModel.update(req.params.id, req.body, req.user);
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

exports.delete = async (req, res) => {
    try {
        const result = await accountModel.delete(req.params.id);
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
