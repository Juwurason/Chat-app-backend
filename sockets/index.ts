import { Socket } from 'socket.io';
import User from '../modals/user'
import Message from '../modals/message';

export const setupSocketEvents = (io: Socket) => {
    io.on('connection', async (socket: Socket) => {
        console.log('A user connected');

        // Update user's online status in the database
        try {
            await User.findByIdAndUpdate(socket.id, { online: true });
            console.log(`User ${socket.id} is online`);
        } catch (error) {
            console.error('Error updating user online status:', error);
        }

        // Emit user online event to all clients
        io.emit('user online', { userId: socket.id });

        // User registration
        socket.on('register', async (username: string) => {
            try {
                const user = await User.create({ username, online: true });
                socket.join(username);
                console.log(`User ${username} registered`);
                // Emit a success message to the client
                socket.emit('register success', { message: 'User registered successfully', user });
            } catch (error) {
                console.error('Error registering user:', error);
                // Emit an error message to the client
                socket.emit('register error', { message: 'Failed to register user', error: error });
            }
        });

        // Group chat message
        socket.on('group message', async (data: { username: string; message: string }) => {
            try {
                console.log(`Group message from ${data.username}: ${data.message}`);
                io.emit('group message', data);
                // Emit message delivered event to the client
                io.emit('message delivered', { messageId: 'group', sender: data.username });
            } catch (error) {
                console.error('Error sending group message:', error);
            }
        });

        // Private chat message
        socket.on('private message', async (data: { sender: string; receiver: string; message: string }) => {
            try {
                console.log(`Private message from ${data.sender} to ${data.receiver}: ${data.message}`);
                await Message.create({ sender: data.sender, receiver: data.receiver, text: data.message });
                // Emit message delivered event to the sender and receiver
                io.to(data.sender).emit('message received', data);
                io.to(data.receiver).emit('message received', data);
            } catch (error) {
                console.error('Error sending private message:', error);
            }
        });

        // Typing indicator
        socket.on('typing', (data: { sender: string; receiver: string }) => {
            try {
                // Broadcast typing indicator to receiver
                io.to(data.receiver).emit('typing', { sender: data.sender });
                // Emit typing event to the sender
                io.to(data.sender).emit('typing', { receiver: data.receiver });
            } catch (error) {
                console.error('Error handling typing indicator:', error);
            }
        });

        // Message acknowledgment
        socket.on('message delivered', (messageId: string) => {
            try {
                // Handle acknowledgment of message delivery
                console.log(`Message ${messageId} delivered`);
                // Emit message delivered event to the client
                io.emit('message delivered', { messageId });
            } catch (error) {
                console.error('Error handling message acknowledgment:', error);
            }
        });

        // User disconnect
        socket.on('disconnect', async () => {
            console.log('User disconnected');
            // Update user's online status in the database
            try {
                await User.findByIdAndUpdate(socket.id, { online: false });
                console.log(`User ${socket.id} is offline`);
            } catch (error) {
                console.error('Error updating user online status:', error);
            }
            // Emit user offline event to all clients
            io.emit('user offline', { userId: socket.id });
        });
    });
};
