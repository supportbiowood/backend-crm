const express = require("express");
const router = express.Router();

const purchaseReturnController = require("../controllers/purchaseReturn.controller");

router.get("/", purchaseReturnController.getAll);

router.get("/:document_id", purchaseReturnController.getByDocumentId);

router.post("/", purchaseReturnController.create);

router.post("/wait_approve", purchaseReturnController.waitApprove);

router.post("/approve", purchaseReturnController.approve);

router.post("/:document_id/copy_document", purchaseReturnController.copyDocument);

router.post("/:document_id/gen_purchase_return_pdf", purchaseReturnController.genDocument);

router.put("/:document_id", purchaseReturnController.update);

router.put("/:document_id/not_approve", purchaseReturnController.notApprove);

router.delete("/:document_id", purchaseReturnController.delete);

module.exports = router;