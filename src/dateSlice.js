import { createSlice } from '@reduxjs/toolkit';

let curDate = new Date();

export const dateSlice = createSlice({
    name: "date",
    initialState: {
        year: curDate.getFullYear(),
        month: curDate.getMonth(),
        day: curDate.getDate(),
        specifics: "month",
    },
    reducers: {
        changeDate: (state, action) => {
            state.year = action.payload.year;
            state.month = action.payload.month;
            state.day = action.payload.day;
        },
    }
})

export const { changeDate, setNumberOfWeeks } = dateSlice.actions;

export default dateSlice.reducer;