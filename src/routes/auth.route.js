const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/signIn", authController.signIn);

router.get("/verifyToken", authController.verifyToken);

// router.get("/forgetPassword", authController.forgetPassword);

router.get("/verifySes", authController.verifySes);

router.post("/forgetPassword", authController.forgetPassword);

module.exports = router;
