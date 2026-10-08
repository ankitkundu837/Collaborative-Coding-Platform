const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = (process.env.MONGO_URI && process.env.MONGO_URI.trim()) || "";
    if (!mongoUri) {
        console.warn("⚠️ MONGO_URI environment variable is not defined. Database features will run in offline mode.");
        return;
    }

    try {
        mongoose.set("bufferCommands", false);
        const connection = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            retryWrites: true
        });

        console.log(`✅ MongoDB Connected successfully: ${connection.connection.host}`);
    } catch (err) {
        console.warn(`⚠️ MongoDB Connection Failed: ${err.message}. Database features will run in offline mode.`);
    }
};

module.exports = connectDB;