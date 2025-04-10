const express = require('express');
const router = express.Router();
const playerListController = require('../controllers/playerListController');

// GET /api/players — отримати список гравців
router.get('/players', playerListController.getPlayers);

module.exports = router;