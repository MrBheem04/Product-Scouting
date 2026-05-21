import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  coupons: [],
  validationResult: null,
  loading: false,
  error: null,
};

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    couponStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCouponsSuccess: (state, action) => {
      state.loading = false;
      state.coupons = action.payload;
    },
    validateCouponSuccess: (state, action) => {
      state.loading = false;
      state.validationResult = action.payload;
    },
    voteCouponSuccess: (state, action) => {
      state.loading = false;
      const index = state.coupons.findIndex(c => c._id === action.payload.id);
      if (index !== -1) {
        state.coupons[index].upvotes = action.payload.upvotes;
        state.coupons[index].downvotes = action.payload.downvotes;
      }
    },
    couponFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  couponStart,
  fetchCouponsSuccess,
  validateCouponSuccess,
  voteCouponSuccess,
  couponFailure,
} = couponSlice.actions;

export default couponSlice.reducer;
