// keywordSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'utils/AxiosInstance';

export const deleteKeyword = createAsyncThunk(
    'keywords/delete',
    async (id, { rejectWithValue }) => {
        try {
            let token = localStorage.getItem('token');
            const response = await AxiosInstance.delete(`gmb/keywords/${id}`, {
                headers: {
                    Authorization: `${token}`, // Correctly format the Authorization header
                    'Content-Type': 'application/json'
                },
            });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const keywordSlice = createSlice({
    name: 'keywords_delete',
    initialState: {
        loading: false,
        deleting: false,
        error: null,
        success: false,
        keywords: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(deleteKeyword.pending, (state) => {
                state.loading = true;
                state.deleting = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteKeyword.fulfilled, (state, action) => {
                state.loading = false;
                state.deleting = false;
                state.error = null;
                state.success = true;
                // Remove the deleted keyword from state
                state.keywords = state.keywords.filter(keyword => keyword.id !== action.payload);
            })
            .addCase(deleteKeyword.rejected, (state, action) => {
                state.loading = false;
                state.deleting = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export default keywordSlice.reducer;
