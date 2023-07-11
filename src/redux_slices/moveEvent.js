import { createSlice } from '@reduxjs/toolkit';

export const moveEventSlice = createSlice({
    name: "moveEvent",
    initialState: {
        index: -1,
        isMoving: false,
        hasBeenMoving: false,
        initialTime: ""
    },
    reducers: {
        changeIndex : (state, action) => {
            state.index = action.payload;
        },

        changeisMoving : (state, action) => {
            state.isMoving = action.payload;
        },

        changeHasBeenMoving : (state, action) => {
            state.hasBeenMoving = action.payload;
        },

        setInitialTime : (state, action) => {
            state.initialTime = action.payload;
        }
    }
})

export const { changeIndex, changeisMoving, changeHasBeenMoving, setInitialTime } = moveEventSlice.actions;

export default moveEventSlice.reducer;