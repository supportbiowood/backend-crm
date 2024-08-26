let jwt = require("jsonwebtoken");

// generate token and return it
function generateToken(data) {
    if (!data) return null;

    let user = {
        employee_id: data.employee_id,
        employee_document_id: data.employee_document_id,
        employee_firstname: data.employee_firstname,
        employee_lastname: data.employee_lastname,
        employee_email: data.employee_email,
        employee_phone: data.employee_phone,
        employee_img_url: data.employee_img_url,
        employee_department: data.employee_department,
        employee_position: data.employee_position,
        employee_status: data.employee_status,
        employee_created: data.employee_created,
        employee_lastlogin: data.employee_lastlogin,
    };

    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24, // expires in 24 hours
    });
}

// return basic user details
function getCleanUser(data) {
    if (!data) return null;

    return {
        employee_id: data.employee_id,
        employee_document_id: data.employee_document_id,
        employee_firstname: data.employee_firstname,
        employee_lastname: data.employee_lastname,
        employee_email: data.employee_email,
        employee_phone: data.employee_phone,
        employee_img_url: data.employee_img_url,
        employee_department: data.employee_department,
        employee_position: data.employee_position,
        employee_status: data.employee_status,
        employee_created: data.employee_created,
        employee_lastlogin: data.employee_lastlogin,
    };
}

module.exports = {
    generateToken,
    getCleanUser,
};
