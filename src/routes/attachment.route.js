const express = require("express");
const router = express.Router();

const attachmentController = require("../controllers/attachment.controller");

router.get("/", attachmentController.getAll);

router.get("/:id", attachmentController.getById);

router.get("/:type/:ref_id", attachmentController.getByTypeAndRefId);

router.post("/", attachmentController.create);

router.put("/:id", attachmentController.update);

router.delete("/:id", attachmentController.delete);

module.exports = router;
