// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import menuSlice from './slices/menuSlice';
import orderSlice from './slices/orderSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    menu: menuSlice,
    orders: orderSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;

// // store/slices/authSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // Async thunks for API calls
// export const loginUser = createAsyncThunk(
//   'auth/loginUser',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/auth/login', { email, password });
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Login failed');
//     }
//   }
// );

// export const registerUser = createAsyncThunk(
//   'auth/registerUser',
//   async (userData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/auth/register', userData);
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Registration failed');
//     }
//   }
// );

// export const loadUser = createAsyncThunk(
//   'auth/loadUser',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get('/auth/me');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to load user');
//     }
//   }
// );

// const initialState = {
//   user: JSON.parse(localStorage.getItem('user')) || null,
//   token: localStorage.getItem('token') || null,
//   isAuthenticated: !!localStorage.getItem('token'),
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     logout: (state) => {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         state.error = null;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Register
//       .addCase(registerUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         state.error = null;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Load User
//       .addCase(loadUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(loadUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;
//       })
//       .addCase(loadUser.rejected, (state) => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         state.token = null;
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       });
//   },
// });

// export const { clearError, logout } = authSlice.actions;
// export default authSlice.reducer;

// store/slices/cartSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   items: JSON.parse(localStorage.getItem('cart')) || [],
//   totalAmount: 0,
//   totalItems: 0,
// };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState,
//   reducers: {
//     addToCart: (state, action) => {
//       const { item, quantity = 1 } = action.payload;
//       const existingItem = state.items.find(cartItem => cartItem._id === item._id);

//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         state.items.push({ ...item, quantity });
//       }

//       cartSlice.caseReducers.calculateTotals(state);
//       localStorage.setItem('cart', JSON.stringify(state.items));
//     },
//     removeFromCart: (state, action) => {
//       state.items = state.items.filter(item => item._id !== action.payload);
//       cartSlice.caseReducers.calculateTotals(state);
//       localStorage.setItem('cart', JSON.stringify(state.items));
//     },
//     updateQuantity: (state, action) => {
//       const { id, quantity } = action.payload;
//       const item = state.items.find(item => item._id === id);
      
//       if (item) {
//         if (quantity <= 0) {
//           state.items = state.items.filter(item => item._id !== id);
//         } else {
//           item.quantity = quantity;
//         }
//       }

//       cartSlice.caseReducers.calculateTotals(state);
//       localStorage.setItem('cart', JSON.stringify(state.items));
//     },
//     clearCart: (state) => {
//       state.items = [];
//       state.totalAmount = 0;
//       state.totalItems = 0;
//       localStorage.removeItem('cart');
//     },
//     calculateTotals: (state) => {
//       state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
//       state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//     },
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart, calculateTotals } = cartSlice.actions;
// export default cartSlice.reducer;

// store/slices/menuSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// export const fetchMenuItems = createAsyncThunk(
//   'menu/fetchMenuItems',
//   async ({ category, search } = {}, { rejectWithValue }) => {
//     try {
//       let url = '/menu';
//       const params = new URLSearchParams();
      
//       if (category) params.append('category', category);
//       if (search) params.append('search', search);
      
//       if (params.toString()) {
//         url += `?${params.toString()}`;
//       }

//       const response = await axios.get(url);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu items');
//     }
//   }
// );

// const initialState = {
//   items: [],
//   categories: ['appetizer', 'main-course', 'dessert', 'beverages', 'sides', 'specials'],
//   loading: false,
//   error: null,
//   filters: {
//     category: '',
//     search: '',
//     priceRange: [0, 100],
//     isVegetarian: false,
//     isAvailable: true,
//   },
// };

// const menuSlice = createSlice({
//   name: 'menu',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     clearFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchMenuItems.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchMenuItems.fulfilled, (state, action) => {
//         state.loading = false;
//         state.items = action.payload.menuItems || action.payload;
//       })
//       .addCase(fetchMenuItems.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { setFilters, clearFilters } = menuSlice.actions;
// export default menuSlice.reducer;

// store/slices/orderSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// export const createOrder = createAsyncThunk(
//   'orders/createOrder',
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/orders', orderData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to create order');
//     }
//   }
// );

// export const fetchOrders = createAsyncThunk(
//   'orders/fetchOrders',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get('/orders/my-orders');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
//     }
//   }
// );

// export const fetchOrderById = createAsyncThunk(
//   'orders/fetchOrderById',
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`/orders/${orderId}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
//     }
//   }
// );

// const initialState = {
//   orders: [],
//   currentOrder: null,
//   loading: false,
//   error: null,
//   orderStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
// };

// const orderSlice = createSlice({
//   name: 'orders',
//   initialState,
//   reducers: {
//     clearCurrentOrder: (state) => {
//       state.currentOrder = null;
//     },
//     updateOrderStatus: (state, action) => {
//       const { orderId, status } = action.payload;
//       const order = state.orders.find(order => order._id === orderId);
//       if (order) {
//         order.status = status;
//       }
//       if (state.currentOrder && state.currentOrder._id === orderId) {
//         state.currentOrder.status = status;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create Order
//       .addCase(createOrder.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createOrder.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//         state.orders.unshift(action.payload.order);
//       })
//       .addCase(createOrder.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Fetch Orders
//       .addCase(fetchOrders.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrders.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orders = action.payload.orders || action.payload;
//       })
//       .addCase(fetchOrders.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Fetch Single Order
//       .addCase(fetchOrderById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOrderById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentOrder = action.payload.order;
//       })
//       .addCase(fetchOrderById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearCurrentOrder, updateOrderStatus } = orderSlice.actions;
// export default orderSlice.reducer;