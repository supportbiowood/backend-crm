const express = require("express");
const router = express.Router();

const salesInvoiceController = require("../controllers/salesInvoice.controller");

router.get("/", salesInvoiceController.getAll);

router.get("/:document_id", salesInvoiceController.getByDocumentId);

router.get("/contact/:contact_id", salesInvoiceController.getByContactId);

router.post("/:document_id/gen_sales_invoice_pdf", salesInvoiceController.genDocument);

router.post("/:document_id/next_rt", salesInvoiceController.generatePaymentReceiptData);

router.post("/", salesInvoiceController.create);

router.post("/wait_approve", salesInvoiceController.waitApprove);

router.post("/approve", salesInvoiceController.approve);

router.post("/:document_id/copy_document", salesInvoiceController.copyDocument);

router.put("/:document_id", salesInvoiceController.update);

router.put("/:document_id/not_approve", salesInvoiceController.notApprove);

router.delete("/:document_id", salesInvoiceController.delete);


module.exports = router;
