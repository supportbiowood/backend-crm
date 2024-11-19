const express = require("express");
const router = express.Router();

const quotationController = require("../controllers/quotation.controller");

router.get("/", quotationController.getAll);

router.get("/document/:document_id", quotationController.getByDocumentIdWithRevision);

router.get("/:document_id", quotationController.getByDocumentId);

router.post("/", quotationController.create);

router.post("/wait_approve", quotationController.waitApprove);

router.post("/approve", quotationController.approve);

router.put("/document/:quotation_document_id", quotationController.updateByDocumentId);

router.post("/document/:quotation_document_id/revision", quotationController.updateNewRevisionByDocumentId);

router.post("/:quotation_id/next_so", quotationController.generateSalesOrderData);

router.post("/:quotation_id/gen_quotation_pdf", quotationController.genDocument);

router.post("/:quotation_id/copy_document", quotationController.copyDocument);

router.put("/:quotation_id", quotationController.update);

router.put("/:quotation_id/not_approve", quotationController.notApprove);

router.post("/:quotation_id/accept", quotationController.accept);

router.delete("/:quotation_id", quotationController.delete);

module.exports = router;
