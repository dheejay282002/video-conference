require('dotenv').config();
const passport = require('./config/passport');
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ExpressPeerServer } = require('peer');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admin');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://voldemortmeet.vercel.app',
  'http://localhost:5173'
].filter(Boolean);

// PeerJS Server
const peerServer = ExpressPeerServer(server, {
  debug: process.env.NODE_ENV === 'development',
  path: '/'
});
app.use('/peerjs', peerServer);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling'],
  allowUpgrades: false,
  perMessageDeflate: false,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store online users per room + lobby
const roomUsers = new Map();
const roomLobby = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', async (roomId, userId, userName, userAvatar) => {
    socket.join(roomId);
    socket.data = { roomId, userId, userName, userAvatar };

    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
    if (!roomLobby.has(roomId)) roomLobby.set(roomId, new Map());

    // Check if this user is the actual host from MongoDB
    let isHost = false;
    try {
      const room = await Room.findOne({ roomCode: roomId });
      if (room && room.host.toString() === userId) {
        isHost = true;
      }
    } catch (err) {
      console.error('Room lookup error:', err.message);
    }

    // Fallback: if room not in DB yet, first socket = host
    if (!isHost && roomUsers.get(roomId).size === 0) {
      isHost = true;
    }

    const users = roomUsers.get(roomId);

    if (isHost) {
      users.set(userId, { socketId: socket.id, userId, userName, userAvatar, isMuted: false, isVideoOff: false });
      socket.to(roomId).emit('user-connected', userId, userName, userAvatar);
      socket.emit('room-users', Array.from(users.values()));
      socket.emit('you-are-host');
      console.log(`Host ${userName} joined room ${roomId}`);
    } else {
      const lobbyEntry = { socketId: socket.id, userId, userName, userAvatar };
      roomLobby.get(roomId).set(userId, lobbyEntry);

      // Find the host socket and notify them
      for (const [hostId, hostData] of users) {
        io.to(hostData.socketId).emit('lobby-join-request', userId, userName, userAvatar, socket.id);
        break;
      }

      socket.emit('waiting-in-lobby');
      console.log(`${userName} waiting in lobby for room ${roomId}`);
    }
  });

  socket.on('lobby-accept', (roomId, joinerUserId) => {
    const lobby = roomLobby.get(roomId);
    const users = roomUsers.get(roomId);
    if (!lobby || !users) return;

    const joiner = lobby.get(joinerUserId);
    if (!joiner) return;

    lobby.delete(joinerUserId);
    users.set(joinerUserId, {
      socketId: joiner.socketId, userId: joiner.userId,
      userName: joiner.userName, userAvatar: joiner.userAvatar,
      isMuted: false, isVideoOff: false
    });

    io.to(joiner.socketId).emit('lobby-accepted');
    socket.to(roomId).emit('user-connected', joiner.userId, joiner.userName, joiner.userAvatar);

    const allUsers = Array.from(users.values());
    io.to(roomId).emit('room-users', allUsers);

    console.log(`${joiner.userName} accepted into room ${roomId}`);
  });

  socket.on('lobby-reject', (roomId, joinerUserId) => {
    const lobby = roomLobby.get(roomId);
    if (!lobby) return;
    const joiner = lobby.get(joinerUserId);
    if (!joiner) return;
    lobby.delete(joinerUserId);
    io.to(joiner.socketId).emit('lobby-rejected');
    console.log(`${joiner.userName} rejected from room ${roomId}`);
  });

  socket.on('kick-user', (roomId, targetUserId) => {
    const users = roomUsers.get(roomId);
    if (!users) return;
    const target = users.get(targetUserId);
    if (!target) return;
    users.delete(targetUserId);
    io.to(target.socketId).emit('user-kicked');
    socket.to(roomId).emit('user-disconnected', targetUserId);
    io.to(roomId).emit('room-users', Array.from(users.values()));
    console.log(`User ${target.userName} kicked from room ${roomId}`);
  });

  socket.on('toggle-mute', (roomId, userId, isMuted) => {
    if (roomUsers.has(roomId) && roomUsers.get(roomId).has(userId)) {
      roomUsers.get(roomId).get(userId).isMuted = isMuted;
      socket.to(roomId).emit('user-toggle-mute', userId, isMuted);
    }
  });

  socket.on('toggle-video', (roomId, userId, isVideoOff) => {
    if (roomUsers.has(roomId) && roomUsers.get(roomId).has(userId)) {
      roomUsers.get(roomId).get(userId).isVideoOff = isVideoOff;
      socket.to(roomId).emit('user-toggle-video', userId, isVideoOff);
    }
  });

  socket.on('chat-message', (roomId, message) => {
    socket.to(roomId).emit('chat-message', message);
  });

  socket.on('end-meeting', (roomId) => {
    io.to(roomId).emit('meeting-ended');
    roomUsers.delete(roomId);
    roomLobby.delete(roomId);
  });

  socket.on('screen-share-started', (roomId, userId) => {
    socket.to(roomId).emit('user-screen-sharing', userId);
  });

  socket.on('screen-share-stopped', (roomId, userId) => {
    socket.to(roomId).emit('user-screen-sharing-stopped', userId);
  });

  socket.on('disconnect', () => {
    const { roomId, userId } = socket.data || {};
    if (roomId && userId) {
      if (roomUsers.has(roomId) && roomUsers.get(roomId).has(userId)) {
        roomUsers.get(roomId).delete(userId);
        socket.to(roomId).emit('user-disconnected', userId);
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
          roomLobby.delete(roomId);
        }
      } else if (roomLobby.has(roomId) && roomLobby.get(roomId).has(userId)) {
        roomLobby.get(roomId).delete(userId);
        const users = roomUsers.get(roomId);
        if (users) {
          for (const [, hostData] of users) {
            io.to(hostData.socketId).emit('lobby-cancelled', userId);
            break;
          }
        }
        if (roomLobby.get(roomId).size === 0) roomLobby.delete(roomId);
      }
    }
  });
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(require('express-session')({ secret: process.env.JWT_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('No MONGODB_URI found. Using in-memory database...');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log('In-memory MongoDB started');
  } else {
    console.log('Attempting to connect to MongoDB Atlas...');
  }

  try {
    await mongoose.connect(mongoUri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB Atlas connection failed:', err.message);
    console.log('Falling back to in-memory database...');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
  }

  const User = require('./models/User');
  const adminExists = await User.findOne({ email: 'admin@videoconf.com' });
  if (!adminExists) {
    const admin = new User({ displayName: 'Admin', email: 'admin@videoconf.com', password: 'admin123' });
    await admin.save();
    console.log('Admin account created: admin@videoconf.com / admin123');
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`PeerJS server: http://localhost:${PORT}/peerjs`);
    console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io };
