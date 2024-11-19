const express = require("express");
const router = express.Router();

const activityController = require("../controllers/activity.controller");

router.get("/", activityController.getAll);

router.get("/:id", activityController.getById);

router.get("/document/:document_id", activityController.getByDocumentId);

router.post("/", activityController.create);

router.delete("/:id", activityController.delete);

module.exports = router;
