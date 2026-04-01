const storage = require('../storage');

/**
 * Cart Controller
 */

// Get cart items
exports.getCart = (req, res) => {
  try {
    const cart = req.session.cart || [];
    const items = storage.getItems();
    
    // Enrich cart items with current product details
    const cartWithDetails = cart.map(cartItem => {
      const item = items.find(i => i.id == cartItem.id);
      return {
        ...cartItem,
        name: item ? item.name : 'Unknown Item',
        dietary: item ? item.dietary : 'N/A',
        category: item ? item.category : 'N/A'
      };
    });

    const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartWithDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.render('cart', { 
      cart: cartWithDetails, 
      totalItems, 
      totalPrice, 
      user: res.locals.user 
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Error fetching cart');
  }
};

// Add item to cart
exports.addToCart = (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const items = storage.getItems();
    const item = items.find(i => i.id == itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const existingItem = req.session.cart.find(ci => ci.id == itemId);
    if (existingItem) {
      existingItem.quantity += parseInt(quantity) || 1;
    } else {
      req.session.cart.push({
        id: itemId,
        quantity: parseInt(quantity) || 1,
        price: item.price,
        name: item.name,
        dietary: item.dietary,
        category: item.category
      });
    }

    res.json({ success: true, message: `${item.name} added to cart` });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Error adding to cart' });
  }
};

// Update item quantity in cart
exports.updateQuantity = (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    if (!req.session.cart) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const item = req.session.cart.find(ci => ci.id == itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      // Remove item if quantity is 0
      req.session.cart = req.session.cart.filter(ci => ci.id != itemId);
    } else {
      item.quantity = qty;
    }

    res.json({ success: true, message: 'Quantity updated' });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Error updating quantity' });
  }
};

// Remove item from cart
exports.removeFromCart = (req, res) => {
  try {
    const { itemId } = req.params;
    if (req.session.cart) {
      req.session.cart = req.session.cart.filter(item => item.id != itemId);
    }
    res.redirect('/cart');
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).send('Error removing from cart');
  }
};

// Clear entire cart
exports.clearCart = (req, res) => {
  try {
    req.session.cart = [];
    res.redirect('/cart');
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).send('Error clearing cart');
  }
};
