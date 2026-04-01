import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { registerRequestHandlers } from './handlers/request-handler';
import { registerRoomHandlers } from './handlers/room-handler';
import { registerPresenceHandlers } from './handlers/presence-handler';

dotenv.config();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; 

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST']
}));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerRequestHandlers(io, socket);
  registerPresenceHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Proxymity Server running on port ${PORT}`);
  console.log(`🔗 Accepting connections from: ${CLIENT_URL}`);
  console.log(`Waiting for agents...\n`);
});