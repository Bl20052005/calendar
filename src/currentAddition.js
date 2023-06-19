import { createSlice } from '@reduxjs/toolkit';

export const currentAdditionSlice = createSlice({
    name: "currentAddition",
    initialState: {
        currentEvent: {
            "start" : "",
            "end" : ""
        },
        isMouseDown: false,
        isCurrentlyEditing: false,
    },
    reducers: {
        mouseDown : (state, action) => {
            state.currentEvent = action.payload;
            state.isMouseDown = true;
        },

        mouseMove : (state, action) => {
            if(state.isMouseDown) {
                state.currentEvent = {"start" : state.currentEvent.start, "end" : action.payload};
            }
        },

        mouseUp : (state, action) => {
            state.currentEvent = {"start" : state.currentEvent.start, "end" : action.payload};
            state.isMouseDown = false;
        },

        setEditing : (state, action) => {
            state.isCurrentlyEditing = action.payload;
        }
    }
})

export const { mouseDown, mouseMove, mouseUp, setEditing } = currentAdditionSlice.actions;

export default currentAdditionSlice.reducer;