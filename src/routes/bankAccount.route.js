const express = require("express");
const router = express.Router();

const bankAccountController = require("../controllers/bankAccount.controller");

router.post('/', bankAccountController.create);

router.put('/:id', bankAccountController.update);

router.delete('/:id', bankAccountController.delete);

module.exports = router;
