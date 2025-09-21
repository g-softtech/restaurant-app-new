import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to create folders
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

// Helper to create placeholder files
const ensureFile = (filePath, content = '') => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content);
};

// --------- FRONTEND ---------
const frontendBase = path.join(__dirname, 'frontend', 'src');

// Create folders
const frontendFolders = [
  'components/common',
  'components/menu',
  'components/cart',
  'components/checkout',
  'components/auth',
  'components/admin',
  'components/profile',
  'pages/admin',
  'hooks',
  'context',
  'services',
  'utils',
  'styles'
];

frontendFolders.forEach((f) => ensureDir(path.join(frontendBase, f)));

// Create placeholder files (add more as needed)
const frontendFiles = [
  'components/common/Header.jsx',
  'components/common/Footer.jsx',
  'components/common/LoadingSpinner.jsx',
  'components/common/ErrorMessage.jsx',
  'components/common/Modal.jsx',
  'components/menu/MenuCard.jsx',
  'components/menu/MenuGrid.jsx',
  'components/menu/CategoryFilter.jsx',
  'components/menu/FoodItem.jsx',
  'components/cart/CartItem.jsx',
  'components/cart/CartSummary.jsx',
  'components/cart/QuantityControls.jsx',
  'components/checkout/CheckoutForm.jsx',
  'components/checkout/PaymentForm.jsx',
  'components/checkout/OrderSummary.jsx',
  'components/auth/LoginForm.jsx',
  'components/auth/RegisterForm.jsx',
  'components/auth/ProtectedRoute.jsx',
  'components/admin/AdminLayout.jsx',
  'components/admin/MenuManagement.jsx',
  'components/admin/OrderManagement.jsx',
  'components/admin/Dashboard.jsx',
  'components/profile/ProfileInfo.jsx',
  'components/profile/OrderHistory.jsx',
  'components/profile/AddressBook.jsx',
  'pages/Home.jsx',
  'pages/Menu.jsx',
  'pages/Cart.jsx',
  'pages/Checkout.jsx',
  'pages/OrderConfirmation.jsx',
  'pages/OrderTracking.jsx',
  'pages/Profile.jsx',
  'pages/Login.jsx',
  'pages/Register.jsx',
  'pages/admin/AdminDashboard.jsx',
  'pages/admin/ManageMenu.jsx',
  'pages/admin/ManageOrders.jsx',
  'hooks/useAuth.js',
  'hooks/useCart.js',
  'hooks/useLocalStorage.js',
  'hooks/useApi.js',
  'context/AuthContext.jsx',
  'context/CartContext.jsx',
  'context/ThemeContext.jsx',
  'services/api.js',
  'services/authService.js',
  'services/menuService.js',
  'services/orderService.js',
  'services/paymentService.js',
  'utils/helpers.js',
  'utils/constants.js',
  'utils/formatters.js',
  'utils/validation.js',
  'styles/globals.css',
  'styles/components.css',
  'App.jsx',
  'index.js',
  'setupTests.js'
];

frontendFiles.forEach((file) => ensureFile(path.join(frontendBase, file), '// placeholder'));

ensureDir(path.join(__dirname, 'frontend', 'public', 'images/food'));
ensureFile(path.join(__dirname, 'frontend', 'public/index.html'), '<!-- HTML placeholder -->');
ensureFile(path.join(__dirname, 'frontend', 'public/favicon.ico'), '');

// --------- BACKEND ---------
const backendBase = path.join(__dirname, 'backend', 'src');

// Create folders
const backendFolders = [
  'controllers',
  'middleware',
  'models',
  'routes',
  'services',
  'utils',
  'config'
];

backendFolders.forEach((f) => ensureDir(path.join(backendBase, f)));

// Create placeholder backend files
const backendFiles = [
  'controllers/authController.js',
  'controllers/menuController.js',
  'controllers/orderController.js',
  'controllers/userController.js',
  'controllers/adminController.js',
  'middleware/auth.js',
  'middleware/admin.js',
  'middleware/errorHandler.js',
  'middleware/validation.js',
  'middleware/upload.js',
  'models/User.js',
  'models/MenuItem.js',
  'models/Order.js',
  'models/Rider.js',
  'routes/auth.js',
  'routes/menu.js',
  'routes/orders.js',
  'routes/users.js',
  'routes/admin.js',
  'services/authService.js',
  'services/orderService.js',
  'services/paymentService.js',
  'services/emailService.js',
  'utils/database.js',
  'utils/jwt.js',
  'utils/validation.js',
  'utils/helpers.js',
  'config/database.js',
  'config/cloudinary.js',
  'config/stripe.js',
  'app.js'
];

backendFiles.forEach((file) => ensureFile(path.join(backendBase, file), '// placeholder'));

ensureDir(path.join(__dirname, 'backend', 'uploads'));
ensureFile(path.join(__dirname, 'backend/server.js'), '// server entry point');

console.log('Frontend and Backend folder structure created successfully!');
