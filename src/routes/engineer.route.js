const express = require("express");
const router = express.Router();
const engineerController = require("../controllers/engineer.controller");

router.get("/", engineerController.getAll);
router.get("/:engineer_document_id", engineerController.getByDocumentId);
router.put("/:engineer_document_id", engineerController.updateByDocumentId);
router.put("/:engineer_document_id/job_approve", engineerController.updateByDocumentId);
router.put("/:engineer_document_id/review_approve", engineerController.updateByDocumentId);
router.post("/table", engineerController.fullFilter);
router.post("/table-total-row", engineerController.fullFilterTotalRow);
router.post("/:engineer_document_id/revision", engineerController.updateNewRevisionByDocumentId);
router.post("/", engineerController.create);
router.delete("/:engineer_document_id", engineerController.deleteByDocumentId);

module.exports = router;