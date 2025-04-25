const express = require('express');
const router = express.Router();
const nicknameController = require('../controllers/nicknameController');

router.post('/save-nickname', nicknameController.saveNickname);

router.get('/get-nickname/:id', nicknameController.getNickname);

module.exports = router;