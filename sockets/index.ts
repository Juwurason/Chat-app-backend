import { Socket } from 'socket.io';
import User from '../modals/user'
import Message from '../modals/message';

export const setupSocketEvents = (io: Socket) => {
    io.on('connection', (socket: Socket) => {
        console.log('A user connected');

        // User registration
        socket.on('register', async (username: string) => {
            try {
                const user = await User.create({ username });
                socket.join(username);
                console.log(`User ${username} registered`);
            } catch (error) {
                console.error('Error registering user:', error);
            }
        });

        // Group chat message
        socket.on('group message', async (data: { username: string; message: string }) => {
            try {
                console.log(`Group message from ${data.username}: ${data.message}`);
                io.emit('group message', data);
            } catch (error) {
                console.error('Error sending group message:', error);
            }
        });

        // Private chat message
        socket.on('private message', async (data: { sender: string; receiver: string; message: string }) => {
            try {
                console.log(`Private message from ${data.sender} to ${data.receiver}: ${data.message}`);
                await Message.create({ sender: data.sender, receiver: data.receiver, text: data.message });
                io.to(data.sender).emit('private message', data);
                io.to(data.receiver).emit('private message', data);
            } catch (error) {
                console.error('Error sending private message:', error);
            }
        });

        // User disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        // Typing indicator
        socket.on('typing', (data: { sender: string; receiver: string }) => {
            try {
                // Broadcast typing indicator to receiver
                io.to(data.receiver).emit('typing', { sender: data.sender });
            } catch (error) {
                console.error('Error handling typing indicator:', error);
            }
        });

        // Message acknowledgment
        socket.on('message delivered', (messageId: string) => {
            try {
                // Handle acknowledgment of message delivery
                console.log(`Message ${messageId} delivered`);
            } catch (error) {
                console.error('Error handling message acknowledgment:', error);
            }
        });

        // User presence tracking
        socket.on('user online', (userId: string) => {
            try {
                // Update user's online status in the database
                console.log(`User ${userId} is online`);
            } catch (error) {
                console.error('Error handling user online event:', error);
            }
        });

        // User presence tracking
        socket.on('user offline', (userId: string) => {
            try {
                // Update user's offline status in the database
                console.log(`User ${userId} is offline`);
            } catch (error) {
                console.error('Error handling user offline event:', error);
            }
        });
    });
};
