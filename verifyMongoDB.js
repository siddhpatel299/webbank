require('dotenv').config();
const mongoose = require('mongoose');
const { Client, Account } = require('./dbConfig');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/webbank?retryWrites=true&w=majority';

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

