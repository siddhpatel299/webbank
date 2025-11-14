const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Client, Account } = require('../dbConfig');
const { connectToMongo, getMongoConnectionState } = require('../mongoHelper');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Helper function to check if MongoDB is connected
function isMongoConnected() {
  return getMongoConnectionState();
}

async function ensureMongoConnection() {
  if (!isMongoConnected()) {
    await connectToMongo();
  }
  return isMongoConnected();
}

// Helper function to get user accounts
async function getUserAccounts(username) {
  // Check if MongoDB is connected first
  if (await ensureMongoConnection()) {
    try {
      // Try MongoDB first
      const client = await Client.findOne({ username: username });
      if (client) {
        let accounts = [];
        if (client.chequing) {
          const chqAccount = await Account.findOne({ id: client.chequing });
          if (chqAccount) accounts.push(chqAccount);
        }
        if (client.savings) {
          const savAccount = await Account.findOne({ id: client.savings });
          if (savAccount) accounts.push(savAccount);
        }
        return accounts;
      }
    } catch (err) {
      console.log('MongoDB query error, using local data:', err.message);
    }
  }
  
  // Fallback to local JSON files
  const localAccounts = require('../accounts.json');
  const clientsData = getLocalClients();
  const client = clientsData.find(c => c.username === username);
  
  if (client) {
    let accounts = [];
    if (client.chequing) {
      const chqAcc = localAccounts.find(a => a.id === client.chequing);
      if (chqAcc) accounts.push(chqAcc);
    }
    if (client.savings) {
      const savAcc = localAccounts.find(a => a.id === client.savings);
      if (savAcc) accounts.push(savAcc);
    }
    return accounts;
  }
  
  return [];
}

// Helper function to get local clients
function getLocalClients() {
  return [
    { username: 'george.tsang@senecapolytechnic.ca', chequing: '1000001', savings: '1000002' },
    { username: 'john@beatles.uk', chequing: '1000011', savings: null },
    { username: 'paul@beatles.uk', chequing: null, savings: '1000022' },
    { username: 'george@beatles.uk', chequing: '1000031', savings: '1000032' },
    { username: 'ringo@beatles.uk', chequing: null, savings: null },
    { username: 'mick@rollingstones.uk', chequing: '1000051', savings: '1000052' }
  ];
}

// Balance page
router.get('/balance', isAuthenticated, async (req, res) => {
  try {
    const accounts = await getUserAccounts(req.session.username);
    
    res.render('balance', {
      title: 'Check Balance - Web Bank',
      username: req.session.username,
      accounts: accounts
    });
  } catch (err) {
    res.render('balance', {
      title: 'Check Balance - Web Bank',
      username: req.session.username,
      error: 'Error loading accounts'
    });
  }
});

router.post('/balance', isAuthenticated, async (req, res) => {
  try {
    const accountId = req.body.accountId;
    const accounts = await getUserAccounts(req.session.username);
    const account = accounts.find(a => a.id === accountId);
    
    if (account) {
      res.render('balance', {
        title: 'Check Balance - Web Bank',
        username: req.session.username,
        accounts: accounts,
        selectedAccount: account,
        balance: account.balance.toFixed(2)
      });
    } else {
      res.render('balance', {
        title: 'Check Balance - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Account not found'
      });
    }
  } catch (err) {
    res.render('balance', {
      title: 'Check Balance - Web Bank',
      username: req.session.username,
      error: 'Error retrieving balance'
    });
  }
});

// Deposit page
router.get('/deposit', isAuthenticated, async (req, res) => {
  try {
    const accounts = await getUserAccounts(req.session.username);
    
    res.render('deposit', {
      title: 'Deposit - Web Bank',
      username: req.session.username,
      accounts: accounts
    });
  } catch (err) {
    res.render('deposit', {
      title: 'Deposit - Web Bank',
      username: req.session.username,
      error: 'Error loading accounts'
    });
  }
});

router.post('/deposit', isAuthenticated, async (req, res) => {
  try {
    const accountId = req.body.accountId;
    const amount = parseFloat(req.body.amount);
    
    await ensureMongoConnection();
    
    if (!accountId) {
      const accounts = await getUserAccounts(req.session.username);
      return res.render('deposit', {
        title: 'Deposit - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Please select an account'
      });
    }
    
    if (isNaN(amount) || amount <= 0) {
      const accounts = await getUserAccounts(req.session.username);
      return res.render('deposit', {
        title: 'Deposit - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Please enter a valid amount greater than 0'
      });
    }
    
    // Try to update in MongoDB first (only if connected)
    if (isMongoConnected()) {
      try {
        const account = await Account.findOne({ id: accountId });
        if (account) {
          account.balance += amount;
          await account.save();
          
          const accounts = await getUserAccounts(req.session.username);
          return res.render('deposit', {
            title: 'Deposit - Web Bank',
            username: req.session.username,
            accounts: accounts,
            success: `Successfully deposited $${amount.toFixed(2)}. New balance: $${account.balance.toFixed(2)}`
          });
        } else {
          console.log('Account not found in MongoDB:', accountId);
        }
      } catch (mongoErr) {
        console.error('MongoDB update failed:', mongoErr.message);
      }
    } else {
      console.log('MongoDB not connected, cannot process deposit');
    }
    
    // Fallback to local JSON update (only for local development)
    // Note: This won't work on Vercel (read-only filesystem)
    if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
      try {
        const accountsPath = path.join(__dirname, '../accounts.json');
        let localAccounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
        const accountIndex = localAccounts.findIndex(a => a.id === accountId);
        
        if (accountIndex !== -1) {
          localAccounts[accountIndex].balance += amount;
          fs.writeFileSync(accountsPath, JSON.stringify(localAccounts, null, 2));
          
          const accounts = await getUserAccounts(req.session.username);
          return res.render('deposit', {
            title: 'Deposit - Web Bank',
            username: req.session.username,
            accounts: accounts,
            success: `Successfully deposited $${amount.toFixed(2)}. New balance: $${localAccounts[accountIndex].balance.toFixed(2)}`
          });
        }
      } catch (fileErr) {
        console.log('File update failed:', fileErr.message);
      }
    }
    
    // If we get here, something went wrong
    const accounts = await getUserAccounts(req.session.username);
    let errorMsg = 'Account not found or unable to process deposit.';
    if (!isMongoConnected()) {
      errorMsg += ' MongoDB is not connected. Please check your MONGODB_URI environment variable in Vercel.';
    }
    res.render('deposit', {
      title: 'Deposit - Web Bank',
      username: req.session.username,
      accounts: accounts,
      error: errorMsg
    });
  } catch (err) {
    console.error('Deposit error:', err);
    try {
      const accounts = await getUserAccounts(req.session.username);
      res.render('deposit', {
        title: 'Deposit - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Error processing deposit: ' + err.message
      });
    } catch (renderErr) {
      res.render('deposit', {
        title: 'Deposit - Web Bank',
        username: req.session.username,
        error: 'Error processing deposit. Please try again.'
      });
    }
  }
});

// Withdrawal page
router.get('/withdraw', isAuthenticated, async (req, res) => {
  try {
    const accounts = await getUserAccounts(req.session.username);
    
    res.render('withdraw', {
      title: 'Withdraw - Web Bank',
      username: req.session.username,
      accounts: accounts
    });
  } catch (err) {
    res.render('withdraw', {
      title: 'Withdraw - Web Bank',
      username: req.session.username,
      error: 'Error loading accounts'
    });
  }
});

router.post('/withdraw', isAuthenticated, async (req, res) => {
  try {
    const accountId = req.body.accountId;
    const amount = parseFloat(req.body.amount);
    
    await ensureMongoConnection();
    
    if (!accountId) {
      const accounts = await getUserAccounts(req.session.username);
      return res.render('withdraw', {
        title: 'Withdraw - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Please select an account'
      });
    }
    
    if (isNaN(amount) || amount <= 0) {
      const accounts = await getUserAccounts(req.session.username);
      return res.render('withdraw', {
        title: 'Withdraw - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Please enter a valid amount greater than 0'
      });
    }
    
    // Try MongoDB first (only if connected)
    if (isMongoConnected()) {
      try {
        const account = await Account.findOne({ id: accountId });
        if (account) {
          if (account.balance < amount) {
            const accounts = await getUserAccounts(req.session.username);
            return res.render('withdraw', {
              title: 'Withdraw - Web Bank',
              username: req.session.username,
              accounts: accounts,
              error: 'Insufficient funds'
            });
          }
          
          account.balance -= amount;
          await account.save();
          
          const accounts = await getUserAccounts(req.session.username);
          return res.render('withdraw', {
            title: 'Withdraw - Web Bank',
            username: req.session.username,
            accounts: accounts,
            success: `Successfully withdrew $${amount.toFixed(2)}. New balance: $${account.balance.toFixed(2)}`
          });
        } else {
          console.log('Account not found in MongoDB:', accountId);
        }
      } catch (mongoErr) {
        console.error('MongoDB update failed:', mongoErr.message);
      }
    } else {
      console.log('MongoDB not connected, cannot process withdrawal');
    }
    
    // Fallback to local JSON (only for local development)
    // Note: This won't work on Vercel (read-only filesystem)
    if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
      try {
        const accountsPath = path.join(__dirname, '../accounts.json');
        let localAccounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
        const accountIndex = localAccounts.findIndex(a => a.id === accountId);
        
        if (accountIndex !== -1) {
          if (localAccounts[accountIndex].balance < amount) {
            const accounts = await getUserAccounts(req.session.username);
            return res.render('withdraw', {
              title: 'Withdraw - Web Bank',
              username: req.session.username,
              accounts: accounts,
              error: 'Insufficient funds'
            });
          }
          
          localAccounts[accountIndex].balance -= amount;
          fs.writeFileSync(accountsPath, JSON.stringify(localAccounts, null, 2));
          
          const accounts = await getUserAccounts(req.session.username);
          return res.render('withdraw', {
            title: 'Withdraw - Web Bank',
            username: req.session.username,
            accounts: accounts,
            success: `Successfully withdrew $${amount.toFixed(2)}. New balance: $${localAccounts[accountIndex].balance.toFixed(2)}`
          });
        }
      } catch (fileErr) {
        console.log('File update failed:', fileErr.message);
      }
    }
    
    // If we get here, something went wrong
    const accounts = await getUserAccounts(req.session.username);
    let errorMsg = 'Account not found or unable to process withdrawal.';
    if (!isMongoConnected()) {
      errorMsg += ' MongoDB is not connected. Please check your MONGODB_URI environment variable in Vercel.';
    }
    res.render('withdraw', {
      title: 'Withdraw - Web Bank',
      username: req.session.username,
      accounts: accounts,
      error: errorMsg
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    try {
      const accounts = await getUserAccounts(req.session.username);
      res.render('withdraw', {
        title: 'Withdraw - Web Bank',
        username: req.session.username,
        accounts: accounts,
        error: 'Error processing withdrawal: ' + err.message
      });
    } catch (renderErr) {
      res.render('withdraw', {
        title: 'Withdraw - Web Bank',
        username: req.session.username,
        error: 'Error processing withdrawal. Please try again.'
      });
    }
  }
});

// Open account page
router.get('/openaccount', isAuthenticated, async (req, res) => {
  try {
    const accounts = await getUserAccounts(req.session.username);
    const hasChequing = accounts.some(a => a.accountType === 'Chequing');
    const hasSavings = accounts.some(a => a.accountType === 'Savings');
    
    res.render('openaccount', {
      title: 'Open Account - Web Bank',
      username: req.session.username,
      hasChequing: hasChequing,
      hasSavings: hasSavings,
      canOpenChequing: !hasChequing,
      canOpenSavings: !hasSavings
    });
  } catch (err) {
    res.render('openaccount', {
      title: 'Open Account - Web Bank',
      username: req.session.username,
      error: 'Error loading account information'
    });
  }
});

router.post('/openaccount', isAuthenticated, async (req, res) => {
  try {
    const accountType = req.body.accountType;
    const initialDeposit = parseFloat(req.body.initialDeposit) || 0;
    
    if (!accountType || (accountType !== 'Chequing' && accountType !== 'Savings')) {
      const accounts = await getUserAccounts(req.session.username);
      const hasChequing = accounts.some(a => a.accountType === 'Chequing');
      const hasSavings = accounts.some(a => a.accountType === 'Savings');
      
      return res.render('openaccount', {
        title: 'Open Account - Web Bank',
        username: req.session.username,
        hasChequing: hasChequing,
        hasSavings: hasSavings,
        canOpenChequing: !hasChequing,
        canOpenSavings: !hasSavings,
        error: 'Please select a valid account type'
      });
    }
    
    const accounts = await getUserAccounts(req.session.username);
    const accountExists = accounts.some(a => a.accountType === accountType);
    
    if (accountExists) {
      const hasChequing = accounts.some(a => a.accountType === 'Chequing');
      const hasSavings = accounts.some(a => a.accountType === 'Savings');
      
      return res.render('openaccount', {
        title: 'Open Account - Web Bank',
        username: req.session.username,
        hasChequing: hasChequing,
        hasSavings: hasSavings,
        canOpenChequing: !hasChequing,
        canOpenSavings: !hasSavings,
        error: `You already have a ${accountType} account`
      });
    }
    
    // Generate new account ID
    const newAccountId = String(1000000 + Math.floor(Math.random() * 900000));
    
    // Try to create in MongoDB
    try {
      const newAccount = new Account({
        id: newAccountId,
        accountType: accountType,
        balance: initialDeposit
      });
      await newAccount.save();
      
      let client = await Client.findOne({ username: req.session.username });
      if (!client) {
        client = new Client({ username: req.session.username });
      }
      
      if (accountType === 'Chequing') {
        client.chequing = newAccountId;
      } else {
        client.savings = newAccountId;
      }
      await client.save();
      
      const updatedAccounts = await getUserAccounts(req.session.username);
      const hasChequing = updatedAccounts.some(a => a.accountType === 'Chequing');
      const hasSavings = updatedAccounts.some(a => a.accountType === 'Savings');
      
      return res.render('openaccount', {
        title: 'Open Account - Web Bank',
        username: req.session.username,
        hasChequing: hasChequing,
        hasSavings: hasSavings,
        canOpenChequing: !hasChequing,
        canOpenSavings: !hasSavings,
        success: `Successfully opened ${accountType} account #${newAccountId} with balance $${initialDeposit.toFixed(2)}`
      });
    } catch (mongoErr) {
      console.log('MongoDB insert failed, using local storage:', mongoErr.message);
    }
    
    // Fallback to local JSON
    const accountsPath = path.join(__dirname, '../accounts.json');
    let localAccounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
    
    localAccounts.push({
      id: newAccountId,
      accountType: accountType,
      balance: initialDeposit
    });
    
    fs.writeFileSync(accountsPath, JSON.stringify(localAccounts, null, 2));
    
    const updatedAccounts = await getUserAccounts(req.session.username);
    const hasChequing = updatedAccounts.some(a => a.accountType === 'Chequing');
    const hasSavings = updatedAccounts.some(a => a.accountType === 'Savings');
    
    res.render('openaccount', {
      title: 'Open Account - Web Bank',
      username: req.session.username,
      hasChequing: hasChequing,
      hasSavings: hasSavings,
      canOpenChequing: !hasChequing,
      canOpenSavings: !hasSavings,
      success: `Successfully opened ${accountType} account #${newAccountId} with balance $${initialDeposit.toFixed(2)}`
    });
  } catch (err) {
    const accounts = await getUserAccounts(req.session.username);
    const hasChequing = accounts.some(a => a.accountType === 'Chequing');
    const hasSavings = accounts.some(a => a.accountType === 'Savings');
    
    res.render('openaccount', {
      title: 'Open Account - Web Bank',
      username: req.session.username,
      hasChequing: hasChequing,
      hasSavings: hasSavings,
      canOpenChequing: !hasChequing,
      canOpenSavings: !hasSavings,
      error: 'Error creating account: ' + err.message
    });
  }
});

module.exports = router;

