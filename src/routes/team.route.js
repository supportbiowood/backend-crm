const express = require("express");
const router = express.Router();

const teamController = require("../controllers/team.controller");

router.get("/", teamController.getAll);

router.get("/:team_document_id", teamController.getByTeamDocumentId);

router.post("/", teamController.create);

router.put("/:team_document_id", teamController.updateTeamByDocumentId);

router.delete("/:team_document_id", teamController.deleteTeamByDocumentId);

module.exports = router;