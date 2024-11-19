const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");

router.get("/", eventController.getAll);

router.get("/options", eventController.getAllOptions);

router.get("/:id", eventController.getById);

// router.get("/employee/:id", eventController.getByEmployeeId);

router.post("/", eventController.create);

router.put("/:id", eventController.update);

router.put("/:id/event_cancel", eventController.updateCancelStatus);

router.put("/:id/check_in_start", eventController.updateCheckInStart);

router.put("/:id/check_in_dest", eventController.updateCheckInDest);

router.put("/:id/event_finish", eventController.updateFinishStatus);

router.delete("/:id", eventController.delete);

module.exports = router;
