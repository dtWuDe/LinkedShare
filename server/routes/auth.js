import express from 'express';
import User from '../models/User.js';
import { hashSHA256, verifyHash } from '../../utils/crypto.js';
import jwt from 'jsonwebtoken';

const router = express.Router();   
const JWT_SECRET = 'your-secret-key';

// User registration
router.post('/signup', async (req, res) => {
    const { username, email, password, publicKey } = req.body.data;
    try {
        const exists = await User.findOne({ email }) || await User.findOne({ username });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await hashSHA256(password);
        const user = new User({ username, email, password: hashedPassword, publicKey });
        await user.save();
        res.json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// Test route to check if the server is running
router.get('/test', (req, res) => {
    res.send('Auth test route is working!');  
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !await verifyHash(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,  
            path: '/',     
            maxAge: 60 * 60 * 1000  
        });

        res.json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            publicKey: user.publicKey
        },
    });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/', // must match the path used in res.cookie
    });
    res.json({ message: 'Logout successful' });
});

export default router;