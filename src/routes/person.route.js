const express = require("express");
const router = express.Router();

const personController = require("../controllers/person.controller");

router.get("/", personController.getAll);

router.get("/:id", personController.getById);

router.post("/", personController.create);

router.put("/:id", personController.update);

router.delete("/:id", personController.delete);

module.exports = router;
