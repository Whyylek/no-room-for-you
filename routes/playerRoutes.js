const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController'); // Імпорт контролера

// Перевіряємо, чи правильно експортовані функції з playerController
router.post('/save-player-data', playerController.savePlayerData);
router.get('/player-data', playerController.getPlayerData);
module.exports = router;