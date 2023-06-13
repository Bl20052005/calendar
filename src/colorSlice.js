import { createSlice } from '@reduxjs/toolkit';

export const colorSlice = createSlice({
    name: "dates",
    initialState: {
        undesiredColors: [],
        totalColors: []
    },
    reducers: {
        addUndesiredColor: (state, action) => {
            state.undesiredColors.push(action.payload);
        },

        removeUndesiredColor: (state, action) => {
            state.undesiredColors.splice(action.payload, 1);
        },

        addTotalColor: (state, action) => {
            state.totalColors.push(action.payload);
        },

        removeTotalColor: (state, action) => {
            state.totalColors.splice(action.payload, 1);
        },
    }
})

export const { addUndesiredColor, removeUndesiredColor, addTotalColor, removeTotalColor } = colorSlice.actions;

export default colorSlice.reducer;