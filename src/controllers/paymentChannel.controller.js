const paymentChannelModel = require("../models/paymentChannel.model");
const accountModel = require("../models/account.model");

export const internalCreate = async (data, user) => {
    try {
        const newPaymentChannelData = new paymentChannelModel(data);

        const result = await paymentChannelModel.create(
            newPaymentChannelData,
            user
        );

        let parentAccountId;

        if (data.payment_channel_type === 'cash') {
            parentAccountId = 55; // Ref from Database
        }
        if (data.payment_channel_type === 'bank') {
            parentAccountId = 56; // Ref from Database
        }
        if (data.payment_channel_type === 'e-wallet') {
            parentAccountId = 57; // Ref from Database
        }

        if (parentAccountId) {
            const parentAccount = await accountModel.getById(parentAccountId);
            if (parentAccount) {
                const newAccount = {
                    account_type_id: parentAccount.account_type_id,
                    account_code: `${parentAccount.account_code}:${result.insertId}`,
                    parent_account_id: parentAccountId,
                    account_name: `${parentAccount.account_code}:${result.insertId}`,
                    account_description: `${parentAccount.account_code}:${result.insertId}`
                };
                const accountResult = await accountModel.create(new accountModel(newAccount), user);

                if (accountResult) {
                    await paymentChannelModel.update(
                        result.insertId,
                        { payment_channel_account_id: accountResult.insertId },
                        user
                    );
                }
            }
        }
        return result;
    }
    catch (e) {
        throw e;
    }
};

exports.getAll = async (req, res) => {
    try {
        const result = await paymentChannelModel.getAll();

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
        const result = await paymentChannelModel.getById(req.params.id);

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

exports.getByEmployeeId = async (req, res) => {
    try {
        const result = await paymentChannelModel.getByEmployeeId(req.body.user.employee_id);

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
    
    try {
        const result = await internalCreate(req.body, req.user);

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
