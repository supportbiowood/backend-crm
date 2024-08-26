const express = require("express");
const router = express.Router();

const purchaseRequestController = require("../controllers/purchaseRequest.controller");

router.get("/", purchaseRequestController.getAll);

router.get("/sales_order_list", purchaseRequestController.getSalesOrderList);

router.get("/:document_id", purchaseRequestController.getByDocumentId);

router.post("/", purchaseRequestController.create);

router.post("/wait_approve", purchaseRequestController.waitApprove);

router.post("/approve", purchaseRequestController.approve);

router.post("/:document_id/copy_document", purchaseRequestController.copyDocument);

router.post("/:document_id/gen_purchase_request_pdf", purchaseRequestController.genDocument);

router.post("/:document_id/next_po", purchaseRequestController.generatePurchaseOrderData);

router.put("/:document_id", purchaseRequestController.update);

router.put("/:document_id/not_approve", purchaseRequestController.notApprove);

router.delete("/:document_id", purchaseRequestController.delete);

module.exports = router;