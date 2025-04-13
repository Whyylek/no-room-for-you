const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/create-room', roomController.createRoom);
router.post('/find-room', roomController.findRoom);
router.post('/update-room', roomController.updateRoom);

module.exports = router;