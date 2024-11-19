const express = require("express");
const router = express.Router();

const remarkTemplateController = require("../controllers/remarkTemplate.controller");

router.get("/", remarkTemplateController.getAll);

router.get("/:id", remarkTemplateController.getById);

router.post("/", remarkTemplateController.create);

router.put("/:id", remarkTemplateController.update);

router.delete("/:id", remarkTemplateController.delete);

module.exports = router;