const express = require("express");
const router = express.Router();

import importerController from "../controllers/importer.controller";

router.post("/", importerController.import);

module.exports = router;
