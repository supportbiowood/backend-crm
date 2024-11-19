const express = require("express");
const router = express.Router();

const contactChannelController = require("../controllers/contactChannel.controller");

router.post('/', contactChannelController.create);

router.put('/:id', contactChannelController.update);

router.delete('/:id', contactChannelController.delete);

module.exports = router;
