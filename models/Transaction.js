/**
 * Transaction Model
 */
class Transaction {
  constructor(id, userId, type, amount, description) {
    this.id = id;
    this.userId = userId;
    this.type = type; // 'top-up' or 'purchase'
    this.amount = amount;
    this.description = description;
    this.date = new Date();
  }
}

module.exports = Transaction;
