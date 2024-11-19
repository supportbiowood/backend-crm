const db = require("../utils/database");
const moment = require("moment");
require("moment-timezone");

let ProjectTag = function (data) {
  this.project_id = data.project_id;
  this.tag_id = data.tag_id;
};

let model = "ProjectTag";

ProjectTag.getAll = async () => {
  try {
    // const result = await db.query("SELECT DISTINCT tag_id FROM project_tag");
    // Include Default tag 16-31
    const result = await db.query(
      "SELECT tag_id FROM tag WHERE tag_id IN (16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31) UNION SELECT DISTINCT tag_id FROM project_tag ORDER BY tag_id"
    );
    // console.log(model + " model get success", result);
    return result[0];
  } catch (error) {
    // console.log(model + " model get", error);
    throw new Error(`${model} model get ${error}`);
  }
};

ProjectTag.create = async (data) => {
  try {
    const result = await db.query("INSERT INTO `project_tag` SET ?", data);
    // console.log(model + " model insert success", result);
    return result[0];
  } catch (error) {
    console.log(model + " model insert", error);
    throw new Error(`${model} model insert ${error}`);
  }
};

ProjectTag.delete = async (project_id, tag_id) => {
  try {
    const result = await db.query(
      "DELETE FROM project_tag WHERE project_id = ? AND tag_id = ?",
      [project_id, tag_id]
    );
    // console.log(model + " model delete success", result);
    return result[0];
  } catch (error) {
    console.log(model + " model delete", error);
    throw new Error(`${model} model delete ${error}`);
  }
};
ProjectTag.deleteByProjectId = async (project_id) => {
  try {
    const result = await db.query(
      "DELETE FROM project_tag WHERE project_id = ?",
      [project_id]
    );
    // console.log(model + " model delete success", result);
    return result[0];
  } catch (error) {
    console.log(model + " model delete", error);
    throw new Error(`${model} model delete ${error}`);
  }
};

module.exports = ProjectTag;
