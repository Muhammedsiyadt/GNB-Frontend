import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { AxiosInstance } from 'utils/AxiosInstance';

let token = localStorage.getItem('token');

export const saveKeywordToGMB = createAsyncThunk(
  'gmb/saveKeywordToGMB',
  async ({ locationId, tags }, thunkAPI) => {
    try {
      const response = await AxiosInstance.post('gmb/saveKeyword', {
        locationId,
        tags
      },
      {
        headers: {
          Authorization: `${token}`,
          'Content-Type' : 'application/json'
        },
      }
    );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const keywordsSlice = createSlice({
  name: 'keywords',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveKeywordToGMB.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveKeywordToGMB.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(saveKeywordToGMB.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default keywordsSlice.reducer;
