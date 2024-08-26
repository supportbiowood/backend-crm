const accountTransactionModel = require("../models/accountTransaction.model");

exports.getAll = async (req, res) => {
  try {
    let result = await accountTransactionModel.getAll() || [];
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
    const result = await accountTransactionModel.getById(req.params.id);
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

exports.getByAccountJournalId = async (req, res) => {
  try {
    const result = await accountTransactionModel.getByAccountJournalId(req.params.id);
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
  const newData = new accountTransactionModel(req.body);
  try {
    const result = await accountTransactionModel.create(newData, req.user);
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

exports.update = async (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res.status(400).send({
      status: "error",
      message: `Please fill information`,
    });
  }

  try {
    const result = await accountTransactionModel.update(req.params.id, req.body, req.user);
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
    const result = await accountTransactionModel.delete(req.params.id);
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
