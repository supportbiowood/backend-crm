const express = require("express");
const router = express.Router();

const projectActivityController = require("../controllers/projectActivity.controller");

router.get("/", projectActivityController.getAll);

router.get("/:id", projectActivityController.getById);

router.get("/project/:id", projectActivityController.getByProjectId);

router.post("/", projectActivityController.create);

router.put("/:id", projectActivityController.update);

router.delete("/:id", projectActivityController.delete);

module.exports = router;
