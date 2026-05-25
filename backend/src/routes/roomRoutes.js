const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, getRoom, saveCode } = require('../controllers/roomController');
const protect = require('../middlewares/authMiddleware');

router.post('/create', protect, createRoom);
router.post('/join/:roomId', protect, joinRoom);
router.get('/:roomId', protect, getRoom);
router.put('/:roomId/save', protect, saveCode);

module.exports = router;