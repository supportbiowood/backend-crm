const express = require("express");
const router = express.Router();

const projectTagController = require("../controllers/projectTag.controller");

router.get('/', projectTagController.getAll);

router.post('/', projectTagController.create);

router.delete('/:project_id/:tag_id', projectTagController.delete);

module.exports = router;
