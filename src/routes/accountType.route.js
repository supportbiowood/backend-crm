const express = require("express");
const router = express.Router();

const accountTypeController = require("../controllers/accountType.controller");

router.get('/', accountTypeController.getAll);

router.get('/:id', accountTypeController.getById);

module.exports = router;
