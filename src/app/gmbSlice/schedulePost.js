// postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { AxiosInstance } from 'utils/AxiosInstance';


export const createGMBSchedulePost = createAsyncThunk(
    'posts/createGMBSchedulePost',
    async (postData, thunkAPI) => {
        try {

            
            const token = localStorage.getItem('token'); 
            const response = await AxiosInstance.post('gmb/schedulepost', postData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            return response?.data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data); // Return the error message
        }
    }
);

const schedulePostsSlice = createSlice({
    name: 'posts', 
    initialState: {
        loading: false,
        error: null,
        successMessage: null,
        hasError: false,
    },
    reducers: {
        // You can add other reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(createGMBPost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createGMBPost.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message; 
                state.hasError = false;
                state.error = null;
                window.location.reload();
            })
            .addCase(createGMBPost.rejected, (state, action) => {
                state.loading = false;
                state.hasError = true;
                state.error = action.payload.errorMessage; 
                toast.error("Something went wrong please try again", {
                    position: "top-right"
                });
            });
    },
});

export default schedulePostsSlice.reducer;
