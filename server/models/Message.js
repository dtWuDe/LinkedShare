import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isSigned: { type: Boolean, default: false },
    signature: { type: mongoose.Schema.Types.ObjectId, ref: 'Signatures', default: null },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;