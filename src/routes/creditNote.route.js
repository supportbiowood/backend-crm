const express = require("express");
const router = express.Router();

const creditNoteController = require("../controllers/creditNote.controller");

router.get("/", creditNoteController.getAll);

router.get("/:document_id", creditNoteController.getByDocumentId);

router.post("/", creditNoteController.create);

router.post("/wait_approve", creditNoteController.waitApprove);

router.post("/approve", creditNoteController.approve);

router.post("/:document_id/copy_document", creditNoteController.copyDocument);

router.post("/:document_id/gen_credit_note_pdf", creditNoteController.genDocument);

router.put("/:document_id", creditNoteController.update);

router.put("/:document_id/not_approve", creditNoteController.notApprove);

router.put("/:document_id/update_payment", creditNoteController.updatePayment);

router.delete("/:document_id", creditNoteController.delete);

module.exports = router;