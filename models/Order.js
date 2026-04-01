/**
 * Order Model
 */
class Order {
  constructor(id, userId, items, totalPrice, status = 'pending', pickupTime = null) {
    this.id = id;
    this.userId = userId;
    this.items = items; // Array of {itemId, quantity, price}
    this.totalPrice = totalPrice;
    this.status = status; // 'pending', 'received', 'preparing', 'ready', 'delivered', 'cancelled'
    this.pickupTime = pickupTime; // ISO string for scheduled pickup
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Order;
