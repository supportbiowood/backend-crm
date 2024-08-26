const express = require("express");
const router = express.Router();

const projectEmployeeController = require("../controllers/projectEmployee.controller");

router.post('/', projectEmployeeController.create);

router.put('/:id', projectEmployeeController.update);

router.delete('/:id', projectEmployeeController.delete);

module.exports = router;
