const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let Address = function(data) {
    this.address_ref_type = data.address_ref_type;
    this.ref_id = data.ref_id;
    this.address_type = data.address_type;
    this.address_name = data.address_name;
    this.building = data.building;
    this.house_no = data.house_no;
    this.road = data.road;
    this.village_no = data.village_no;
    this.sub_district = data.sub_district;
    this.district = data.district;
    this.province = data.province;
    this.country = data.country;
    this.postal_code = data.postal_code;
};

let model = "Address";

Address.getAll = async () => {
    try {
        const result = await db.query("SELECT * FROM address");
        // console.log(model + " model get success", result);
        return result[0];
    } catch (error) {
    // console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Address.getById = async (id) => {
    try {
        const result = await db.query(
            "SELECT * FROM address WHERE address.address_id = ?",
            [id]
        );
        console.log(model + " model get success", result);
        return result[0][0] && result[0][0] ? result[0][0] : null;
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Address.getByRefIdAndRefTypeAndContactType = async (ref_id,address_ref_type, address_type) => {
    try {
        const result = await db.query(
            "SELECT * FROM address WHERE address.ref_id = ? AND address.address_ref_type = ? AND address.address_type = ?",
            [
                ref_id,
                address_ref_type,
                address_type
            ]
        );
        console.log(model + " model get success", result);
        return result[0] ? result[0] : [];
    } catch (error) {
        console.log(model + " model get", error);
        throw new Error(`${model} model get ${error}`);
    }
};

Address.create = async (data, _createdby) => {
    try {
        const result = await db.query(
            "INSERT INTO `address` SET ?", data
        );
        console.log(model + " model insert success", result);
        return { address_id: result[0].insertId };
    } catch (error) {
        console.log(model + " model insert", error);
        throw new Error(`${model} model insert ${error}`);
    }
};

Address.update = async (id, data) => {
    try {
        const result = await db.query(
            "UPDATE address SET address.address_name = ?, address.building = ?, address.house_no = ?, address.road = ?, address.village_no = ?, address.sub_district = ?, address.district = ?, address.province = ?, address.country = ?, address.postal_code = ? WHERE address.address_id = ?",
            [
                data.address_name,
                data.building,
                data.house_no,
                data.road,
                data.village_no,
                data.sub_district,
                data.district,
                data.province,
                data.country,
                data.postal_code,
                id
            ]
        );
        console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Address.updateRefId = async(id, data) =>{
    try {
        const result = await db.query(
            "UPDATE address SET address.ref_id = ? WHERE address.address_id = ?",
            [
                data.ref_id,
                id
            ]
        );
        console.log(model + " model update success", result);
        return result[0];
    } catch (error) {
        console.log(model + " model update", error);
        throw new Error(`${model} model update ${error}`);
    }
};

Address.delete = async (id, data) => {
    try {
        const result = await db.query(
            "DELETE FROM address WHERE address.address_id = ?",
            [
                id
            ]
        );
        console.log(model + " model delete success", result);
        return result[0].affectedRows > 0;
    } catch (error) {
        console.log(model + " model delete", error);
        throw new Error(`${model} model delete ${error}`);
    }
};

module.exports = Address;
