import { createSlice } from '@reduxjs/toolkit';

export const signInSlice = createSlice({
    name: "signIn",
    initialState : {
        pfp: "",
        name: "",
        bio: "",
    },
    reducers: {
        updatePfp: (state, action) => {
            state.pfp = action.payload;
        },

        updateName: (state, action) => {
            state.name = action.payload;
        },

        updateBio: (state, action) => {
            state.bio = action.payload;
        },

        resetSignIn: (state) => {
            state.pfp = "";
            state.name = "";
            state.bio = "";
        }
    }
})

export const { updatePfp, updateName, updateBio, resetSignIn } = signInSlice.actions;

export default signInSlice.reducer;