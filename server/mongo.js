import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/linkedshare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

export { connectDB };