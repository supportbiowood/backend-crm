const express = require("express");
const router = express.Router();

const addressController = require("../controllers/address.controller");

router.post('/', addressController.create);

router.put('/:id', addressController.update);

router.delete('/:id', addressController.delete);

module.exports = router;
