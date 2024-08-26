const express = require("express");
const router = express.Router();

const deliveryNoteController = require("../controllers/deliveryNote.controller");

router.get("/", deliveryNoteController.getAll);

router.get("/:document_id", deliveryNoteController.getByDocumentId);

router.post("/", deliveryNoteController.create);

router.post("/approve", deliveryNoteController.approve);

router.post("/:document_id/change_status", deliveryNoteController.updateStatus);

router.post("/:document_id/copy_document", deliveryNoteController.copyDocument);

router.post("/:document_id/gen_delivery_note_pdf", deliveryNoteController.genDocument);

router.get("/:contact_id/sales_order_list", deliveryNoteController.getSalesOrderList);

router.put("/:document_id", deliveryNoteController.update);

router.delete("/:document_id", deliveryNoteController.delete);

module.exports = router;