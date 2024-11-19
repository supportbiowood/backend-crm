const express = require("express");
const router = express.Router();

const salesReturnController = require("../controllers/salesReturn.controller");

router.get("/", salesReturnController.getAll);

router.get("/:document_id", salesReturnController.getByDocumentId);

router.post("/", salesReturnController.create);

router.post("/wait_approve", salesReturnController.waitApprove);

router.post("/approve", salesReturnController.approve);

router.post("/:document_id/copy_document", salesReturnController.copyDocument);

router.post("/:document_id/gen_sales_return_pdf", salesReturnController.genDocument);

router.put("/:document_id", salesReturnController.update);

router.put("/:document_id/not_approve", salesReturnController.notApprove);

router.delete("/:document_id", salesReturnController.delete);

module.exports = router;