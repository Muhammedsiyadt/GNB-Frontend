import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'utils/AxiosInstance';

// Async thunk to fetch grid data
export const fetchGridData = createAsyncThunk(
    'grid/fetchGridData',
    async ({ keyword, placeid, grid }) => {
        const token = localStorage.getItem('token');

        const response = await AxiosInstance.post(
            'gmb/grid',
            {
                keyword,
                placeid,
                grid,
                accessToken: localStorage.getItem('gmb_access_token'),
            },
            {
                headers: {
                    Authorization: `${token}`,
                }
            }
        );

        return response.data;
    }
);


const gridSlice = createSlice({
    name: 'grid',
    initialState: {
        gridData: null,
        status: 'idle',
        error: null,
        loading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGridData.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchGridData.fulfilled, (state, action) => {
                state.status = 'idle';
                state.gridData = action.payload;
                state.loading = false;
            })
            .addCase(fetchGridData.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message;
                state.loading = false;
            });
    },
});

export default gridSlice.reducer;
