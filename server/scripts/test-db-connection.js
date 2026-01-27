require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        console.log('URI:', mongoURI);

        mongoose.set('debug', true);

        console.log('Attempting connection (IPv4 forced)...');
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
        });

        console.log('✅ TEST SUCCESS: MongoDB Connected!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        process.exit(1);
    }
};

connectDB();
