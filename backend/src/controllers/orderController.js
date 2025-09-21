
// =============================================================================
// 2. Orders Controller (controllers/orderController.js)
// =============================================================================

const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      delivery,
      items,
      pricing,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!customer || !delivery || !items || !pricing || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate items exist in menu
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
    
    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more menu items not found'
      });
    }

    // Create new order
    const newOrder = new Order({
      customer,
      delivery,
      items,
      pricing,
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending'
    });

    // Save order
    const savedOrder = await newOrder.save();

    // Send response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: savedOrder
    });

    // TODO: Send email confirmation
    // TODO: Send SMS notification
    // TODO: Notify restaurant dashboard

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: page < Math.ceil(totalOrders / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name category image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Order status updated to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

    // TODO: Send status update notification to customer

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get orders by customer email (for customer tracking)
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { email } = req.params;
    
    const orders = await Order.find({ 'customer.email': email })
      .populate('items.menuItem', 'name category')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentStatus = paymentStatus;
    if (transactionId) {
      order.transactionId = transactionId;
    }

    // If payment is successful, confirm the order
    if (paymentStatus === 'paid' && order.status === 'pending') {
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        notes: 'Payment confirmed, order confirmed'
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};
