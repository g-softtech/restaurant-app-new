import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async ({ category, search } = {}, { rejectWithValue }) => {
    try {
      let url = '/menu';
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu items');
    }
  }
);

const initialState = {
  items: [],
  categories: ['appetizer', 'main-course', 'dessert', 'beverages', 'sides', 'specials'],
  loading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    priceRange: [0, 100],
    isVegetarian: false,
    isAvailable: true,
  },
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.menuItems || action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = menuSlice.actions;
export default menuSlice.reducer;
