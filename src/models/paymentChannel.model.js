const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let PaymentChannel = function (data) {
    this.payment_channel_account_id = data.payment_channel_account_id;
    this.payment_channel_type = data.payment_channel_type;
    this.payment_channel_info = data.payment_channel_info;
};

let model = "payment_channel";

PaymentChannel.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM payment_channel");
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PaymentChannel.getById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM payment_channel WHERE payment_channel_id = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PaymentChannel.getByEmployeeId = async (id) => {
    try {
        const result = await db.query("SELECT * FROM payment_channel WHERE _payment_channel_createdby = ?", [id]);
        // console.log(model + " model insert success", result);
        return result[0][0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PaymentChannel.create = async (data, _createdby) => {
    data.payment_channel_info = JSON.stringify(data.payment_channel_info);
    data._payment_channel_createdby = _createdby.employee_id;
    data._payment_channel_createdby_employee = JSON.stringify(_createdby);
    try {
        const result = await db.query("INSERT INTO `payment_channel` SET ?", data);
        // console.log(model + " model insert success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

PaymentChannel.update = async (id, data, _updateby) => {
    if (data.payment_channel_info) {
        data.payment_channel_info = JSON.stringify(data.payment_channel_info);
    }
    //   data._payment_channel_lastupdate = moment().tz("Asia/Bangkok").unix();
    //   data._payment_channel_lastupdateby = _updateby.employee_id;
    //   data._payment_channel_lastupdateby_employee = JSON.stringify(_updateby);

    const columns = Object.keys(data);
    const values = Object.values(data);

    let sql =
      "UPDATE payment_channel SET " +
      columns.join(" = ? ,") +
      " = ? WHERE payment_channel.payment_channel_id = '" +
      id +
      "'";

    try {
        const result = await db.query(sql, values);
        // console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

module.exports = PaymentChannel;
