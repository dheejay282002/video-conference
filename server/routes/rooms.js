const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  createRoom, 
  joinRoom, 
  getRoom, 
  endRoom, 
  getUserRooms,
  getMyMeetings 
} = require('../controllers/roomController');

// Create a new room
router.post('/create', auth, createRoom);

// Get all user's rooms
router.get('/user/rooms', auth, getUserRooms);

// Get meetings hosted and joined
router.get('/user/meetings', auth, getMyMeetings);

// Get room by code
router.get('/:roomCode', auth, getRoom);

// Join room by code
router.post('/join/:roomCode', auth, joinRoom);

// End room (host only)
router.delete('/:roomCode', auth, endRoom);

module.exports = router;
