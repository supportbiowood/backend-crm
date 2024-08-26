const express = require("express");
const router = express.Router();

const purchaseInvoiceController = require("../controllers/purchaseInvoice.controller");

router.get("/", purchaseInvoiceController.getAll);

router.get("/:document_id", purchaseInvoiceController.getByDocumentId);

router.get("/contact/:contact_id", purchaseInvoiceController.getByContactId);

router.post("/", purchaseInvoiceController.create);

router.post("/wait_approve", purchaseInvoiceController.waitApprove);

router.post("/approve", purchaseInvoiceController.approve);

router.post("/:document_id/copy_document", purchaseInvoiceController.copyDocument);

router.post("/:document_id/gen_purchase_invoice_pdf", purchaseInvoiceController.genDocument);

router.post("/:document_id/next_pm", purchaseInvoiceController.generatePaymentMadeData);

router.put("/:document_id", purchaseInvoiceController.update);

router.put("/:document_id/not_approve", purchaseInvoiceController.notApprove);

router.delete("/:document_id", purchaseInvoiceController.delete);

module.exports = router;