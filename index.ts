import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { setupSocketEvents } from './sockets';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// MongoDB connection URL
const MONGO_URL: string = process.env.MONGO_URL || 'mongodb://localhost:27017/my_database'

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((error: Error) => {
        console.error('MongoDB connection error:', error);
    });

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(__dirname + '/client.html');
});

// Setup socket events
io.on('connection', (socket) => {
    setupSocketEvents(socket);
});

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// // Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('An error occurred:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start serving static files from the 'public' directory
app.use(express.static('public'));

// Start the server
// const PORT = process.env.PORT;
const PORT = 3200;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
