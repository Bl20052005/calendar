import { createSlice } from '@reduxjs/toolkit';

export const signInSlice = createSlice({
    name: "signIn",
    initialState : {
        signIn: false,
        user: "",
    },
    reducers: {
        userSignIn: (state, action) => {
            state.signIn = true;
            state.user = action.payload;
        },

        userSignOut: (state) => {
            state.signIn = false;
            state.user = {};
        },
    }
})

export const { userSignIn, userSignOut } = signInSlice.actions;

export default signInSlice.reducer;