import { createSlice } from '@reduxjs/toolkit';

export const viewAllSlice = createSlice({
    name: "viewAll",
    initialState: {
        contents: {"date" : "", 
        "column" : 0, 
        "row" : 0, 
        "month" : "",
        "day" : "",
        "events" : [], 
        "visibility" : "visibility-hidden",
        "numberOfWeeks" : 5}
    },
    reducers: {
        changeViewAllContents : (state, action) => {
            state.contents = action.payload;
        },

        changeSingleViewAllContents : (state, action) => {
            state.contents[action.payload.key] = action.payload.value;
        },
    }
})

export const { changeViewAllContents, changeSingleViewAllContents } = viewAllSlice.actions;

export default viewAllSlice.reducer;