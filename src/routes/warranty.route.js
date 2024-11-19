const express = require("express");
const router = express.Router();

const warrantyController = require("../controllers/warranty.controller");

router.get("/", warrantyController.getAll);

router.get("/:id", warrantyController.getById);

router.post("/", warrantyController.create);

router.put("/:id", warrantyController.update);

router.delete("/:id", warrantyController.delete);

module.exports = router;
