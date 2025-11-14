require('dotenv').config();
const mongoose = require('mongoose');
const { Client, Account } = require('./dbConfig');

let MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://webbankuser:Siddh@299@webbank.4rxwnhv.mongodb.net/?appName=webbank';

// Always encode the @ in password for MongoDB connection string (required for URLs)
if (MONGODB_URI.includes('Siddh@299')) {
  MONGODB_URI = MONGODB_URI.replace('Siddh@299', 'Siddh%40299');
  // Ensure database name is included
  if (!MONGODB_URI.includes('/webbank') && MONGODB_URI.includes('/?appName=')) {
    MONGODB_URI = MONGODB_URI.replace('/?appName=', '/webbank?appName=');
  }
}

async function verifyDatabase() {
  try {
    console.log('Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');
    
    // Count documents
    const clientCount = await Client.countDocuments();
    const accountCount = await Account.countDocuments();
    
    console.log('📊 Database Statistics:');
    console.log('═══════════════════════════════════════════════');
    console.log(`Clients Collection: ${clientCount} documents`);
    console.log(`Accounts Collection: ${accountCount} documents\n`);
    
    // List all clients
    console.log('👥 Clients:');
    console.log('═══════════════════════════════════════════════');
    const clients = await Client.find();
    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.username}`);
      console.log(`   Chequing: ${client.chequing || 'None'}`);
      console.log(`   Savings: ${client.savings || 'None'}`);
      console.log('');
    });
    
    // List all accounts
    console.log('💰 Accounts:');
    console.log('═══════════════════════════════════════════════');
    const accounts = await Account.find();
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. Account #${account.id} - ${account.accountType}: $${account.balance.toFixed(2)}`);
    });
    
    console.log('\n✅ Verification complete!');
    console.log('All data is properly set up in MongoDB.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyDatabase();

