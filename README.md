# VideoConf - Video Conferencing App

A Zoom-like video conferencing web application built with the MERN stack, WebRTC, and PeerJS.

## Features

- **Google OAuth Login** - Sign in with your Gmail account
- **Create Meetings** - Start new video conferences with one click
- **Join by Code** - Enter a 6-digit code to join any meeting
- **HD Video & Audio** - Crystal clear peer-to-peer video calling
- **Screen Sharing** - Share your screen with participants
- **In-meeting Chat** - Text chat during video calls
- **Participant List** - See who's in the meeting
- **Mute/Unmute** - Control your microphone
- **Camera On/Off** - Toggle your video
- **Host Controls** - End meeting for all participants
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, PeerJS, Socket.io-client
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Auth**: Passport.js, Google OAuth 2.0, JWT
- **Video**: WebRTC, PeerJS
- **Real-time**: Socket.io

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Cloud Project with OAuth 2.0 credentials

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Note down Client ID and Client Secret

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example env
cp .env.example server/.env

# Edit server/.env with your values:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - MONGODB_URI
# - JWT_SECRET
```

### 4. Start Development Servers

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### 5. Access the App
Open http://localhost:5173 in your browser

## Project Structure

```
VIDEO CONFERENCE/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React context (Auth)
│   │   ├── hooks/         # Custom hooks (Peer, Socket)
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/            # DB, Passport config
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── package.json
│
└── .env.example
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout user |
| POST | `/api/rooms/create` | Create new room |
| POST | `/api/rooms/join/:code` | Join room by code |
| GET | `/api/rooms/:code` | Get room details |
| DELETE | `/api/rooms/:code` | End room (host) |

## License

MIT
