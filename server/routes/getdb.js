import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Signature from '../models/Signature.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); 

// Helper to format user data
const formatUser = userDoc =>
    userDoc
        ? {
              username: userDoc.username,
              id: userDoc._id,
              email: userDoc.email,
              publicKey: userDoc.publicKey,
          }
        : null;

// Get user data by user ID
router.post('/getUserData', async (req, res) => {
    try {
        const { uid } = req.body;
        const userDoc = await User.findById(uid);
        res.status(200).json({ user: formatUser(userDoc) });
    } catch (err) {
        res.status(500).json({ message: 'Error getting user data', error: err.message });
    }
});

// Get user data by email
router.post('/getUserDatabyEmail', async (req, res) => {
    try {
        const { email } = req.body;
        const userDoc = await User.findOne({ email });
        res.status(200).json({ user: formatUser(userDoc) });
    } catch (err) {
        res.status(500).json({ message: 'Error getting user data', error: err.message });
    }
});

// Insert a new message (optionally signed)
router.post('/insertMessage', async (req, res) => {
    try {
        const { uid, rcv, msg, signature, isSigned } = req.body;
        const newMessage = new Message({
            sender: uid,
            receiver: rcv,
            message: msg,
            isSigned: isSigned,
        });
        await newMessage.save();
        
        if (isSigned == 'true') {
            const newSignature = new Signature({
                msgid: newMessage._id,
                signedBy: uid,
                signature,
            });
            await newSignature.save();
            newMessage.signature = newSignature._id;
            await newMessage.save();
        }
        else {
            newMessage.signature = null;
            await newMessage.save();
        }

        res.status(200).json({ message: 'Message saved successfully', data: newMessage });
    } catch (err) {
        res.status(500).json({ message: `Error inserting message`, error: err.message });
    }
});

// Get messages between two users
router.get('/messages', async (req, res) => {
    try {
        const { sender, receiver } = req.query;
        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages.reverse());
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages', error: err.message });
    }
});

// Get signatures for a message
router.get('/signature', async (req, res) => {
    try {
        const { msgid } = req.query;
        const signatures = await Signature.find({ msgid });
        res.status(200).json(signatures);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching signatures', error: err.message });
    }
});

export default router;
