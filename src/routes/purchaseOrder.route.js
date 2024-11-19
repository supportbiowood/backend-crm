const express = require("express");
const router = express.Router();

const purchaseOrderController = require("../controllers/purchaseOrder.controller");

router.get("/", purchaseOrderController.getAll);

router.get("/purchase_request_list", purchaseOrderController.getPurchaseRequestList);

router.get("/:document_id", purchaseOrderController.getByDocumentId);

router.post("/", purchaseOrderController.create);

router.post("/wait_approve", purchaseOrderController.waitApprove);

router.post("/approve", purchaseOrderController.approve);

router.post("/:document_id/copy_document", purchaseOrderController.copyDocument);

router.post("/:document_id/gen_purchase_order_pdf", purchaseOrderController.genDocument);

router.put("/:document_id", purchaseOrderController.update);

router.put("/:document_id/not_approve", purchaseOrderController.notApprove);

router.delete("/:document_id", purchaseOrderController.delete);

router.post("/:document_id/next_pi", purchaseOrderController.generatePurchaseInvoiceData);

module.exports = router;