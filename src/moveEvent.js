import { createSlice } from '@reduxjs/toolkit';

export const moveEventSlice = createSlice({
    name: "moveEvent",
    initialState: {
        index: -1,
        isMoving: false,
    },
    reducers: {
        changeIndex : (state, action) => {
            state.index = action.payload;
        },

        changeisMoving : (state, action) => {
            state.isMoving = action.payload;
        },
    }
})

export const { changeIndex, changeisMoving } = moveEventSlice.actions;

export default moveEventSlice.reducer;