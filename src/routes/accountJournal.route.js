const express = require("express");
const router = express.Router();

const accountJournalController = require("../controllers/accountJournal.controller");

router.get('/', accountJournalController.getAll);

router.get('/:id', accountJournalController.getById);

router.post('/', accountJournalController.create);

module.exports = router;
