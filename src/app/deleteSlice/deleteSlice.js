// keywordSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'utils/AxiosInstance';

export const deleteLocation = createAsyncThunk(
    'location/delete',
    async (id, { rejectWithValue }) => {
        try {
            let token = localStorage.getItem('token');
            const response = await AxiosInstance.delete(`gmb/location/${id}`, {
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

const DeleteLocationSlice = createSlice({
    name: 'location/delete',
    initialState: {
        loading: false,
        deleting: false,
        error: null,
        success: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(deleteLocation.pending, (state) => {
                state.loading = true;
                state.deleting = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteLocation.fulfilled, (state, action) => {
                state.loading = false;
                state.deleting = false;
                state.error = null;
                state.success = true;
            })
            .addCase(deleteLocation.rejected, (state, action) => {
                state.loading = false;
                state.deleting = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export default DeleteLocationSlice.reducer;
