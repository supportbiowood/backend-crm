const accountJournalModel = require("../models/accountJournal.model");
const accountTransactionModel = require('../models/accountTransaction.model')

export const internalCreateAccountJournal = async (data, user) => {
  const newData = new accountJournalModel(data);
  try {
    const result = await accountJournalModel.create(newData, user);

    if (result && data.transactions.length > 0) {
      const transactionPromises = data.transactions.map((transaction) => {
        transaction.account_journal_id = result.insertId
        return accountTransactionModel.create(new accountTransactionModel(transaction), user)
      })
      await Promise.all(transactionPromises)
    }  
    return result
  }
  catch (e) {
    throw e
  }
}

export const internalUpdateAccountJournal = async (documentId, data, user) => {
  try {
    const accountJournal = await accountJournalModel.getByRefDocumentId(documentId)
    if (!accountJournal) {
      throw new Error('Account Journal Not Found')
    }
    if (data.transactions.length > 0) {
      const transactionPromises = data.transactions.map((transaction) => {
        transaction.account_journal_id = accountJournal.account_journal_id
        return accountTransactionModel.create(new accountTransactionModel(transaction), user)
      })
      await Promise.all(transactionPromises)
    }  
    return true
  }
  catch (e) {
    throw e
  }
}

exports.getAll = async (req, res) => {
  try {
    let result = await accountJournalModel.getAll() || [];
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
    const result = await accountJournalModel.getById(req.params.id);
    
    if (result) {
      const transactions = await accountTransactionModel.getByAccountJournalId(req.params.id)
      result.transactions = transactions
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
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res.status(400).send({
      status: "error",
      message: `Please fill information`,
    });
  }
  try {
    const result = await internalCreateAccountJournal(req.body, req.user)
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
    const result = await accountJournalModel.update(req.params.id, req.body, req.user);
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
    const result = await accountJournalModel.delete(req.params.id);
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
