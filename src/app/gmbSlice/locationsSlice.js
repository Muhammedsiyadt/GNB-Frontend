import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AxiosInstance } from 'utils/AxiosInstance';

// Define an async thunk for validating the token and fetching user details
export const fetchLocations = createAsyncThunk(
  'gmb/getLocations',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      const accountName = localStorage.getItem('gmb_account_name');
      const accessToken = localStorage.getItem('gmb_access_token');

      if (!token) {
        return thunkAPI.rejectWithValue('No token provided');
      }

      const response = await AxiosInstance.get(
        `gmb/get-locations?accessToken=${accessToken}&account_id=${accountName}`,
        {
          headers: {
            Authorization: `${token}`, // Correctly format the Authorization header
          },
        }
      );
      

      if(response.status == 400){
        return localStorage.clear();
      }

      return response.data;
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
const locationsSlice = createSlice({
  name: 'locations',
  initialState: {
    loading: false,
    error: null,
    data: [],
    message: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.accounts;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default locationsSlice.reducer;
