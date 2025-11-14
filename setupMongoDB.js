require('dotenv').config();
const mongoose = require('mongoose');
const { Client, Account } = require('./dbConfig');

// MongoDB Connection String
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://webbankuser:Siddh@299@webbank.4rxwnhv.mongodb.net/?appName=webbank';

// Always encode the @ in password for MongoDB connection string (required for URLs)
if (MONGODB_URI.includes('Siddh@299')) {
  MONGODB_URI = MONGODB_URI.replace('Siddh@299', 'Siddh%40299');
  // Ensure database name is included
  if (!MONGODB_URI.includes('/webbank') && MONGODB_URI.includes('/?appName=')) {
    MONGODB_URI = MONGODB_URI.replace('/?appName=', '/webbank?appName=');
  }
}

// Initial data matching the assignment requirements
const clients = [
  { username: 'george.tsang@senecapolytechnic.ca', chequing: '1000001', savings: '1000002' },
  { username: 'john@beatles.uk', chequing: '1000011', savings: null },
  { username: 'paul@beatles.uk', chequing: null, savings: '1000022' },
  { username: 'george@beatles.uk', chequing: '1000031', savings: '1000032' },
  { username: 'ringo@beatles.uk', chequing: null, savings: null },
  { username: 'mick@rollingstones.uk', chequing: '1000051', savings: '1000052' }
];

const accounts = [
  { id: '1000001', accountType: 'Chequing', balance: 123.45 },
  { id: '1000002', accountType: 'Savings', balance: 0.00 },
  { id: '1000011', accountType: 'Chequing', balance: 0.00 },
  { id: '1000022', accountType: 'Savings', balance: 678.90 },
  { id: '1000031', accountType: 'Chequing', balance: 864.93 },
  { id: '1000032', accountType: 'Savings', balance: 783497.58 },
  { id: '1000051', accountType: 'Chequing', balance: 0.00 },
  { id: '1000052', accountType: 'Savings', balance: 5572.90 }
];

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB successfully!\n');

    // Clear existing data (optional - uncomment if you want to reset)
    console.log('Clearing existing data...');
    await Client.deleteMany({});
    await Account.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert clients
    console.log('Inserting clients...');
    await Client.insertMany(clients);
    console.log(`✅ Inserted ${clients.length} clients\n`);

    // Insert accounts
    console.log('Inserting accounts...');
    await Account.insertMany(accounts);
    console.log(`✅ Inserted ${accounts.length} accounts\n`);

    console.log('═══════════════════════════════════════════════');
    console.log('✅ Database setup complete!');
    console.log('═══════════════════════════════════════════════');
    console.log('\nCollections created:');
    console.log('  • clients (Clients Collection)');
    console.log('  • accounts (Accounts Collection)');
    console.log('\nYou can now use the application with MongoDB!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
    console.error('\nPlease check:');
    console.error('  1. Your .env file has the correct MONGODB_URI');
    console.error('  2. Network Access is configured in MongoDB Atlas');
    console.error('  3. Database user credentials are correct');
    process.exit(1);
  }
}

setupDatabase();

