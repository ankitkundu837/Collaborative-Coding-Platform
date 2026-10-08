const mongoose = require("mongoose");

const connectDB = async () => {
    let mongoUri = (process.env.MONGO_URI && process.env.MONGO_URI.trim()) || "";
    if (!mongoUri || mongoUri.includes("cluster0.mongodb.net") || mongoUri.includes("<username>")) {
        mongoUri = "mongodb+srv://admin:4UaqIKxEvR1S2pfV@locatordb.nj82y8d.mongodb.net/?appName=LocatorDb";
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