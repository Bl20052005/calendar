import { createSlice } from '@reduxjs/toolkit';

export const signInSlice = createSlice({
    name: "signIn",
    initialState : {
        signedIn: false,
        uid: "",
        pfp: "",
        name: "",
        bio: "",
    },
    reducers: {
        updateSignIn: (state, action) => {
            state.signedIn = action.payload;
        },

        updateUid: (state, action) => {
            state.uid = action.payload;
        },

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
            state.uid = "";
            state.signedIn = false;
        }
    }
})

export const { updateSignIn, updateUid, updatePfp, updateName, updateBio, resetSignIn } = signInSlice.actions;

export default signInSlice.reducer;