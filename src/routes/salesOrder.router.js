const express = require("express");
const router = express.Router();

const salesOrderController = require("../controllers/salesOrder.controller");

router.get("/", salesOrderController.getAll);

router.get("/:document_id", salesOrderController.getByDocumentId);

router.post("/", salesOrderController.create);

router.post("/wait_approve", salesOrderController.waitApprove);

router.post("/approve", salesOrderController.approve);

router.post("/:document_id/copy_document", salesOrderController.copyDocument);

router.post("/:document_id/gen_sales_order_pdf", salesOrderController.genDocument);

router.post("/:document_id/next_si", salesOrderController.generateSalesInvoiceData);

router.put("/:document_id", salesOrderController.update);

router.put("/:document_id/not_approve", salesOrderController.notApprove);

router.delete("/:document_id", salesOrderController.delete);

module.exports = router;