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

const app = express();
const server = http.createServer(app);

// PeerJS Server
const peerServer = ExpressPeerServer(server, {
  debug: process.env.NODE_ENV === 'development',
  path: '/'
});
app.use('/peerjs', peerServer);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store online users per room
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', (roomId, userId, userName, userAvatar) => {
    socket.join(roomId);
    
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Map());
    }
    roomUsers.get(roomId).set(userId, { 
      socketId: socket.id, 
      userId, 
      userName, 
      userAvatar,
      isMuted: false,
      isVideoOff: false
    });

    socket.to(roomId).emit('user-connected', userId, userName, userAvatar);
    
    const users = Array.from(roomUsers.get(roomId).values());
    socket.emit('room-users', users);
    
    console.log(`User ${userName} joined room ${roomId}`);
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
  });

  socket.on('screen-share-started', (roomId, userId) => {
    socket.to(roomId).emit('user-screen-sharing', userId);
  });

  socket.on('screen-share-stopped', (roomId, userId) => {
    socket.to(roomId).emit('user-screen-sharing-stopped', userId);
  });

  socket.on('disconnect', () => {
    for (const [roomId, users] of roomUsers) {
      for (const [userId, data] of users) {
        if (data.socketId === socket.id) {
          users.delete(userId);
          socket.to(roomId).emit('user-disconnected', userId);
          
          if (users.size === 0) {
            roomUsers.delete(roomId);
          }
          return;
        }
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://voldemortmeet.vercel.app',
  'http://localhost:5173'
].filter(Boolean);

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

// Debug endpoint — shows OAuth config (remove after debugging)
app.get('/api/debug/oauth', (req, res) => {
  res.json({
    SERVER_URL: process.env.SERVER_URL || 'NOT SET',
    CLIENT_URL: process.env.CLIENT_URL || 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    expectedCallbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/google/callback`,
    nodeEnv: process.env.NODE_ENV || 'NOT SET'
  });
});

// Global error handler — prevents 500 crashes
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
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');
    
    // Auto-create admin account if it doesn't exist
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@videoconf.com' });
    if (!adminExists) {
      const admin = new User({ displayName: 'Admin', email: 'admin@videoconf.com', password: 'admin123' });
      await admin.save();
      console.log('Admin account created: admin@videoconf.com / admin123');
    }
  } catch (err) {
    console.error('MongoDB Atlas connection failed:', err.message);
    console.log('Falling back to in-memory database...');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
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


