const express = require("express");
const router = express.Router();

const paymentMadeController = require("../controllers/paymentMade.controller");

router.get("/", paymentMadeController.getAll);

router.get("/:document_id", paymentMadeController.getByDocumentId);

router.post("/", paymentMadeController.create);

router.post("/approve", paymentMadeController.approve);

router.post("/:document_id/copy_document", paymentMadeController.copyDocument);

router.post("/:document_id/gen_payment_made_pdf", paymentMadeController.genDocument);

router.put("/:document_id", paymentMadeController.update);

router.delete("/:document_id", paymentMadeController.delete);

module.exports = router;