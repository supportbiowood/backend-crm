const express = require("express");
const router = express.Router();

const debitNoteController = require("../controllers/debitNote.controller");

router.get("/", debitNoteController.getAll);

router.get("/:document_id", debitNoteController.getByDocumentId);

router.post("/", debitNoteController.create);

router.post("/wait_approve", debitNoteController.waitApprove);

router.post("/approve", debitNoteController.approve);

router.post("/:document_id/copy_document", debitNoteController.copyDocument);

router.post("/:document_id/gen_debit_note_pdf", debitNoteController.genDocument);

router.put("/:document_id", debitNoteController.update);

router.put("/:document_id/not_approve", debitNoteController.notApprove);

router.put("/:document_id/update_payment", debitNoteController.updatePayment);

router.delete("/:document_id", debitNoteController.delete);

module.exports = router;