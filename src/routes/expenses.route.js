const express = require("express");
const router = express.Router();

const expensesController = require("../controllers/expenses.controller");

router.get("/", expensesController.getAll);

router.get("/:document_id", expensesController.getByDocumentId);

router.post("/", expensesController.create);

router.post("/wait_approve", expensesController.waitApprove);

router.post("/approve", expensesController.approve);

router.post("/:document_id/copy_document", expensesController.copyDocument);

router.post("/:document_id/gen_expenses_pdf", expensesController.genDocument);

router.post("/:document_id/next_pm", expensesController.generatePaymentMadeData);

router.put("/:document_id", expensesController.update);

router.put("/:document_id/not_approve", expensesController.notApprove);

router.delete("/:document_id", expensesController.delete);

module.exports = router;