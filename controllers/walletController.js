const storage = require('../storage');
const Transaction = require('../models/Transaction');

/**
 * Wallet Controller
 */

// Get wallet page
exports.getWallet = (req, res) => {
  try {
    const users = storage.getUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const transactions = storage.getTransactions().filter(t => t.userId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.render('wallet', { user, transactions, message: null });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).send('Error fetching wallet');
  }
};

// Top up wallet
exports.topUpWallet = (req, res) => {
  try {
    const { amount } = req.body;
    const topUpAmount = parseInt(amount);

    if (!topUpAmount || topUpAmount <= 0) {
      return res.status(400).render('wallet', {
        user: req.user,
        message: 'Please enter a valid amount'
      });
    }

    const users = storage.getUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.walletBalance += topUpAmount;
    
    const transactions = storage.getTransactions();
    const newTransaction = new Transaction(Date.now(), user.id, 'top-up', topUpAmount, 'Wallet top-up');
    transactions.push(newTransaction);
    
    storage.saveUsers(users);
    storage.saveTransactions(transactions);

    res.redirect('/wallet');
  } catch (error) {
    console.error('Error topping up wallet:', error);
    res.status(500).send('Error topping up wallet');
  }
};
