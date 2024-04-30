import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: String,
    time: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    attachments: [{ type: String }], // Example: Store URLs of attached files
    reactions: [{ type: String }], // Example: Store emoji reactions
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    messageType: { type: String, enum: ['text', 'image', 'video'], default: 'text' }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
