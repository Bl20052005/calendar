import React from 'react';
import "./calendar_body_day.css";
import { useState, useEffect, useRef } from "react";
import { addEvent, removeEvent, changeEvent } from './redux_slices/eventSlice';
import { useSelector, useDispatch } from 'react-redux';
import { changeDate } from './redux_slices/dateSlice';
import { addUndesiredColor, removeUndesiredColor, addTotalColorNumber, addTotalColor, removeTotalColor, changeTotalColorLabel, changeTotalColorIsLocked } from './redux_slices/colorSlice';
import { changeSingleCalendarEvent, changeCalendarEvent } from './redux_slices/calendarEventSlice';
import { mouseDown, mouseMove, mouseUp, setEditing } from './redux_slices/currentAddition';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';
import getHourAndMinutes from './calendar_body_useful_functions/get_hours_and_minutes';
import PopupPreview from './calendar_body_month_components/popup_preview';

const convertWeeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getHourStr(hour) {
    let returnStr = "";

    let condensedHour = ((hour + 11) % 12 + 1);

    returnStr += condensedHour;

    if(hour % 24 > 11) {
        returnStr += "PM";
    } else {
        returnStr += "AM";
    }

    return returnStr;
}

function getDisplayTime(currentEvents, currentDate, index) {
    let returnStr = "";
    let event = currentEvents[index];
    let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
    let eventStartDate = new Date(event.startDate);
    let eventEndDate = new Date(event.endDate);
    let eventStartTime = new Date(event.startTime);
    let eventEndTime = new Date(event.endTime);
    if(eventStartDate.getTime() === eventEndDate.getTime()) {
        let start = getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes());
        let end = getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes())
        if(start.substring(start.length - 2) === end.substring(end.length - 2)) {
            returnStr = start.substring(0, start.length - 2) + " - " + end;
        } else {
            returnStr = start + " - " + end;
        }
    } else if(eventStartDate.getTime() < curDay.getTime()) {
        if(event.isAllDay.one) returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate() + getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
        else returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + ", " + getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes()) + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate() + ", " + getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
    } else if(eventEndDate.getTime() > curDay.getTime()) {
        if(event.isAllDay.two) returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " " +  + getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes()) + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate();
        else returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + ", " + getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes()) + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate() + ", " + getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
    }

    return returnStr;
}

function CalendarBodyEvents(props) {

    let curDate = props.currentDate;

    const isLongEventAllDay = (event) => {
        if(new Date(event.startDate).getTime() < new Date(curDate.year, curDate.month, curDate.day).getTime() && new Date(event.endDate).getTime() > new Date(curDate.year, curDate.month, curDate.day).getTime()) {
            return false;
        }
        if(new Date(event.startDate).getTime() === new Date(curDate.year, curDate.month, curDate.day).getTime() && event.isAllDay.one) {
            return false;
        }
        if(new Date(event.endDate).getTime() === new Date(curDate.year, curDate.month, curDate.day).getTime() && event.isAllDay.two) {
            return false;
        }
        return true;
    }

    const changeLongObjectStartTimes = (event) => {
        if(new Date(event.startDate).getTime() < new Date(curDate.year, curDate.month, curDate.day).getTime()) {
            let objNow = {"startDate" : curDate.month + 1 + " " + curDate.day + " " + curDate.year, "startTime" : curDate.month + 1 + " " + curDate.day + " " + curDate.year + " 12:00 AM"}
            let returnedObj = Object.assign({...event}, objNow);
            return returnedObj;
        }
        if(new Date(event.endDate).getTime() > new Date(curDate.year, curDate.month, curDate.day).getTime()) {
            let curNewDate = new Date(curDate.year, curDate.month, curDate.day + 1);
            let objNow = {"endDate" : curNewDate.getMonth() + 1 + " " + curNewDate.getDate() + " " + curNewDate.getFullYear(), "endTime" : curNewDate.getMonth() + 1 + " " + curNewDate.getDate() + " " + curNewDate.getFullYear() + " 12:00 AM"}
            let returnedObj = Object.assign({...event}, objNow);
            return returnedObj;
        }

        return event;
    }

    let eventsToday = [...props.currentEvents].map((event, index) => {
        let objNow = {"index" : index}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    }).filter((event) => {
        return event.repeat;
    }).map((event) => {
        return createEventsRepeated(event, new Date(curDate.year, curDate.month, curDate.day).getTime(), new Date(curDate.year, curDate.month, curDate.day + 1).getTime());
    }).flat().filter((event) => {
        return filterEventsStartEnd(event, new Date(curDate.year, curDate.month, curDate.day), new Date(curDate.year, curDate.month, curDate.day), props.currentUnwantedColors);
    }).concat([...props.currentEvents].map((event, index) => {
        let objNow = {"index" : index}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    }).filter((event) => {
        return !event.repeat && filterEventsStartEnd(event, new Date(curDate.year, curDate.month, curDate.day), new Date(curDate.year, curDate.month, curDate.day), props.currentUnwantedColors);
    })).filter((event) => {
        return isLongEventAllDay(event);
    }).map((event) => {
        return changeLongObjectStartTimes(event);
    });

    //console.log(eventsToday)

    let returnEventsLeftArray = [];
    let planeIndex = 0;
    let pushIndex = 0;

    for(let i = 0; i <= 1440; i++) {
        returnEventsLeftArray.push([0,0]);
    }

    //5% if it is within half an hour, else add to the second value
    //

    let ReturnedEventsStartEnd = eventsToday.map((event) => {
        let start = (new Date(event.startTime).getHours() * 60 + new Date(event.startTime).getMinutes());
        let end = (new Date(event.endTime).getHours() * 60 + new Date(event.endTime).getMinutes());
        if(new Date(event.endDate).getTime() > new Date(curDate.year, curDate.month, curDate.day).getTime()) end = 1440;
        if(end - start < 15) {
            if(end === 1440) {
                start = 1425;
            } else {
                end = start + 15;
            }
        }
        return {...event, start, end};
    }).sort((a, b) => {
        if(a.start === b.start) {
            return b.end - a.end;
        }
        return a.start - b.start;
    })

    //three posibilities
    //1: is not connected, meaning that the left will be 0% aka nothing is changed about it
    //2: is connected but is more than 45 / 30 minutes away, this means that it will be pushed forward by around 5%
    //3: is connected and is less than 45 / 30 minutes away, this means it will have a top of
    //5% * forward amount + (1 - 5% * forward amount) * (its number / # of blocks within its plane)
    //idea : plane represented by an index starting at 0, every single time the map runs, the plane will become the next index, however,
    //if a new block is the 3rd option, this will not happen and instead every block from index of plane to index of block will have their
    //left set equal to the current number of lefts

    let eventsArray = [];

    let ReturnedEventsStartEndPrime = ReturnedEventsStartEnd.map((event, index) => {

        let numerator = returnEventsLeftArray[event.start][1];
        let extend = false;
        let numOfTabs = 0;
        let shrinkFactor = 1;
        let fractionFactor = 1;

        if(index < ReturnedEventsStartEnd.length - 1 && ReturnedEventsStartEnd[index + 1].start < Math.min(event.start + 45, event.end)) {
            if(event.start !== ReturnedEventsStartEnd[index + 1].start) {
                extend = true;
            }
        }

        for(let i = 0; i < index; i++) {
            if(ReturnedEventsStartEnd[i].end > event.start && 
            event.start >= Math.min(ReturnedEventsStartEnd[i].start + 45, ReturnedEventsStartEnd[i].end) &&
            eventsArray[i].numerator < 1) {
                numOfTabs++;
            }
        }

        if(numOfTabs > 19) numOfTabs = 19;

        //console.log(numOfTabs)

        let chain = [0];
        let longestChain = [];
        let shrink = [];

        for(let i = 1; i < ReturnedEventsStartEnd.length; i++) {
            let prevElem = ReturnedEventsStartEnd[i - 1];
            let curElem = ReturnedEventsStartEnd[i];
            if(chain.length === 0 || curElem.start < Math.min(prevElem.start + 45, prevElem.end)) {
                chain.push(i);
            } else {
                if(chain.indexOf(index) === -1) {
                    chain = [];
                } else {
                    break;
                }
            }
            // if(curElem.start <= event.end && curElem.end >= event.start) {

            // }
        }

        for(let i = 1; i < ReturnedEventsStartEnd.length; i++) {
            let prevElem = ReturnedEventsStartEnd[i - 1];
            let curElem = ReturnedEventsStartEnd[i];
            let tempChain = [0];
            if(tempChain.length === 0 || curElem.start < Math.min(prevElem.start + 45, prevElem.end)) {
                tempChain.push(i); 
            } else {
                for(let j = 1; j < chain.length; j++) {
                    if(tempChain.indexOf(chain[i]) !== -1) {
                        if(tempChain.length > longestChain.length) {
                            longestChain = tempChain;
                        }
                    }
                }
                tempChain = [];
            }
            // if(curElem.start <= event.end && curElem.end >= event.start) {

            // }
        }

        // console.log("chain " + chain)
        // console.log(longestChain)

        if(index > 0 && event.start < Math.min(ReturnedEventsStartEnd[index - 1].start + 45, ReturnedEventsStartEnd[index - 1].end)) {
            for(let i = ReturnedEventsStartEnd[planeIndex].start; i < event.end; i++) {
                returnEventsLeftArray[i][0] = returnEventsLeftArray[ReturnedEventsStartEnd[planeIndex].start][0];
                returnEventsLeftArray[i][1] = index - planeIndex + 1;
            }
            numerator = index - planeIndex;
            // if(event.start !== ReturnedEventsStartEnd[planeIndex].start) {
            //     extend = true;
            // }
            for(let i = planeIndex; i < index; i++) {
                eventsArray[i]["denominator"] = index - planeIndex + 1;
            }
            eventsArray.push({"index" : index, "numerator" : numerator, "denominator" : index - planeIndex + 1, "tabs" : numOfTabs, "division" : eventsArray[planeIndex].division, "divisionStart" : eventsArray[planeIndex].divisionStart})
        } else if(index > 0 && event.start >= Math.min(ReturnedEventsStartEnd[planeIndex].start + 45, ReturnedEventsStartEnd[planeIndex].end)
        && event.start < ReturnedEventsStartEnd[planeIndex].end) {
            //console.log(returnEventsLeftArray[ReturnedEventsStartEnd[index - 1].start][0])
            for(let i = event.start; i < event.end; i++) {
                returnEventsLeftArray[i][0] = returnEventsLeftArray[ReturnedEventsStartEnd[index - 1].start][0] + 1;
                returnEventsLeftArray[i][1] = 1;
                numerator = 0;
            }
            planeIndex = index;
            pushIndex = planeIndex;
            eventsArray.push({"index" : index, "numerator" : 0, "denominator" : 1, "tabs" : numOfTabs, "division" : 1, "divisionStart" : 0});
        } 
        else if(index > 0 && event.start < ReturnedEventsStartEnd[pushIndex].end) {
            let divisionStart = eventsArray[pushIndex].denominator - 1;
            let division = eventsArray[pushIndex].denominator;
            let subtract = 0;
            for(let i = pushIndex; i < index; i++) {
                // let total = 1;
                // let temp = 0;
                // let top = 1;
                // if(event.start >= ReturnedEventsStartEnd[i].end) {
                //     temp++;
                //     if(i !== pushIndex && ReturnedEventsStartEnd[i].denominator !== ReturnedEventsStartEnd[i - 1].denominator) {

                //     }
                // }
                //slight bug that occurs here, fix later
                if(event.start >= ReturnedEventsStartEnd[i].end) {
                    subtract++;
                }
                if(event.start < ReturnedEventsStartEnd[i].end) {
                    //console.log(event)
                    divisionStart = i - pushIndex + 1 - subtract;
                }
            }
            if(divisionStart === 1 && event.start >= ReturnedEventsStartEnd[pushIndex].start + 45) {
                eventsArray.push({"index" : index, "numerator" : 0, "denominator" : 1, "tabs" : numOfTabs, "division" : 1, "divisionStart" : 0});
                planeIndex = index;
                pushIndex = index;
            } else {
                eventsArray.push({"index" : index, "numerator" : 0, "denominator" : 1, "tabs" : eventsArray[pushIndex].tabs, "division" : division, divisionStart});
                planeIndex = index;
            }

        } 
        else {
            for(let i = event.start; i < event.end; i++) {
                if(i - event.start >= 30) {
                    returnEventsLeftArray[i][0]++;
                }
                else returnEventsLeftArray[i][1]++;
            }
            eventsArray.push({"index" : index, "numerator" : 0, "denominator" : 1, "tabs" : numOfTabs, "division" : 1, "divisionStart" : 0});
            planeIndex = index;
            pushIndex = index;
        }

        //console.log(eventsArray)
        
        let returnedObj = {...event, "numerator" : numerator, "extend" : extend};

        return returnedObj;
    })

    //console.log(eventsArray)

    let ReturnedEventsLeft = ReturnedEventsStartEndPrime.map((event, index) => {

        let tabs = 5 * eventsArray[index].tabs;

        let indentFraction = eventsArray[index].divisionStart / eventsArray[index].division;
        let multiplierFraction = (eventsArray[index].division - eventsArray[index].divisionStart) / eventsArray[index].division;
        let actualFraction = eventsArray[index].numerator / eventsArray[index].denominator;

        let returnLeft = tabs + (indentFraction + multiplierFraction * actualFraction) * (100 - tabs);

        let returnWidth = ((1 / eventsArray[index].denominator) * (100 - 5 * eventsArray[index].tabs) / eventsArray[index].division)* (eventsArray[index].division - eventsArray[index].divisionStart)

        if(event.numerator !== eventsArray[index].denominator - 1 && event.extend) {
            returnWidth *= 1.5;
        }

        return {...event, "start" : event.start / 1440 * 100, "end" : event.end / 1440 * 100, "left" : returnLeft, "width" : returnWidth, "duration" : event.end - event.start}
    }).sort((a, b) => a.left - b.left)

    //console.log(ReturnedEventsLeft)

    const ReturnedEvents = ReturnedEventsLeft.map((event, index) => {

        let fontSize = Math.floor(Math.min(13.5, 50 * event.duration / 60 - 2));
        let direction = "column";
        let textColor = "black";
        let gap = "1px";
        if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
            textColor = "white";
        }
        if(event.duration < 45) {
            direction = "row";
            gap = "10px";
        }

        const handleEventOnClick = (e) => {
            props.setCurEvent({...props.currentEvents[event.index], "index" : event.index});
            let calendarBodyEvents = document.querySelector('.calendar-body-events').getBoundingClientRect();
            let popupPreview = document.querySelector('.popup-preview-container');
            let translateX = "translateX(-50%)";
            let translateY = "translateY(2%)";
            console.log(calendarBodyEvents.right - e.clientX)
            if(calendarBodyEvents.right - e.clientX <= 190) {
                translateX = "translateX(-102%)"
            } else if(e.clientX - calendarBodyEvents.left <= 180) {
                translateX = ""
            }

            if(calendarBodyEvents.bottom - e.clientY <= 230) {
                translateY = "translateY(-102%)";
            } else if(e.clientY - calendarBodyEvents.top <= 230) {
                translateY = "translateY(2%)";
            } else {
                translateY = "translateY(2%)";
            }
            popupPreview.style.top = (e.clientY - calendarBodyEvents.top) + "px";
            popupPreview.style.left = (e.clientX - calendarBodyEvents.left) + "px";
            popupPreview.style.zIndex = "3";
            popupPreview.style.transform = translateX + " " + translateY;
            props.setIsVisible("visibility-visible");
            props.setCurReference(e.target);
        }

        return (<div className='calendar-body-event-container' key={'calendar-body-event-container-' + index} style={{
            "top" : "calc(" + event.start + "%" + " + 6px)", 
            "height" : "calc(" + event.end + "% - " + event.start + "% - 2px)", 
            "left" : event.left + "%", 
            "width" : "calc(" + event.width + "%" + " - 2px)",
            "backgroundColor": event.color}} onClick={(e) => handleEventOnClick(e)}>
                <div className='calendar-body-event-description' style={{
                "flexDirection" : direction,
                "fontSize" : fontSize,
                "color" : textColor,
                "gap" : gap}}
                >
                    <div className='calendar-body-event-time'>{getDisplayTime(props.currentEvents, props.currentDate, event.index)}</div>
                    <div className='calendar-body-event-title'>{event.title}</div>
                </div>
            </div>)
    })

    //console.log(ReturnedEventsLeft)

    return(
        <div className='calendar-body-events'>
            {ReturnedEvents}
        </div>
    )
}

function CalendarBodyLabels(props) {
    let timeArray = [];

    for(let i = 0; i < 24; i++) {
        timeArray.push(i);
    }

    const getHourAndMinutes = (hour, minute) => {
    
        let returnStr = "";
    
        let condensedHour = ((hour + 11) % 12 + 1);
        
        if(minute < 10) minute = "0" + minute;

        returnStr += condensedHour + ":" + minute;
    
        if(hour % 24 > 11) {
            returnStr += " PM";
        } else {
            returnStr += " AM";
        }
    
        return returnStr;
    }

    let timeArrayJSX = timeArray.map((time, index) => {
        const handleOnMouseDown = (e) => {
            let hour = time;
            let minute = 0;
            let curTime = e.clientY - e.target.getBoundingClientRect().top - 6;
            curTime = Math.floor(curTime / 12.5);
            if(curTime < 0 && hour !== 0) {
                hour--;
                minute = 45;
            } else {
                minute = curTime * 15;
            }

            let minuteTwo = (minute + 15) % 60;
            let hourTwo = hour;
            if(minuteTwo === 0) hourTwo++;

            let curDate = {"month" : props.currentDate.month, "day" : props.currentDate.day, "year" : props.currentDate.year};
            let curDateTwo = {"month" : props.currentDate.month, "day" : props.currentDate.day, "year" : props.currentDate.year};
            let datePlusOne = new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day);

            if(hourTwo === 24) {
                hourTwo = 0;
                datePlusOne = new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day + 1);
                curDateTwo = {"month" : datePlusOne.getMonth(), "day" : datePlusOne.getDate(), "year" : datePlusOne.getFullYear()};
            }

            let finalHrOne = getHourAndMinutes(hour, minute)
            let finalHrTwo = getHourAndMinutes(hourTwo, minuteTwo)

            // let EditingObj = {
            //     "curDateOne" : curDate,
            //     "curDateTwo" : curDateTwo,
            //     "dateOneInput" : convertMonths[props.currentDate.month] + " " + props.currentDate.day + ", " + props.currentDate.year,
            //     "dateTwoInput" : convertMonths[datePlusOne.getMonth()] + " " + datePlusOne.getDate() + ", " + datePlusOne.getFullYear(),
            //     "curLocation" : "",
            //     "focusCalendarVisibleOne" : "visibility-hidden",
            //     "focusCalendarVisibleTwo" : "visibility-hidden",
            //     "focusTimeVisibleOne" : "visibility-hidden",
            //     "focusTimeVisibleTwo" : "visibility-hidden",
            //     "previousTime" : {},
            //     "curTimeOne" : finalHrOne,
            //     "curTimeTwo" : finalHrTwo,
            //     "curTimeDisabled": {"one" : "", "two" : ""},
            //     "isMouseDown" : false,
            //     "originalCoords" : [0,0],
            //     "selectedColor" : "#9fc0f5",
            //     "curTitle" : "",
            //     "curDescription" : "",
            //     "wrongInputs" : {"time1" : "", "time2" : "", "date1" : "", "date2": ""},
            //     "isThisVisible" : "visibility-visible",
            //     "functionWanted" : "edit-delete",
            //     "editingIndex" : props.currentEvents.length - 1,
            //     "originalColor" : "#9fc0f5",
            //     "isAllDay" : {"one" : false, "two": false},
            //     "repeat" : false,
            //     "repeatSpecifics" : {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []},
            //     "repeatEnding" : {"never" : false, "onDay" : null, "afterIterations" : null},
            //     "repeatExceptions" : {},
            // }

            // props.dispatch(changeCalendarEvent(EditingObj));
            // props.dispatch(setEditing(true));

            props.dispatch(mouseDown({"start" : {...curDate, "time" : finalHrOne}, "end" : {...curDateTwo, "time" : finalHrTwo}}));
            let finalObj = {};
            finalObj["title"] = "[No Title]";
            finalObj["startDate"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year;
            finalObj["endDate"] = curDateTwo.month + 1 + " " + curDateTwo.day + " " + curDateTwo.year;
            finalObj["startTime"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year + " " + finalHrOne;
            finalObj["endTime"] = curDateTwo.month + 1 + " " + curDateTwo.day + " " + curDateTwo.year + " " + finalHrTwo;
            finalObj["rawStartDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
            finalObj["rawStartTime"] = "";
            finalObj["rawEndDate"] = convertMonths[curDateTwo.month] + " " + curDateTwo.day + ", " + curDateTwo.year;
            finalObj["rawEndTime"] = "";
            finalObj["color"] = "#9fc0f5";
            finalObj["location"] = "";
            finalObj["description"] = "";
            finalObj["curDateOne"] = curDate;
            finalObj["curDateTwo"] = curDateTwo;
            finalObj["previousTime"] = {};
            finalObj["isAllDay"] = {"one" : false, "two": false};
            finalObj["curTimeDisabled"] = {"one" : "input-disabled", "two" : "input-disabled"};
            finalObj["repeat"] = false;
            finalObj["repeatSpecifics"] = {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []};
            finalObj["repeatEnding"] = {"never" : false, "onDay" : null, "afterIterations" : null};
            finalObj["repeatExceptions"] = {};
            if(!props.currentAdditionEditing) {
                props.dispatch(addEvent(finalObj));
            }
            else {
                //handleChangeEvent(currentEvents.length-1);
            }

            // console.log(hour + ":" + minute)
        }

        const handleOnMouseMove = (e) => {
            let hour = time;
            let minute = 0;
            let curTime = e.clientY - e.target.getBoundingClientRect().top - 6;
            curTime = Math.floor(curTime / 12.5);
            if(curTime < 0 && hour !== 0) {
                hour--;
                minute = 45;
            } else {
                minute = curTime * 15;
            }

            let finalHr = getHourAndMinutes(hour, minute);
            let curDate = {"month" : props.currentDate.month, "day" : props.currentDate.day, "year" : props.currentDate.year};

            if(props.currentAdditionIsMouseDown) {
                //dispatch(mouseMove({"month" : value.month, "day": value.day, "year" : value.year}));
                let eventNow = {...props.currentEvents[props.currentEvents.length-1]};
                eventNow["endDate"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year;
                eventNow["endTime"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year + " " + finalHr;
                eventNow["rawEndDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
                eventNow["curDateTwo"] = curDate;
                if(!props.currentAdditionEditing) props.dispatch(changeEvent({"index" : props.currentEvents.length-1, "value" : eventNow}));
            }

            // if(props.currentMoveEvent.isMoving) {
            //     handleChangeEventMove(props.currentMoveEvent.index);
            //     props.dispatch(changeHasBeenMoving(true));
            //     setIsVisible("visibility-hidden");
            // }
        }


        return(
            <div className='calendar-body-day-label' key={'calendar-body-day-label-text-' + index} 
            onMouseDown={(e) => handleOnMouseDown(e)}
            onMouseMove={(e) => handleOnMouseMove(e)}>
                <div className='calendar-body-day-label-text'>{getHourStr(time)}</div>
                <div className='calendar-body-day-label-line-vertical'></div>
                <div className='calendar-body-day-label-line-horizontal'></div>
            </div>
        )
    });

    return(
        <div className='calendar-body-day-label-container'>
            {timeArrayJSX}
        </div>
    );
}

function CalendarBody(props) {

    const [isVisible, setIsVisible] = useState("visibility-hidden");
    const [curEvent, setCurEvent] = useState({});
    const [curReference, setCurReference] = useState(useRef());

    return(
        <div className="calendar-body-day">
            <div className='calendar-body-day-date-container'>
                <div className="calendar-body-day-date-weekday">{convertWeeks[new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day).getDay()]}</div>
                <div className="calendar-body-day-date-date">
                    <div className="calendar-body-day-date-month">{convertMonths[props.currentDate.month]}</div>
                    <div className="calendar-body-day-date-day">{props.currentDate.day}</div>
                </div>
            </div>

            <div className='calendar-body-day-main-container'>
                
                <CalendarBodyLabels {...props} />

                <div className='calendar-body-day-events-container'>
                    <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={props.dispatch} setCurReference={setCurReference} currentEvents={props.currentEvents}/>
                    <CalendarBodyEvents {...props} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
                </div>

            </div>

            <div className='calendar-body-day-all-day-events-container'>

            </div>
        </div>
    )
}

function BodyDay() {

    const currentDate = useSelector((state) => state.date);
    const currentEvents = useSelector((state) => state.event.events);
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    // const currentAddition = useSelector((state) => state.currentAddition.currentEvent);
    const currentAdditionIsMouseDown = useSelector((state) => state.currentAddition.isMouseDown);
    const currentAdditionEditing = useSelector((state) => state.currentAddition.isCurrentlyEditing);
    // const currentMoveEvent = useSelector((state) => state.moveEvent);
    // const currentViewAll = useSelector((state) => state.viewAll.contents);
    const dispatch = useDispatch();
    return(
        <div className="calendar-body-day-container">
            <CalendarBody currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAdditionEditing={currentAdditionEditing} currentAdditionIsMouseDown={currentAdditionIsMouseDown}/>
        </div>
    )
}

export default BodyDay;