const express = require('express');
const router = express.Router();
const playerListController = require('../controllers/playerListController');

router.get('/players', playerListController.getPlayers);

module.exports = router;