const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contact.controller");

router.get("/", contactController.getAll);

router.get("/total-row", contactController.getTotalRow);

router.get("/options", contactController.getAllOptions);

router.get("/:id", contactController.getById);

router.post("/", contactController.create);

router.post("/table", contactController.fullFilter);

router.post("/table-total-row", contactController.fullFilterTotalRow);

router.put("/:id", contactController.update);

router.delete("/:id", contactController.delete);

module.exports = router;
