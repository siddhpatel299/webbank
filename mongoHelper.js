const mongoose = require('mongoose');

// MongoDB Connection String
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://webbankuser:Siddh@299@webbank.4rxwnhv.mongodb.net/?appName=webbank';

// Always encode special characters in the password for URLs
if (MONGODB_URI.includes('Siddh@299')) {
  MONGODB_URI = MONGODB_URI.replace('Siddh@299', 'Siddh%40299');
  if (!MONGODB_URI.includes('/webbank') && MONGODB_URI.includes('/?appName=')) {
    MONGODB_URI = MONGODB_URI.replace('/?appName=', '/webbank?appName=');
  }
}

let isMongoConnected = false;
let mongoReadyPromise = null;

async function connectToMongo() {
  if (!MONGODB_URI || MONGODB_URI.includes('username:password')) {
    console.log('MongoDB URI not configured, using local JSON files');
    return false;
  }

  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!mongoReadyPromise) {
    mongoReadyPromise = mongoose
      .connect(MONGODB_URI)
      .then(() => {
        isMongoConnected = true;
        console.log('Connected to MongoDB successfully');
        mongoose.connection.on('disconnected', () => {
          isMongoConnected = false;
          mongoReadyPromise = null;
          console.log('MongoDB disconnected');
        });
        mongoose.connection.on('error', (err) => {
          isMongoConnected = false;
          mongoReadyPromise = null;
          console.log('MongoDB connection error:', err.message);
        });
        return true;
      })
      .catch((err) => {
        isMongoConnected = false;
        mongoReadyPromise = null;
        console.log('MongoDB connection error:', err.message);
        return false;
      });
  }

  return mongoReadyPromise;
}

function getMongoConnectionState() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectToMongo,
  getMongoConnectionState,
};

