const express = require("express");
const router = express.Router();

const billingNoteController = require("../controllers/billingNote.controller");

router.get("/", billingNoteController.getAll);

router.get("/:document_id", billingNoteController.getById);

router.get("/:contact_id/sales_invoice", billingNoteController.getSalesInvoice);

router.post("/:document_id/gen_billing_note_pdf", billingNoteController.genDocument);

router.post("/", billingNoteController.create);

router.post("/wait_approve", billingNoteController.waitApprove);

router.post("/approve", billingNoteController.approve);

router.post("/:document_id/next_rt", billingNoteController.generatePaymentReceiptData);

router.put("/:document_id", billingNoteController.update);

router.put("/:document_id/not_approve", billingNoteController.notApprove);

router.delete("/:document_id", billingNoteController.delete);

module.exports = router;