/**
 * Item/Product Model
 */
class Item {
  constructor(id, name, category, price, description, image, quantity = 0, isOutOfStock = false) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.description = description;
    this.image = image;
    this.quantity = quantity;
    this.isOutOfStock = isOutOfStock;
    this.createdAt = new Date();
  }
}

module.exports = Item;
