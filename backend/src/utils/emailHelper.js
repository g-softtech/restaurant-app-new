//  =============================================================================
// 6. Email Notification Helper (utils/emailHelper.js)
// =============================================================================

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">Order Confirmation</h2>
          
          <p>Dear ${order.customer.firstName},</p>
          <p>Thank you for your order! Your order has been confirmed.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total:</strong> ${order.pricing.total.toFixed(2)}</p>
            <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryTime.toLocaleString()}</p>
          </div>
          
          <h3>Items Ordered:</h3>
          <ul>
            ${order.items.map(item => `
              <li>${item.name} x ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>
          
          <p>We'll send you updates as your order is prepared and delivered.</p>
          
          <p>Best regards,<br>Bella Vista Restaurant</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

// Send status update email
exports.sendStatusUpdateEmail = async (order) => {
  try {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      preparing: 'Your order is now being prepared by our kitchen.',
      ready: 'Your order is ready for pickup/delivery.',
      out_for_delivery: 'Your order is out for delivery!',
      delivered: 'Your order has been delivered. Enjoy your meal!'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">Order Update</h2>
          
          <p>Dear ${order.customer.firstName},</p>
          <p>${statusMessages[order.status]}</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
          </div>
          
          <p>Thank you for choosing Bella Vista!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Status update email sent successfully');

  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};