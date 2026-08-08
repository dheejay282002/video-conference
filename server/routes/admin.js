const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');

const adminOnly = async (req, res, next) => {
  if (req.user.email !== 'admin@videoconf.com') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't delete yourself" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { displayName },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/rooms', auth, adminOnly, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('host', 'displayName email')
      .populate('participants.user', 'displayName email')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/rooms/:id', auth, adminOnly, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    res.json({ totalUsers, totalRooms, activeRooms, recentUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
