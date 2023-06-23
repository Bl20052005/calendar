import { createSlice } from '@reduxjs/toolkit';

const getTimeIn15MinuteIntervals = (hour, minute, wantedFunction) => {
    let returnStr = "";

    let condensedHour = ((hour + 11) % 12 + 1);
    let condensedMinute = Math.ceil(minute / 15) * 15;
    let addedDays = 0;
    let totalHours = hour;

    condensedHour = ((condensedHour + 11 + Math.floor(condensedMinute / 60)) % 12 + 1);
    totalHours += Math.floor(condensedMinute / 60);
    addedDays = Math.floor(totalHours / 24);
    condensedMinute %= 60;

    if(condensedHour < 10) condensedHour = "0" + condensedHour;
    if(condensedMinute < 10) condensedMinute = "0" + condensedMinute;

    returnStr += condensedHour + ":" + condensedMinute;

    if(totalHours % 24 > 11) {
        returnStr += " PM";
    } else {
        returnStr += " AM";
    }

    if(wantedFunction === "date") {
        return Math.floor(condensedMinute / 60) * 60 * 60000;
    }

    return returnStr;
}

let currentDate = new Date();

let currentDateOne = new Date(currentDate.getTime() + (15 - currentDate.getMinutes() % 15) * 60000);
let currentDateTwo = new Date(currentDate.getTime() + (15 - currentDate.getMinutes() % 15) * 60000 + 1800000);

const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const calendarEventSlice = createSlice({
    name: "events",
    initialState: {
        events: {
        "curDateOne" : {"year": currentDateOne.getFullYear(), "month": currentDateOne.getMonth(), "day": currentDateOne.getDate()},
        "curDateTwo" : {"year": currentDateTwo.getFullYear(), "month": currentDateTwo.getMonth(), "day": currentDateTwo.getDate()},
        "dateOneInput" : convertMonths[currentDateOne.getMonth()] + " " + currentDateOne.getDate() + ", " + currentDateOne.getFullYear(),
        "dateTwoInput" : convertMonths[currentDateTwo.getMonth()] + " " + currentDateTwo.getDate() + ", " + currentDateTwo.getFullYear(),
        "curLocation" : "",
        "focusCalendarVisibleOne" : "visibility-hidden",
        "focusCalendarVisibleTwo" : "visibility-hidden",
        "focusTimeVisibleOne" : "visibility-hidden",
        "focusTimeVisibleTwo" : "visibility-hidden",
        "previousTime" : {hour: currentDateOne.getHours() + Math.floor((Math.ceil(currentDateOne.getMinutes() / 15) * 15) / 60), minute: (Math.ceil(currentDateOne.getMinutes() / 15) * 15) % 60},
        "curTimeOne" : getTimeIn15MinuteIntervals(currentDateOne.getHours(), currentDateOne.getMinutes()),
        "curTimeTwo" : getTimeIn15MinuteIntervals(currentDateTwo.getHours(), currentDateTwo.getMinutes()),
        "curTimeDisabled": {"one" : "", "two": ""},
        "isMouseDown" : false,
        "originalCoords" : [0,0],
        "selectedColor" : "#9fc0f5",
        "curTitle" : "",
        "curDescription" : "",
        "wrongInputs" : {"time1" : "", "time2" : "", "date1" : "", "date2": ""},
        "isThisVisible" : "visibility-hidden",
        "functionWanted" : "add",
        "editingIndex" : -1,
        "originalColor": "#9fc0f5",
        "isAllDay" : {"one" : false, "two": false},
        "repeat" : false,
        "repeatSpecifics" : {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []},
        "repeatEnding" : {"never" : false, "onDay" : null, "afterIterations" : null},
        "repeatExceptions" : {},
        },
    },
    reducers: {
        changeSingleCalendarEvent: (state, action) => {
            state.events[action.payload.key] = action.payload.value;
        },
        changeCalendarEvent: (state, action) => {
            state.events = action.payload;
        },
    }
})

export const { changeSingleCalendarEvent, changeCalendarEvent } = calendarEventSlice.actions;

export default calendarEventSlice.reducer;