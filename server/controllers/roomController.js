const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const { title } = req.body;
    const roomCode = await Room.generateRoomCode();

    const room = new Room({
      roomCode,
      title: title || 'My Meeting',
      host: req.user._id,
      participants: [{ user: req.user._id }]
    });

    await room.save();
    await room.populate('host', 'displayName email avatar');
    await room.populate('participants.user', 'displayName email avatar');

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode, isActive: true });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found or ended' });
    }

    const isParticipant = room.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      room.participants.push({ user: req.user._id });
      await room.save();
    }

    await room.populate('host', 'displayName email avatar');
    await room.populate('participants.user', 'displayName email avatar');

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error joining room', error: error.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode })
      .populate('host', 'displayName email avatar')
      .populate('participants.user', 'displayName email avatar');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
};

exports.endRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only host can end the meeting' });
    }

    room.isActive = false;
    room.endedAt = new Date();
    await room.save();

    res.json({ message: 'Meeting ended', room });
  } catch (error) {
    res.status(500).json({ message: 'Error ending room', error: error.message });
  }
};

exports.getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { host: req.user._id },
        { 'participants.user': req.user._id }
      ]
    })
      .populate('host', 'displayName email avatar')
      .populate('participants.user', 'displayName email avatar')
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

exports.getMyMeetings = async (req, res) => {
  try {
    const hostedRooms = await Room.find({ host: req.user._id })
      .populate('host', 'displayName email avatar')
      .populate('participants.user', 'displayName email avatar')
      .sort({ createdAt: -1 });

    const joinedRooms = await Room.find({
      'participants.user': req.user._id,
      host: { $ne: req.user._id }
    })
      .populate('host', 'displayName email avatar')
      .populate('participants.user', 'displayName email avatar')
      .sort({ createdAt: -1 });

    res.json({ hosted: hostedRooms, joined: joinedRooms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
};
