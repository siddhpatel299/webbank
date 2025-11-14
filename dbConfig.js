const mongoose = require('mongoose');

// Client Schema
const clientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  chequing: {
    type: String,
    default: null
  },
  savings: {
    type: String,
    default: null
  }
});

// Account Schema
const accountSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['Chequing', 'Savings']
  },
  balance: {
    type: Number,
    default: 0.00
  }
});

const Client = mongoose.model('Client', clientSchema);
const Account = mongoose.model('Account', accountSchema);

module.exports = {
  Client,
  Account
};

