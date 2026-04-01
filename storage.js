const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Paths to JSON data files
const dataDir = path.join(__dirname, 'data');
const itemsPath = path.join(dataDir, 'items.json');
const usersPath = path.join(dataDir, 'users.json');
const ordersPath = path.join(dataDir, 'orders.json');

const transactionsPath = path.join(dataDir, 'transactions.json');

/**
 * Ensure default admin user exists
 */
const ensureAdminUser = () => {
  if (!fs.existsSync(usersPath) || readData(usersPath).length === 0) {
    const adminPassword = 'adminpassword';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    const adminUser = new User(
      Date.now(),
      'admin',
      'admin@kundu.cafe',
      hashedPassword,
      'admin'
    );
    writeData(usersPath, [adminUser]);
    console.log('Default admin user created.');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminPassword}`);
  }
};

/**
 * Read data from a JSON file
 */
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

/**
 * Write data to a JSON file
 */
const writeData = (filePath, data) => {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
};

// Ensure admin user is created on startup
ensureAdminUser();

// Export functions
module.exports = {
  getItems: () => readData(itemsPath),
  saveItems: (items) => writeData(itemsPath, items),
  
  getUsers: () => readData(usersPath),
  saveUsers: (users) => writeData(usersPath, users),
  
  getOrders: () => readData(ordersPath),
  saveOrders: (orders) => writeData(ordersPath, orders),

  getTransactions: () => readData(transactionsPath),
  saveTransactions: (transactions) => writeData(transactionsPath, transactions)
};
