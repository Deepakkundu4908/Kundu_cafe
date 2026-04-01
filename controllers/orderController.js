const storage = require('../storage');
const Order = require('../models/Order');

/**
 * Order Controller
 */

// Get user orders
exports.getUserOrders = (req, res) => {
  try {
    if (!res.locals.user) {
      return res.redirect('/auth/login');
    }

    const userId = res.locals.user.id;
    const orders = storage.getOrders();
    const userOrders = orders.filter(order => order.userId == userId);

    res.render('orders', { orders: userOrders, user: res.locals.user });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error fetching orders');
  }
};

// Create new order with pickup time
exports.createOrder = (req, res) => {
  try {
    if (!res.locals.user) {
      return res.redirect('/auth/login');
    }

    const cart = req.session.cart || [];
    if (cart.length === 0) {
      return res.status(400).send('Cart is empty');
    }

    const { pickupDate, pickupTime, notes, payment } = req.body;
    
    // Validate pickup time is in the future
    if (!pickupDate || !pickupTime) {
      return res.status(400).render('checkout', {
        cart,
        message: 'Please select a pickup date and time',
        user: res.locals.user
      });
    }

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
    if (pickupDateTime <= new Date()) {
      return res.status(400).render('checkout', {
        cart,
        message: 'Pickup time must be in the future',
        user: res.locals.user
      });
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (payment === 'wallet') {
      const users = storage.getUsers();
      const user = users.find(u => u.id === res.locals.user.id);
      if (user.walletBalance < totalPrice) {
        return res.status(400).render('checkout', {
          cart,
          message: 'Insufficient wallet balance. Please top up your wallet or choose another payment method.',
          user,
          cartTotal: totalPrice,
          pickupTimes: [],
          minDate: new Date().toISOString().split('T')[0],
          maxDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
        });
      }
      user.walletBalance -= totalPrice;
      storage.saveUsers(users);

      const transactions = storage.getTransactions();
      const newTransaction = new Transaction(Date.now(), user.id, 'purchase', totalPrice, `Order #${Date.now()}`);
      transactions.push(newTransaction);
      storage.saveTransactions(transactions);
    }
    
    // Create order with pickup date and time
    const newOrder = new Order(
      Date.now(), 
      res.locals.user.id, 
      cart, 
      totalPrice, 
      'confirmed', 
      pickupDateTime.toISOString()
    );
    
    // Add order notes and payment method if provided
    newOrder.notes = notes || '';
    newOrder.paymentMethod = payment || 'cash';

    const orders = storage.getOrders();
    orders.push(newOrder);
    storage.saveOrders(orders);

    // Real-time notification: Alert admin about new order
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('newOrder', { order: newOrder });
    }

    // Update item popularity
    const items = storage.getItems();
    cart.forEach(cartItem => {
      const item = items.find(i => i.id == cartItem.id);
      if (item) {
        item.popularity = (item.popularity || 0) + cartItem.quantity;
      }
    });
    storage.saveItems(items);

    req.session.cart = [];
    res.render('order-confirmation', { order: newOrder, user: res.locals.user });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Error creating order');
  }
};

// Get checkout page with time options
exports.getCheckout = (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    // Get item details for cart items
    const items = storage.getItems();
    const enrichedCart = cart.map(cartItem => {
      const item = items.find(i => i.id == cartItem.id);
      return {
        ...cartItem,
        name: item ? item.name : 'Unknown Item',
        dietary: item ? item.dietary : 'N/A',
        category: item ? item.category : 'N/A',
        prepTime: item ? item.prepTime : 15
      };
    });

    const cartTotal = enrichedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate available pickup times for today (next 30 minutes to 2 hours in 15-minute increments)
    const pickupTimes = [];
    const now = new Date();
    const startTime = new Date(now);
    startTime.setMinutes(startTime.getMinutes() + 30); // Start from 30 minutes from now
    
    for (let i = 0; i < 8; i++) {
      const time = new Date(startTime);
      time.setMinutes(time.getMinutes() + (i * 15));
      pickupTimes.push({
        time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        value: time.toTimeString().slice(0, 5),
        prepTime: '15'
      });
    }

    // Set date range: today and tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const minDate = today.toISOString().split('T')[0];
    const maxDate = tomorrow.toISOString().split('T')[0];

    const user = res.locals.user ? storage.getUsers().find(u => u.id === res.locals.user.id) : null;

    res.render('checkout', {
      cart: enrichedCart,
      cartTotal,
      pickupTimes,
      minDate,
      maxDate,
      user,
      message: null
    });
  } catch (error) {
    console.error('Error loading checkout:', error);
    res.status(500).send('Error loading checkout');
  }
};

// Get order details
exports.getOrderDetails = (req, res) => {
  try {
    if (!res.locals.user) {
      return res.redirect('/auth/login');
    }

    const { orderId } = req.params;
    const orders = storage.getOrders();
    const order = orders.find(o => o.id == orderId);

    if (!order || order.userId != res.locals.user.id) {
      return res.status(404).send('Order not found');
    }

    // Get item details
    const items = storage.getItems();
    const orderItemsWithDetails = order.items.map(cartItem => {
      const item = items.find(i => i.id == cartItem.id);
      return {
        ...cartItem,
        name: item ? item.name : 'Unknown Item'
      };
    });

    res.render('order-detail', {
      order: { ...order, items: orderItemsWithDetails },
      user: res.locals.user
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).send('Error fetching order details');
  }
};
