import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AxiosInstance } from 'utils/AxiosInstance';

// Define an async thunk for validating the token and fetching user details
export const fetchposts = createAsyncThunk(
  'gmb/getposts',
  async (postData, thunkAPI) => {
    try {
      let id = postData.id
      const token = localStorage.getItem('token'); // Get token from localStorage

      const account = localStorage.getItem('gmb_account_id');
      const accessToken = localStorage.getItem('gmb_access_token');

      if (!token) {
        return thunkAPI.rejectWithValue('No token provided');
      }

      const response = await AxiosInstance.get(
        `gmb/all-posts?accessToken=${accessToken}&account=${account}&location=${id}`,
        {
          headers: {
            Authorization: `${token}`,
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
        return thunkAPI.rejectWithValue('An error occurred while fetching posts.');
      }
    }
  }
);

// Create a slice to handle user state
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    loading: false,
    error: null,
    data: [],
    message: null,
    hasError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchposts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchposts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.posts;
      })
      .addCase(fetchposts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasError = true;
        return location.href = "/notfound";
      });
  },
});

export default postsSlice.reducer;
