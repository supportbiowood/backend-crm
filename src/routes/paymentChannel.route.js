const express = require("express");
const router = express.Router();

const paymentChannelController = require("../controllers/paymentChannel.controller");

router.get("/", paymentChannelController.getAll);

router.get("/:id/info", paymentChannelController.getById);

router.get("/employee", paymentChannelController.getAll);

router.post("/", paymentChannelController.create);

module.exports = router;
