const express = require("express");
const router = express.Router();

const contactTagController = require("../controllers/contactTag.controller");

router.get('/', contactTagController.getAll);

router.post('/', contactTagController.create);

router.delete('/:contact_id/:tag_id', contactTagController.delete);

module.exports = router;
