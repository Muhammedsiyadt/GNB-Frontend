import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosInstance } from "utils/AxiosInstance";



const initialState = {
    loading: false,
    error: null,
    message: null,
    token: null,
};


export const authThunk = createAsyncThunk('auth/login', async (payload, thunkAPI) => {

    const response = await AxiosInstance.post('login', {
        email: payload.email, 
        password: payload.password,
    });
 
    if (response.data.error == true) {
        return thunkAPI.rejectWithValue(response.data);
    }

    if (response.status === 200) {
        return response.data;
    } else {
        return thunkAPI.rejectWithValue({ message: 'An unexpected error occurred' });
    }
})


const authSlice = createSlice({
    name: "login",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(authThunk.pending, (state, action) => {
            state.loading = true;
        })
        builder.addCase(authThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
        })
        builder.addCase(authThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = true;
            state.message = "Invalid email address or password entered";
        })
    }
}); 

export default authSlice.reducer;