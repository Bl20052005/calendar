import { createSlice } from '@reduxjs/toolkit';

export const colorSlice = createSlice({
    name: "dates",
    initialState: {
        undesiredColors: [],
        totalColors: [],
        totalColorsNumber: {"#9fc0f5" : 0, "#4332d9" : 0, "#ae99e0" : 0, "#320699" : 0, "#c979bf" : 0, "#8a0e79" : 0, "#cf5f66" : 0, "#9e0812" : 0, "#93db7f" : 0, "#26820d" : 0, "#7adedc" : 0, "#0da3a1" : 0},
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

        addTotalColorNumber: (state, action) => {
            state.totalColorsNumber[action.payload]++;
        },

        removeTotalColor: (state, action) => {
            state.totalColorsNumber[action.payload]--;
            if(state.totalColorsNumber[action.payload] <= 0) state.totalColors.splice(state.totalColors.indexOf(action.payload), 1);
        },
    }
})

export const { addUndesiredColor, removeUndesiredColor, addTotalColor, addTotalColorNumber, removeTotalColor } = colorSlice.actions;

export default colorSlice.reducer;