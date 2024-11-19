const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ContactTag = function (data) {
  this.contact_id = data.contact_id;
  this.tag_id = data.tag_id;
};

let model = "ContactTag";

ContactTag.getAll = async () => {
  try {
    // const result = await db.query("SELECT DISTINCT tag_id FROM contact_tag");
    // Include Default tag 16-31
    const result = await db.query(
      "SELECT tag_id FROM tag WHERE tag_id IN (16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31) UNION SELECT DISTINCT tag_id FROM contact_tag ORDER BY tag_id"
    );
    // console.log(model + " model get success", result);
    return result[0];
  } catch (error) {
    // console.log(model + " model get", error);
    throw new Error(`${model} model get ${error}`);
  }
};

ContactTag.create = async (data, _createdby) => {
  try {
    const result = await db.query("INSERT INTO `contact_tag` SET ?", data);
    // console.log(model + " model insert success", result);
    return result[0];
  } catch (error) {
    console.log(model + " model insert", error);
    throw new Error(`${model} model insert ${error}`);
  }
};

ContactTag.delete = async (contact_id, tag_id) => {
  try {
    const result = await db.query(
      "DELETE FROM contact_tag WHERE contact_id = ? AND tag_id = ?",
      [contact_id, tag_id]
    );
    // console.log(model + " model delete success", result);
    return result[0];
  } catch (error) {
    console.log(model + " model delete", error);
    throw new Error(`${model} model delete ${error}`);
  }
};

ContactTag.deleteByContactId = async (contact_id) => {
  try {
    const result = await db.query(
      "DELETE FROM contact_tag WHERE contact_id = ?",
      [contact_id]
    );
    // console.log(model + " model delete success", result);
    return result[0];
  } catch (error) {
    console.log(model + " model delete", error);
    throw new Error(`${model} model delete ${error}`);
  }
};

module.exports = ContactTag;
