const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.get('/stories/:storyId', storyController.getStory);

router.post('/update-room-story', storyController.updateRoomStory);

module.exports = router;