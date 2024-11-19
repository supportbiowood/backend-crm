const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const employeeController = require("../controllers/employee.controller");

router.get("/", employeeController.getAll);

router.get("/:employee_document_id", employeeController.getByDocumentId);

router.post("/", authMiddleware.hasRole("admin"), employeeController.create);

router.get("/:employee_document_id/team", employeeController.getTeam);

router.post("/", employeeController.create);

router.put(
    "/:employee_document_id",
    authMiddleware.hasRole("admin"),
    employeeController.update
);

router.delete(
    "/:employee_document_id",
    authMiddleware.hasRole("admin"),
    employeeController.delete
);

module.exports = router;
