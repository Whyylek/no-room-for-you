const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// Маршрут для отримання історії
router.get('/stories/:storyId', storyController.getStory);

// Маршрут для оновлення історії в кімнаті
router.post('/update-room-story', storyController.updateRoomStory);

module.exports = router;