require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const clientSessions = require('client-sessions');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routers
const bankingRouter = require('./routes/banking');

// MongoDB Connection String - Replace with your actual MongoDB Atlas connection string
// Note: Password with @ needs to be URL-encoded as %40
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://webbankuser:Siddh@299@webbank.4rxwnhv.mongodb.net/?appName=webbank';

// Always encode the @ in password for MongoDB connection string (required for URLs)
if (MONGODB_URI.includes('Siddh@299')) {
  // URL encode the @ in password for MongoDB connection string
  MONGODB_URI = MONGODB_URI.replace('Siddh@299', 'Siddh%40299');
  // Also ensure database name is included
  if (!MONGODB_URI.includes('/webbank') && MONGODB_URI.includes('/?appName=')) {
    MONGODB_URI = MONGODB_URI.replace('/?appName=', '/webbank?appName=');
  }
}

// Track MongoDB connection state
let isMongoConnected = false;

// Connect to MongoDB
if (MONGODB_URI && !MONGODB_URI.includes('username:password')) {
  mongoose.connect(MONGODB_URI).then(() => {
    isMongoConnected = true;
    console.log('Connected to MongoDB successfully');
  }).catch((err) => {
    isMongoConnected = false;
    console.log('MongoDB connection error:', err.message);
    console.log('Falling back to local JSON files');
  });
  
  // Handle connection events
  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
    console.log('MongoDB connected');
  });
  
  mongoose.connection.on('error', (err) => {
    isMongoConnected = false;
    console.log('MongoDB connection error:', err.message);
  });
  
  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.log('MongoDB disconnected');
  });
} else {
  console.log('MongoDB URI not configured, using local JSON files');
  isMongoConnected = false;
}

// Make connection state available to routes
app.locals.isMongoConnected = () => isMongoConnected;

// Setup Handlebars
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function (a, b) { return a === b; }
  }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Setup client sessions
app.use(clientSessions({
  cookieName: 'session',
  secret: 'webbank_secret_key_12345',
  duration: 24 * 60 * 60 * 1000, // 24 hours
  activeDuration: 1000 * 60 * 5 // 5 minutes
}));

// Make session available in views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Load user data from JSON file
let users = [];
try {
  const userData = fs.readFileSync(path.join(__dirname, 'user.json'), 'utf8');
  users = JSON.parse(userData);
} catch (err) {
  console.log('Error loading user data:', err);
}

// Load account data from JSON file
let localAccounts = [];
try {
  const accountData = fs.readFileSync(path.join(__dirname, 'accounts.json'), 'utf8');
  localAccounts = JSON.parse(accountData);
} catch (err) {
  console.log('Error loading account data:', err);
}

// Make users and accounts available globally
app.locals.users = users;
app.locals.localAccounts = localAccounts;

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.username) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.session && req.session.username) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { title: 'Login - Web Bank' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.username = username;
    res.redirect('/dashboard');
  } else {
    res.render('login', { 
      title: 'Login - Web Bank',
      error: 'Invalid username or password' 
    });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session || !req.session.username) {
    return res.redirect('/login');
  }
  
  res.render('dashboard', { 
    title: 'Dashboard - Web Bank',
    username: req.session.username
  });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/login');
});

// Use banking router
app.use('/', bankingRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Export the app for Vercel serverless functions
module.exports = app;

// For local development, still listen on PORT
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
  });
}

