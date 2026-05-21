import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  priceHistory: [],
  comparison: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload;
    },
    fetchProductDetailSuccess: (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload;
    },
    fetchHistorySuccess: (state, action) => {
      state.loading = false;
      state.priceHistory = action.payload;
    },
    fetchComparisonSuccess: (state, action) => {
      state.loading = false;
      state.comparison = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStart,
  fetchProductsSuccess,
  fetchProductDetailSuccess,
  fetchHistorySuccess,
  fetchComparisonSuccess,
  fetchFailure,
} = productSlice.actions;

export default productSlice.reducer;
