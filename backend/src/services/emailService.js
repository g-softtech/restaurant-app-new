// src/services/emailService.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send order confirmation email to customer
const sendOrderConfirmation = async (order) => {
  try {
    const transporter = createTransporter();

    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Bella Vista Restaurant" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            table { width: 100%; border-collapse: collapse; }
            .total-row { font-weight: bold; font-size: 18px; background: #fef3c7; }
            .status-badge { background: #fbbf24; color: #78350f; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🍽️ Bella Vista</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Order Confirmation</p>
            </div>
            
            <div class="content">
              <h2>Thank you for your order, ${order.customerInfo.firstName}!</h2>
              <p>We've received your order and we're preparing your delicious meal.</p>
              
              <div class="order-details">
                <h3 style="color: #ea580c;">Order Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Status:</strong> <span class="status-badge">${order.status.toUpperCase()}</span></p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                
                <h4 style="margin-top: 20px;">Items:</h4>
                <table>
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 10px; text-align: left;">Item</th>
                      <th style="padding: 10px; text-align: center;">Qty</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                      <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHTML}
                    <tr class="total-row">
                      <td colspan="3" style="padding: 15px; text-align: right;">Total:</td>
                      <td style="padding: 15px; text-align: right; color: #ea580c;">$${order.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="order-details">
                <h3 style="color: #ea580c;">Delivery Information</h3>
                <p><strong>Address:</strong><br>
                ${order.customerInfo.address}<br>
                ${order.customerInfo.city}, ${order.customerInfo.postalCode || ''}</p>
                <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
                ${order.customerInfo.deliveryInstructions ? `<p><strong>Instructions:</strong> ${order.customerInfo.deliveryInstructions}</p>` : ''}
              </div>
              
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0;"><strong>Track your order:</strong></p>
                <p style="margin: 5px 0 0 0;">Visit <a href="${process.env.FRONTEND_URL}/track-order/${order._id}" style="color: #ea580c;">this link</a> to track your order in real-time.</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Bella Vista Restaurant</p>
              <p style="margin: 5px 0;">Quality food delivered with love ❤️</p>
              <p style="margin: 5px 0; font-size: 12px;">Need help? Contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update email
const sendOrderStatusUpdate = async (order, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      confirmed: {
        title: 'Order Confirmed! 🎉',
        message: 'Great news! Your order has been confirmed and we\'re getting started.',
        color: '#3b82f6'
      },
      preparing: {
        title: 'Cooking in Progress 👨‍🍳',
        message: 'Our chefs are preparing your delicious meal right now!',
        color: '#ea580c'
      },
      ready: {
        title: 'Order Ready! 📦',
        message: 'Your order is ready and will be on its way soon.',
        color: '#8b5cf6'
      },
      out_for_delivery: {
        title: 'On the Way! 🚚',
        message: 'Your order is out for delivery and will arrive soon!',
        color: '#0891b2'
      },
      delivered: {
        title: 'Delivered! Enjoy! 🎉',
        message: 'Your order has been delivered. Enjoy your meal!',
        color: '#16a34a'
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact us.',
        color: '#dc2626'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      title: 'Order Update',
      message: 'Your order status has been updated.',
      color: '#6b7280'
    };

    const mailOptions = {
      from: `"Bella Vista Restaurant" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `${statusInfo.title} - Order ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .status-update { background: white; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid ${statusInfo.color}; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { background: ${statusInfo.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🍽️ Bella Vista</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Order Update</p>
            </div>
            
            <div class="content">
              <div class="status-update">
                <h2 style="color: ${statusInfo.color}; margin: 0 0 15px 0;">${statusInfo.title}</h2>
                <p style="font-size: 16px; margin: 0 0 20px 0;">${statusInfo.message}</p>
                <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p style="margin: 10px 0 20px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.replace('_', ' ').toUpperCase()}</span></p>
                ${order.estimatedDeliveryTime && newStatus === 'out_for_delivery' ? 
                  `<p style="background: #fef3c7; padding: 10px; border-radius: 5px;"><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleString()}</p>` : ''}
                <a href="${process.env.FRONTEND_URL}/track-order/${order._id}" class="button">Track Order</a>
              </div>
              
              <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px;"><strong>💡 Tip:</strong> You can track your order in real-time by clicking the button above or visiting your order history.</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Bella Vista Restaurant</p>
              <p style="margin: 5px 0; font-size: 12px;">Questions? Contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Status update email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

// Send new order alert to admin
const sendAdminOrderAlert = async (order) => {
  try {
    const transporter = createTransporter();

    const itemsList = order.items.map(item => 
      `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const mailOptions = {
      from: `"Bella Vista System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to restaurant email
      subject: `🆕 New Order Received - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .content { background: #f9fafb; padding: 30px; }
            .order-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #ea580c; }
            .button { background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🔔 New Order Alert</h1>
              <p style="margin: 10px 0 0 0;">Action Required</p>
            </div>
            
            <div class="content">
              <div class="alert">
                <strong>⚠️ A new order has been placed and requires your attention!</strong>
              </div>
              
              <div class="order-box">
                <h3 style="color: #ea580c; margin: 0 0 15px 0;">Order Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
                <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              </div>
              
              <div class="order-box">
                <h3 style="color: #ea580c; margin: 0 0 15px 0;">Customer Information</h3>
                <p><strong>Name:</strong> ${order.customerInfo.firstName} ${order.customerInfo.lastName}</p>
                <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
                <p><strong>Email:</strong> ${order.customerInfo.email}</p>
                <p><strong>Address:</strong><br>${order.customerInfo.address}, ${order.customerInfo.city}</p>
                ${order.customerInfo.deliveryInstructions ? `<p><strong>Instructions:</strong> ${order.customerInfo.deliveryInstructions}</p>` : ''}
              </div>
              
              <div class="order-box">
                <h3 style="color: #ea580c; margin: 0 0 15px 0;">Order Items (${order.items.length})</h3>
                <pre style="white-space: pre-wrap; font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 5px;">${itemsList}</pre>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/admin/dashboard" class="button">Go to Dashboard</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin alert email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email on registration
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Bella Vista Restaurant" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Bella Vista! 🍽️',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .feature-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
            .button { background: #ea580c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 20px 0; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">🍽️ Welcome to Bella Vista!</h1>
              <p style="margin: 15px 0 0 0; font-size: 18px;">We're thrilled to have you join our family</p>
            </div>
            
            <div class="content">
              <h2>Hi ${user.name}! 👋</h2>
              <p>Thank you for creating an account with Bella Vista. You're now part of our community of food lovers!</p>
              
              <h3 style="color: #ea580c;">What you can do:</h3>
              
              <div class="feature-box">
                <strong>🍕 Browse Our Menu</strong>
                <p style="margin: 5px 0 0 0; color: #6b7280;">Explore our delicious selection of Italian cuisine</p>
              </div>
              
              <div class="feature-box">
                <strong>🛒 Easy Ordering</strong>
                <p style="margin: 5px 0 0 0; color: #6b7280;">Add items to cart and checkout in seconds</p>
              </div>
              
              <div class="feature-box">
                <strong>📦 Track Orders</strong>
                <p style="margin: 5px 0 0 0; color: #6b7280;">Real-time updates on your order status</p>
              </div>
              
              <div class="feature-box">
                <strong>📋 Order History</strong>
                <p style="margin: 5px 0 0 0; color: #6b7280;">View all your past orders and reorder favorites</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/menu" class="button">Start Ordering</a>
              </div>
              
              <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0;"><strong>🎁 First Order Tip:</strong> Check out our specials section for exclusive deals!</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Bella Vista Restaurant</p>
              <p style="margin: 5px 0;">Authentic Italian cuisine delivered with love</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">Questions? Reply to this email or call us!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendAdminOrderAlert,
  sendWelcomeEmail
};