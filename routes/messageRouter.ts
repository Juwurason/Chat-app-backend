import express, { Request, Response } from 'express';
import { Types } from 'mongoose'; // Import Types from mongoose
import Message from '../modals/message';

const router = express.Router();

// Endpoint to fetch old messages between two users
router.get('/messages', async (req: Request, res: Response) => {
    try {
        // Extract sender and receiver from query parameters
        const { sender, receiver } = req.query;

        // Convert sender and receiver to ObjectId
        const senderId = new Types.ObjectId(sender as string);
        const receiverId = new Types.ObjectId(receiver as string);

        // Fetch messages between the specified users from the database
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId } // Handle messages in both directions
            ]
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
