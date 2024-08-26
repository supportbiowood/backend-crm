const express = require("express");
const router = express.Router();

const paymentReceiptController = require("../controllers/paymentReceipt.controller");

router.get("/", paymentReceiptController.getAll);

router.get("/:document_id", paymentReceiptController.getByDocumentId);

router.post("/", paymentReceiptController.create);

router.post("/approve", paymentReceiptController.approve);

router.post("/:document_id/gen_payment_receipt_pdf", paymentReceiptController.genDocument);

router.put("/:document_id", paymentReceiptController.update);

router.post("/:document_id/copy_document", paymentReceiptController.copyDocument);

router.delete("/:document_id", paymentReceiptController.delete);

module.exports = router;