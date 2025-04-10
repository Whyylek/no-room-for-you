const express = require('express');
const router = express.Router();
const nicknameController = require('../controllers/nicknameController');

// POST /api/save-nickname
router.post('/save-nickname', nicknameController.saveNickname);

// GET /api/get-nickname
router.get('/get-nickname/:id', nicknameController.getNickname);

module.exports = router;