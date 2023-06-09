import { createSlice } from '@reduxjs/toolkit';

export const eventSlice = createSlice({
    name: "events",
    initialState: {
        events: [],
    },
    reducers: {
        addEvent: (state, action) => {
            state.events.push(action.payload);
        },
        removeEvent: (state, action) => {
            state.events.splice(action.payload, 1);
        },
        changeEvent: (state, action) => {
            state.events.splice(action.payload[0], 1, action.payload[1])
        }
    }
})

export const { addEvent, removeEvent, changeEvent } = eventSlice.actions;

export default eventSlice.reducer;