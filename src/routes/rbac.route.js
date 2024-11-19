const express = require("express");

const router = express.Router();

const rbacController = require("../controllers/rbac.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get("/permission", authMiddleware.hasPermission(["setting_rbac_modify"]), rbacController.getAllPermission);

router.get("/role", authMiddleware.hasPermission("setting_rbac_modify"), rbacController.getAllRole);

router.post("/role/create", authMiddleware.hasPermission("setting_rbac_modify"), rbacController.create);

router.get("/role/:role_document_id", authMiddleware.hasPermission("setting_rbac_modify"), rbacController.getRoleByDocumentId);

router.put("/role/:role_document_id", authMiddleware.hasPermission("setting_rbac_modify"), rbacController.updateRoleByDocumentId);

router.delete("/role/:role_document_id", authMiddleware.hasPermission("setting_rbac_modify"), rbacController.deleteRoleByDocumentId);

module.exports = router;
