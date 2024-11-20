import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AxiosInstance } from 'utils/AxiosInstance';

// Define an async thunk for validating the token and fetching user details
export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      if (!token) {
        return thunkAPI.rejectWithValue('No token provided');
      }

      const response = await AxiosInstance.get('user-details', {
        headers: {
          Authorization: token,
        },
      });
      

      if(response.status == 400){
        return localStorage.clear();
      }

      return response.data.user;
    } catch (error) {
      if (error.response) {
        return thunkAPI.rejectWithValue(error.response.data.message);
      } else {
        return thunkAPI.rejectWithValue('An error occurred while fetching user details.');
      }
    }
  }
);

// Create a slice to handle user state
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
