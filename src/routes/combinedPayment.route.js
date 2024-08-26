const express = require("express");
const router = express.Router();

const combinedPaymentController = require("../controllers/combinedPayment.controller");

router.get("/", combinedPaymentController.getAll);

router.get("/:document_id", combinedPaymentController.getByDocumentId);

router.get("/:contact_id/purchase_invoice_list", combinedPaymentController.getPurchaseInvoiceList);

router.post("/", combinedPaymentController.create);

router.post("/wait_approve", combinedPaymentController.waitApprove);

router.post("/approve", combinedPaymentController.approve);

router.post("/:document_id/next_pm", combinedPaymentController.generatePaymentMadeData);

router.post("/:document_id/gen_combined_payment_pdf", combinedPaymentController.genDocument);

router.put("/:document_id", combinedPaymentController.update);

router.put("/:document_id/not_approve", combinedPaymentController.notApprove);

router.delete("/:document_id", combinedPaymentController.delete);

module.exports = router;