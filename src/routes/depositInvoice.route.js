const express = require("express");
const router = express.Router();

const depositInvoiceController = require("../controllers/depositInvoice.controller");

router.get("/", depositInvoiceController.getAll);

router.get("/:document_id", depositInvoiceController.getByDocumentId);

router.get("/:contact_id/sales_invoice_list", depositInvoiceController.getSalesInvoiceList);

router.post("/", depositInvoiceController.create);

router.post("/approve", depositInvoiceController.approve);

router.post("/:document_id/copy_document", depositInvoiceController.copyDocument);

router.post("/:document_id/next_rt", depositInvoiceController.generatePaymentReceiptData);

router.post("/:document_id/gen_deposit_invoice_pdf", depositInvoiceController.genDocument);

router.put("/:document_id", depositInvoiceController.update);

router.put("/:document_id/apply_to_sales_invoice", depositInvoiceController.applyToSalesInvoice);

router.delete("/:document_id", depositInvoiceController.delete);

module.exports = router;