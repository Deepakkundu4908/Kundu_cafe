const storage = require('../storage');
const Item = require('../models/Item');

/**
 * Admin Controller
 */

// Get admin dashboard
exports.getDashboard = (req, res) => {
  try {
    const items = storage.getItems();
    const orders = storage.getOrders();
    const users = storage.getUsers();

    res.render('admin-panel', {
      totalItems: items.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      recentOrders: orders.slice(-5),
      user: res.locals.user
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
};

// Get all items for admin
exports.getItems = (req, res) => {
  try {
    const items = storage.getItems();
    res.render('admin-items', { items, user: res.locals.user });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
};

// Add new item
exports.addItem = (req, res) => {
  try {
    const io = req.app.get('io');
    const { name, category, price, description, quantity, subcategory, dietary, prepTime } = req.body;
    const items = storage.getItems();

    // Determine image path - from file upload or from input
    let imagePath = '/images/default-product.jpg';
    if (req.file) {
      imagePath = `/images/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const newItem = new Item(
      Date.now(),
      name,
      category,
      parseFloat(price),
      description,
      imagePath,
      parseInt(quantity)
    );

    // Add additional optional fields
    if (subcategory) newItem.subcategory = subcategory;
    if (dietary) newItem.dietary = dietary;
    if (prepTime) newItem.prepTime = parseInt(prepTime);

    items.push(newItem);
    storage.saveItems(items);

    if (io) {
      io.emit('itemStockUpdate', { itemId: newItem.id, isOutOfStock: newItem.isOutOfStock });
    }

    res.redirect('/admin/items?success=Item added successfully');
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).send('Error adding item: ' + error.message);
  }
};

// Update item
exports.updateItem = (req, res) => {
  try {
    const io = req.app.get('io');
    const { itemId } = req.params;
    const { name, category, price, description, quantity, subcategory, dietary, prepTime } = req.body;

    let items = storage.getItems();
    let updatedItemFound = null;
    items = items.map(item => {
      if (item.id == itemId) {
        // Determine image path - new file upload, keep existing, or use input
        let imagePath = item.image; // Keep existing image by default
        
        if (req.file) {
          imagePath = `/images/${req.file.filename}`;
        } else if (req.body.image && req.body.image !== item.image) {
          imagePath = req.body.image;
        }

        const updatedItem = {
          ...item,
          name,
          category,
          price: parseFloat(price),
          description,
          image: imagePath,
          quantity: parseInt(quantity),
          isOutOfStock: false  // Reset on full update
        };

        // Update optional fields
        if (subcategory) updatedItem.subcategory = subcategory;
        if (dietary) updatedItem.dietary = dietary;
        if (prepTime) updatedItem.prepTime = parseInt(prepTime);

        updatedItemFound = updatedItem;
        return updatedItem;
      }
      return item;
    });

    storage.saveItems(items);
    if (io && updatedItemFound) {
      io.emit('itemStockUpdate', { itemId: updatedItemFound.id, isOutOfStock: updatedItemFound.isOutOfStock });
    }
    res.redirect('/admin/items?success=Item updated successfully');
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item: ' + error.message);
  }
};

// Delete item
exports.deleteItem = (req, res) => {
  try {
    const { itemId } = req.params;
    let items = storage.getItems();
    items = items.filter(item => item.id != itemId);
    storage.saveItems(items);

    res.redirect('/admin/items');
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
};

// Get all orders (Pending only, sorted by pickupTime)
exports.getAllOrders = (req, res) => {
  try {
    let orders = storage.getOrders();
    // Filter pending orders and sort by pickupTime
    orders = orders
      .filter(o => o.status === 'pending')
      .sort((a, b) => new Date(a.pickupTime) - new Date(b.pickupTime));
    res.render('admin-orders', { orders, user: res.locals.user });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error fetching orders');
  }
};

// Update order status
exports.updateOrderStatus = (req, res) => {
  try {
    const io = req.app.get('io');
    const { orderId } = req.params;
    const { status } = req.body;

    let orders = storage.getOrders();
    let targetUserId = null;
    const updatedOrders = orders.map(order => {
      if (order.id == orderId) {
        const updatedOrder = { ...order, status, updatedAt: new Date() };
        targetUserId = order.userId;
        if (io) {
          const eventData = { orderId, status };
          if (status === 'ready' && targetUserId) {
            io.to(`user-${targetUserId}`).emit('orderUpdate', eventData);
          } else {
            io.emit('orderUpdate', eventData);
          }
        }
        return updatedOrder;
      }
      return order;
    });

    storage.saveOrders(updatedOrders);
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Error updating order');
  }
};

// Toggle item stock status
exports.toggleStock = (req, res) => {
  try {
    const io = req.app.get('io');
    const { itemId } = req.params;

    let items = storage.getItems();
    let toggledItem = null;
    items = items.map(item => {
      if (item.id == itemId) {
        item.isOutOfStock = !item.isOutOfStock;
        toggledItem = item;
        return item;
      }
      return item;
    });

    storage.saveItems(items);
    if (io && toggledItem) {
      io.emit('itemStockUpdate', { itemId: toggledItem.id, isOutOfStock: toggledItem.isOutOfStock });
    }
    res.redirect('/admin/items');
  } catch (error) {
    console.error('Error toggling stock:', error);
    res.status(500).send('Error toggling stock');
  }
};

// Get item for editing (reuse admin-items with editMode)
exports.getEditItem = (req, res) => {
  try {
    const items = storage.getItems();
    const item = items.find(i => i.id == req.params.itemId);
    if (!item) {
      return res.status(404).send('Item not found');
    }
    res.render('admin-items', { items, item, editMode: true, user: res.locals.user });
  } catch (error) {
    console.error('Error fetching item for edit:', error);
    res.status(500).send('Error fetching item');
  }
};

exports.broadcastMessage = (req, res) => {
  try {
    const { title, message } = req.body;
    const io = req.app.get('io');
    if (io && title && message) {
      io.emit('broadcast', { title, message });
      res.json({ success: true, message: 'Broadcast sent!' });
    } else {
      res.status(400).json({ success: false, error: 'Missing title or message' });
    }
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getDashboard,
  getItems,
  addItem,
  updateItem,
  deleteItem,
  getAllOrders,
  updateOrderStatus,
  toggleStock,
  getEditItem,
  broadcastMessage
};

