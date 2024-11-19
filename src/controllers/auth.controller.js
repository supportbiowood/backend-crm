const moment = require("moment");
const employeeModel = require("../models/employee.model");
const employeeRoleModel = require("../models/employeeRole.model");
const permissionManager = require("../utils/permission");
const utils = require("../utils/auth");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const ses = require("../utils/ses");

exports.signIn = async (req, res) => {
    // ตรวจสอบว่า request body มีข้อมูลครบหรือไม่ (อีเมลและรหัสผ่าน)
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            status: "error",
            message: "Please provide both email and password",
        });
    }
    
    try {
        // ดึงข้อมูลผู้ใช้จากฐานข้อมูลตามอีเมล
        const result = await employeeModel.getByEmail(req.body.email);
        // ตรวจสอบว่าผู้ใช้นี้มีอยู่จริงและสถานะบัญชีไม่ได้ถูกปิด
        if (!result || result.employee_status === 'inactive') {
            // console.log("LENGTH ERROR", err);
            return res.status(400).send({
                status: "error",
                message: `บัญชีผู้ใช้งานอยู่ในสถานะไม่สามารถใช้งานได้`,
            });
        }

        if (req.body.password !== result.employee_password)
            return res.status(400).send({
                status: "error",
                message: `อีเมล หรือ รหัสผ่าน ไม่ถูกต้อง`,
            });

        // generate token
        const access_token = utils.generateToken(result);
        // get basic user details
        const userObj = utils.getCleanUser(result);
        userObj.role = await employeeRoleModel.getByEmployeeDocumentId(userObj.employee_document_id);
        userObj.permission = permissionManager.matchPermissionObject(
            permissionManager.mergePermission(userObj.role));
        await employeeModel.updateLastLogin(result.employee_document_id, { _employee_lastlogin: moment().tz("Asia/Bangkok").unix() });
        // return the token along with user details
        return res.send({
            status: "success",
            data: { user: userObj, access_token: access_token },
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};

exports.verifyToken = async (req, res) => {
    // check token that was passed by decoding token using secret
    let access_token = req.body.access_token || req.query.access_token;
    try {
        let verifyUser = jwt.verify(access_token, process.env.JWT_SECRET);
        if (!verifyUser || !verifyUser.employee_email) return res.status(400).send({
            status: "error",
            message: `Invalid token`,
        });

        // return 401 status if the userId does not match.
        const result = await employeeModel.getByEmail(verifyUser.employee_email);
        let userObj = utils.getCleanUser(result);
        if (result.length <= 0)
            return res.status(400).send({
                status: "error",
                message: `User not found`,
            });
        userObj = utils.getCleanUser(result);
        userObj.role = await employeeRoleModel.getByEmployeeDocumentId(userObj.employee_document_id);
        userObj.permission = permissionManager.matchPermissionObject(
            permissionManager.mergePermission(userObj.role));
        return res.send({
            status: "success",
            data: { user: userObj, access_token: access_token },
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `Verify token error ${error}`,
        });
    }
};

exports.verifySes = async (req, res) => {
    return res.send(ses.verifySes("suppakit.neno@gmail.com"));
};

exports.forgetPassword = async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        res.status(400).send({
            status: "error",
            message: `Please fill information`,
        });
    }

    try {
        const result = await employeeModel.getByEmail(req.body.email);
        if (!result) {
            // console.log("LENGTH ERROR", err);
            return res.status(400).send({
                status: "error",
                message: `ไม่พบชื่อผู้ใช้ในระบบ`,
            });
        }

        ses.sendPassword("suppakit.neno@gmail.com", result.employee_password);

        return res.send({
            status: "success",
            data: `เราได้ส่งรหัสผ่านของคุณไปที่ ${result.employee_email}`,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};