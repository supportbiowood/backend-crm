const express = require("express");
const router = express.Router();

const projectContactController = require("../controllers/projectContact.controller");

router.post('/', projectContactController.create);

router.put('/:id', projectContactController.update);

router.delete('/:id', projectContactController.delete);

module.exports = router;
