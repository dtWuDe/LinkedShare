import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { connectDB } from './mongo.js';
import authRoutes from './routes/auth.js';
import getdbRoutes from './routes/getdb.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3001;

app.use(cors({
    origin: 'https://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/getdb', getdbRoutes);

// HTTPS Setup
const sslOptions = {
    key: fs.readFileSync('./server/config/key.pem'),
    cert: fs.readFileSync('./server/config/cert.pem')
};

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}`);
});