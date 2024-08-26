const accountTypeModel = require("../models/accountType.model");

exports.getAll = async (req, res) => {
  try {
    let result = await accountTypeModel.getAll() || [];
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
    const result = await accountTypeModel.getById(req.params.id);
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