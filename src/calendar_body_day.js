import React from 'react';
import "./calendar_body_day.css";
import { useState, useEffect, useRef } from "react";
import { addEvent, removeEvent, changeEvent } from './redux_slices/eventSlice';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';
import { useSelector, useDispatch } from 'react-redux';
import { changeSingleCalendarEvent, changeCalendarEvent } from './redux_slices/calendarEventSlice';
import { mouseDown, mouseMove, mouseUp, setEditing } from './redux_slices/currentAddition';
import { changeIndex, changeisMoving, changeHasBeenMoving, setInitialTime, changeEventType } from './redux_slices/moveEvent';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';
import getHourAndMinutes from './calendar_body_useful_functions/get_hours_and_minutes';
import PopupPreview from './calendar_body_month_components/popup_preview';
import addZeroes from './calendar_shared_components/add_zeroes_to_dates';

const convertWeeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//some noticable bugs:
//stacking calendar dates to the max (ie. 1 hr, 30 min, 15 min) will cause the last few to glitch
//repeats are not working as intended when dragged


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
        let end = getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
        if(start.substring(start.length - 2) === end.substring(end.length - 2)) {
            returnStr = start.substring(0, start.length - 2) + " - " + end;
        } else {
            returnStr = start + " - " + end;
        }
    } else if(eventStartDate.getTime() < curDay.getTime()) {
        if(event.isAllDay.one) returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate() + " " + getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
        else returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + ", " + getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes()) + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate() + ", " + getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
    } else if(eventEndDate.getTime() > curDay.getTime()) {
        if(event.isAllDay.two) returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " " + getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes()) + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate();
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
            let objNow = {"startDate" : curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00", "startTime" : curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00"}
            let returnedObj = Object.assign({...event}, objNow);
            return returnedObj;
        }
        if(new Date(event.endDate).getTime() > new Date(curDate.year, curDate.month, curDate.day).getTime()) {
            let curNewDate = new Date(curDate.year, curDate.month, curDate.day + 1);
            let objNow = {"endDate" : curNewDate.getFullYear() + '-' + addZeroes(curNewDate.getMonth() + 1) + '-' + addZeroes(curNewDate.getDate()) + "T00:00:00", "endTime" : curNewDate.getFullYear() + '-' + addZeroes(curNewDate.getMonth() + 1) + '-' + addZeroes(curNewDate.getDate()) + "T00:00:00"}
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

        if(index > 0 && event.start < Math.min(ReturnedEventsStartEnd[index - 1].start + 45, ReturnedEventsStartEnd[index - 1].end)) {
            for(let i = ReturnedEventsStartEnd[planeIndex].start; i < event.end; i++) {
                returnEventsLeftArray[i][0] = returnEventsLeftArray[ReturnedEventsStartEnd[planeIndex].start][0];
                returnEventsLeftArray[i][1] = index - planeIndex + 1;
            }
            numerator = index - planeIndex;
            for(let i = planeIndex; i < index; i++) {
                eventsArray[i]["denominator"] = index - planeIndex + 1;
            }
            eventsArray.push({"index" : index, "numerator" : numerator, "denominator" : index - planeIndex + 1, "tabs" : numOfTabs, "division" : eventsArray[planeIndex].division, "divisionStart" : eventsArray[planeIndex].divisionStart})
        } else if(index > 0 && event.start >= Math.min(ReturnedEventsStartEnd[planeIndex].start + 45, ReturnedEventsStartEnd[planeIndex].end)
        && event.start < ReturnedEventsStartEnd[planeIndex].end) {
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

        return {...event, "start" : event.start / 1440 * 100, "end" : event.end / 1440 * 100, "left" : returnLeft, "width" : returnWidth, "duration" : event.end - event.start, "startMinutes" : event.start}
    }).sort((a, b) => a.left - b.left)

    //console.log(ReturnedEventsLeft)

    const ReturnedEvents = ReturnedEventsLeft.map((event, index) => {

        let fontSize = Math.floor(Math.min(13.5, 50 * event.duration / 60 - 2));
        let direction = "column";
        let textColor = "black";
        let gap = "1px";
        let pointerEvents = "";
        if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
            textColor = "white";
        }
        if(event.duration < 45) {
            direction = "row";
            gap = "10px";
        }

        if(props.currentAddition.isMouseDown || props.currentMoveEvent.hasBeenMoving) {
            pointerEvents = "none";
        }
        

        const handleEventOnMouseUp = (e) => {
            if(!props.currentMoveEvent.isMoving) {
                props.setCurEvent({...props.currentEvents[event.index], "index" : event.index});
                let calendarBodyEvents = {};
                if(props.currentDate.specifics === "day") calendarBodyEvents = document.querySelector('.calendar-body-day').getBoundingClientRect();
                if(props.currentDate.specifics === "week") calendarBodyEvents = document.querySelector('.calendar-body-week-container').getBoundingClientRect();
                let popupPreview = document.querySelector('.popup-preview-container');
                let translateX = "translateX(-50%)";
                let translateY = "translateY(5%)";
                if(calendarBodyEvents.right - e.clientX <= 190) {
                    translateX = "translateX(-100%)"
                } else if(e.clientX - calendarBodyEvents.left <= 180) {
                    translateX = ""
                }
    
                if(calendarBodyEvents.bottom - e.clientY <= 230) {
                    translateY = "translateY(-105%)";
                } 
                popupPreview.style.top = (e.clientY - calendarBodyEvents.top) / calendarBodyEvents.height * 100 + "%";
                popupPreview.style.left = (e.clientX - calendarBodyEvents.left) / calendarBodyEvents.width * 100 + "%";
                popupPreview.style.zIndex = "4";
                popupPreview.style.transform = translateX + " " + translateY;
                props.setIsVisible("visibility-visible");
                props.setCurReference(e.target);
            }
        }

        const handleEventsOnMouseDown = (e) => {
            let startTime = new Date(props.currentEvents[event.index]["startTime"]).getTime()
            let curTime = e.clientY - e.target.getBoundingClientRect().top;
            curTime = Math.floor(curTime / 12.5) * 15;
            if(startTime < new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day).getTime()) {
                curTime = ((new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day, 0, curTime).getTime() - startTime) / 60000 + (new Date(event.startTime).getHours() * 60 + new Date(event.startTime).getMinutes()))
            }
            
            //console.log(curTime)
            props.dispatch(setInitialTime(curTime));
            props.dispatch(changeEventType("day"));
            props.setCurReference(e.target);
            props.dispatch(changeIndex(event.index));
            props.dispatch(changeisMoving(true));
        }

        //console.log(pointerEvents)

        const handleEventOnMouseMove = (e) => {
            if(props.currentMoveEvent.isMoving) {
                let startTime = new Date(props.currentEvents[event.index]["startTime"]).getTime()
                let curTime = e.clientY - e.target.getBoundingClientRect().top;
                //if(isTouch) curTime = e.touches[0].clientY - e.target.getBoundingClientRect().top;
                curTime = Math.floor(curTime / 12.5) * 15;
                if(startTime < new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day).getTime()) {
                    curTime = ((new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day, 0, curTime).getTime() - startTime) / 60000 + (new Date(event.startTime).getHours() * 60 + new Date(event.startTime).getMinutes()))
                }
                if(curTime !== props.currentMoveEvent.initialTime) {
                    props.dispatch(changeHasBeenMoving(true));
                }
            }
        }

        // const handleEventOnTouchMove = (e) => {

        //     const getHourAndMinutes = (hour, minute) => {
    
        //         let returnStr = "";
            
        //         let condensedHour = ((hour + 11) % 12 + 1);
                
        //         if(minute < 10) minute = "0" + minute;
        
        //         returnStr += condensedHour + ":" + minute;
            
        //         if(hour % 24 > 11) {
        //             returnStr += " PM";
        //         } else {
        //             returnStr += " AM";
        //         }
            
        //         return returnStr;
        //     }

        //     if(props.currentMoveEvent.isMoving) {
        //         let startTime = new Date(props.currentEvents[event.index]["startTime"]).getTime()
        //         let curTime = e.touches[0].clientY - e.target.getBoundingClientRect().top;
        //         curTime = Math.floor(curTime / 12.5) * 15;
        //         if(startTime < new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day).getTime()) {
        //             curTime = ((new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day, 0, curTime).getTime() - startTime) / 60000 + (new Date(event.startTime).getHours() * 60 + new Date(event.startTime).getMinutes()))
        //         }
        //         if(curTime !== props.currentMoveEvent.initialTime) {
        //             props.dispatch(changeHasBeenMoving(true));
        //             let startTime = new Date(props.currentEvents[event.index]["startTime"]);
        //             startTime.setMinutes(startTime.getMinutes() + (curTime - props.currentMoveEvent.initialTime));
        //             let endTime = new Date(props.currentEvents[event.index]["endTime"]);
        //             endTime.setMinutes(endTime.getMinutes() + (curTime - props.currentMoveEvent.initialTime));
        //             console.log(startTime + "    " + endTime)
        //             let curEvent = {...props.currentEvents[event.index]};
        //             let startDateStr = startTime.getMonth() + 1 + " " + startTime.getDate() + " " + startTime.getFullYear();
        //             let endDateStr = endTime.getMonth() + 1 + " " + endTime.getDate() + " " + endTime.getFullYear();
        //             let startTimeStr = getHourAndMinutes(startTime.getHours(), startTime.getMinutes());
        //             let endTimeStr = getHourAndMinutes(endTime.getHours(), endTime.getMinutes());
        //             curEvent["curDateOne"] = {"month": startTime.getMonth(), "day": startTime.getDate(), "year": startTime.getFullYear()};
        //             curEvent["startTime"] = startDateStr + " " + startTimeStr;
        //             curEvent["startDate"] = startDateStr;
        //             curEvent["rawStartTime"] = startTimeStr;
        //             curEvent["rawStartDate"] = convertMonths[startTime.getMonth()] + " " + startTime.getDate() + ", " + startTime.getFullYear();
        //             curEvent["curDateTwo"] = {"month": endTime.getMonth(), "day": endTime.getDate(), "year": endTime.getFullYear()};
        //             curEvent["endTime"] = endDateStr + " " + endTimeStr;
        //             curEvent["endDate"] = endDateStr;
        //             curEvent["rawEndTime"] = endTimeStr;
        //             curEvent["rawEndDate"] = convertMonths[endTime.getMonth()] + " " + endTime.getDate() + ", " + endTime.getFullYear();
        //             curEvent["curTimeDisabled"] = {one: '', two: ''};
        //             curEvent["isAllDay"] =  {one: false, two: false};
        //             props.dispatch(changeEvent({"index" : event.index, "value" : curEvent}))
        //         }
        //     }
        // }

        return (<div className='calendar-body-event-container' key={'calendar-body-event-container-' + index} style={{
            "top" : "calc(" + event.start + "%" + " + 6px)", 
            "height" : "calc(" + event.end + "% - " + event.start + "% - 2px)", 
            "left" : event.left + "%", 
            "width" : "calc(" + event.width + "%" + " - 2px)",
            "backgroundColor": event.color,
            pointerEvents}} onClick={(e) => handleEventOnMouseUp(e)} onMouseDown={(e) => handleEventsOnMouseDown(e)} onMouseMove={(e) => handleEventOnMouseMove(e)}>
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

    return(
        <div className='calendar-body-events'>
            {ReturnedEvents}
        </div>
    )
}

function CalendarBodyLabelsTime(props) {

    let timeArray = [];

    for(let i = 0; i < 24; i++) {
        timeArray.push(i);
    }

    const getHourAndMinutes = (hour, minute) => {
        return addZeroes(hour) + ":" + addZeroes(minute);
    }

    const getRawHourAndMinutes = (hour, minute) => {
    
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

    useEffect(() => {
        const handleOnMouseUp = () => {
            let eventNow = {...props.currentEvents[props.currentEvents.length-1]};
            let startTime = new Date(eventNow["startTime"]);
            let endTime = new Date(eventNow["endTime"]);

            props.dispatch(mouseUp({"month" : eventNow["curDateTwo"].month, "day": eventNow["curDateTwo"].day, "year" : eventNow["curDateTwo"].year}));
            let EditingObj = {
                "curDateOne" : eventNow["curDateOne"],
                "curDateTwo" : eventNow["curDateTwo"],
                "dateOneInput" : eventNow["rawStartDate"],
                "dateTwoInput" : eventNow["rawEndDate"],
                "curLocation" : "",
                "focusCalendarVisibleOne" : "visibility-hidden",
                "focusCalendarVisibleTwo" : "visibility-hidden",
                "focusTimeVisibleOne" : "visibility-hidden",
                "focusTimeVisibleTwo" : "visibility-hidden",
                "previousTime" : {},
                "curTimeOne" : getRawHourAndMinutes(startTime.getHours(), startTime.getMinutes()),
                "curTimeTwo" : getRawHourAndMinutes(endTime.getHours(), endTime.getMinutes()),
                "curTimeDisabled": {"one" : "", "two" : ""},
                "isMouseDown" : false,
                "originalCoords" : [0,0],
                "selectedColor" : "#9fc0f5",
                "curTitle" : "",
                "curDescription" : "",
                "wrongInputs" : {"time1" : "", "time2" : "", "date1" : "", "date2": ""},
                "isThisVisible" : "visibility-visible",
                "functionWanted" : "edit-delete",
                "editingIndex" : props.currentEvents.length - 1,
                "originalColor" : "#9fc0f5",
                "isAllDay" : {"one" : eventNow.isAllDay.one, "two": eventNow.isAllDay.two},
                "repeat" : false,
                "repeatSpecifics" : {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []},
                "repeatEnding" : {"never" : false, "onDay" : null, "afterIterations" : null},
                "repeatExceptions" : {},
            }
            props.dispatch(changeCalendarEvent(EditingObj));
            props.dispatch(setEditing(true));
        }

        if(props.currentAddition.isMouseDown) {
            window.addEventListener("mouseup", handleOnMouseUp);

            const cleanUpListener = () => {
                window.removeEventListener("mouseup", handleOnMouseUp);
            }
            return cleanUpListener;
        }

    });

    useEffect(() => {
        const handleOnMouseUp = () => {
            props.dispatch(changeIndex(-1));
            props.dispatch(changeisMoving(false));
            props.dispatch(changeHasBeenMoving(false));
        }

        if(props.currentMoveEvent.isMoving) {
            window.addEventListener("mouseup", handleOnMouseUp);
            window.addEventListener("touchend", handleOnMouseUp);

            const cleanUpListener = () => {
                window.removeEventListener("mouseup", handleOnMouseUp);
                window.addEventListener("touchend", handleOnMouseUp);
            }
            return cleanUpListener;
        }
    });

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

            if(minute === -15) {
                minute = 0;
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

            //console.log(finalHrOne)

            props.dispatch(mouseDown({"start" : {...curDate, "time" : {hour, minute}}, "end" : {...curDateTwo, "time" : {hourTwo, minuteTwo}}}));
            let finalObj = {};
            finalObj["title"] = "[No Title]";
            finalObj["startDate"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00";
            finalObj["endDate"] = curDateTwo.year + '-' + addZeroes(curDateTwo.month + 1) + '-' + addZeroes(curDateTwo.day) + "T00:00:00";
            finalObj["startTime"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + 'T' + finalHrOne;
            finalObj["endTime"] = curDateTwo.year + '-' + addZeroes(curDateTwo.month + 1) + '-' + addZeroes(curDateTwo.day) + 'T' + finalHrTwo;
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
            if(!props.currentAddition.isCurrentlyEditing) {
                //console.log(finalObj)
                props.dispatch(addEvent(finalObj));
            }
        }

        const handleChangeEventMove = (currentIndex, hour, minute, curDate) => {
            let curEvent = {...props.currentEvents[currentIndex]};
            let timeDifference = new Date(curEvent["endTime"]).getTime() - new Date(curEvent["startTime"]).getTime();
            let startTime = new Date(curDate.year, curDate.month, curDate.day, hour, minute - props.currentMoveEvent.initialTime);
            let endTime = new Date(curDate.year, curDate.month, curDate.day, hour, minute - props.currentMoveEvent.initialTime, 0, timeDifference);
            let startDateStr = startTime.getFullYear() + '-' + addZeroes(startTime.getMonth() + 1) + '-' + addZeroes(startTime.getDate());
            let endDateStr = endTime.getFullYear() + '-' + addZeroes(endTime.getMonth() + 1) + '-' + addZeroes(endTime.getDate());
            let startTimeStr = getHourAndMinutes(startTime.getHours(), startTime.getMinutes());
            let endTimeStr = getHourAndMinutes(endTime.getHours(), endTime.getMinutes());
            curEvent["curDateOne"] = {"month": startTime.getMonth(), "day": startTime.getDate(), "year": startTime.getFullYear()};
            curEvent["startTime"] = startDateStr + "T" + startTimeStr;
            curEvent["startDate"] = startDateStr + "T00:00:00";
            curEvent["rawStartTime"] = getRawHourAndMinutes(startTime.getHours(), startTime.getMinutes());
            curEvent["rawStartDate"] = convertMonths[startTime.getMonth()] + " " + startTime.getDate() + ", " + startTime.getFullYear();
            curEvent["curDateTwo"] = {"month": endTime.getMonth(), "day": endTime.getDate(), "year": endTime.getFullYear()};
            curEvent["endTime"] = endDateStr + "T" + endTimeStr;
            curEvent["endDate"] = endDateStr + "T00:00:00";
            curEvent["rawEndTime"] = getRawHourAndMinutes(endTime.getHours(), endTime.getMinutes());
            curEvent["rawEndDate"] = convertMonths[endTime.getMonth()] + " " + endTime.getDate() + ", " + endTime.getFullYear();
            curEvent["curTimeDisabled"] = {one: '', two: ''};
            curEvent["isAllDay"] =  {one: false, two: false};
            if(props.currentMoveEvent.eventType !== "all day") props.dispatch(changeEvent({"index" : currentIndex, "value" : curEvent}));
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

            if(minute === -15) {
                minute = 0;
            }

            let finalHr = getHourAndMinutes(hour, minute);
            let curDate = {"month" : props.currentDate.month, "day" : props.currentDate.day, "year" : props.currentDate.year};

            if(props.currentAddition.isMouseDown) {
                let originalStart = props.currentAddition.currentEvent.start;
                let eventNow = {...props.currentEvents[props.currentEvents.length-1]};
                let dayNow = new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day).getTime();
                let startDate = new Date(originalStart.year, originalStart.month, originalStart.day).getTime();
                if(dayNow > startDate) {
                    eventNow["startDate"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T00:00:00";
                    eventNow["startTime"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T" + getHourAndMinutes(originalStart.time.hour, originalStart.time.minute);
                    eventNow["rawStartDate"] = convertMonths[originalStart.month] + " " + originalStart.day + ", " + originalStart.year;
                    eventNow["curDateOne"] = curDate;
                    eventNow["endDate"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00";
                    eventNow["endTime"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T" + finalHr;
                    eventNow["rawEndDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
                    eventNow["curDateTwo"] = curDate;
                } else if(dayNow < startDate) {
                    eventNow["startDate"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00";
                    eventNow["startTime"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T" + finalHr;
                    eventNow["rawStartDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
                    eventNow["curDateOne"] = curDate;
                    eventNow["endDate"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T00:00:00";
                    eventNow["endTime"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T" + getHourAndMinutes(originalStart.time.hour, originalStart.time.minute);
                    eventNow["rawEndDate"] = convertMonths[originalStart.month] + " " + originalStart.day + ", " + originalStart.year;
                    eventNow["curDateTwo"] = curDate;
                } else if(dayNow === startDate) {
                    if(originalStart.time.hour * 60 + originalStart.time.minute < hour * 60 + minute) {
                        eventNow["startDate"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T00:00:00";
                        eventNow["startTime"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T" + getHourAndMinutes(originalStart.time.hour, originalStart.time.minute);
                        eventNow["rawStartDate"] = convertMonths[originalStart.month] + " " + originalStart.day + ", " + originalStart.year;
                        eventNow["curDateOne"] = curDate;
                        eventNow["endDate"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00";
                        eventNow["endTime"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T" + finalHr;
                        eventNow["rawEndDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
                        eventNow["curDateTwo"] = curDate;
                    } else if(originalStart.time.hour * 60 + originalStart.time.minute > hour * 60 + minute) {
                        eventNow["startDate"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T00:00:00";
                        eventNow["startTime"] = curDate.year + '-' + addZeroes(curDate.month + 1) + '-' + addZeroes(curDate.day) + "T" + finalHr;
                        eventNow["rawStartDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
                        eventNow["curDateOne"] = curDate;
                        eventNow["endDate"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T00:00:00";
                        eventNow["endTime"] = originalStart.year + '-' + addZeroes(originalStart.month + 1) + '-' + addZeroes(originalStart.day) + "T" + getHourAndMinutes(originalStart.time.hour, originalStart.time.minute);
                        eventNow["rawEndDate"] = convertMonths[originalStart.month] + " " + originalStart.day + ", " + originalStart.year;
                        eventNow["curDateTwo"] = curDate;
                    }
                }
                
                if(!props.currentAddition.isCurrentlyEditing) props.dispatch(changeEvent({"index" : props.currentEvents.length-1, "value" : eventNow}));
            }

            if(props.currentMoveEvent.isMoving) {
                handleChangeEventMove(props.currentMoveEvent.index, hour, minute, curDate);
            }
        }

        if(props.currentDate.specifics === "day") {
            return(
                <div className='calendar-body-day-label' key={'calendar-body-day-label-' + index} 
                onMouseDown={(e) => handleOnMouseDown(e)}
                onMouseMove={(e) => handleOnMouseMove(e)}>
                    <div className='calendar-body-day-label-text'>{getHourStr(time)}</div>
                    <div className='calendar-body-day-label-line-vertical'></div>
                    <div className='calendar-body-day-label-line-horizontal'></div>
                </div>
            )
        } else if(props.currentDate.specifics === "week") {
            return(
                <div className='calendar-body-week-label' key={'calendar-body-week-label-' + index} 
                onMouseDown={(e) => handleOnMouseDown(e)}
                onMouseMove={(e) => handleOnMouseMove(e)}></div>
            )
        }
        
    });

    return(
        <React.Fragment>
            {timeArrayJSX}
        </React.Fragment>
    );
}

function CalendarBodyLabels(props) {
    const [today, setToday] = useState(new Date());
    let redLine = [];

    useEffect(() => {
        const func = setInterval(() => {
            let today = new Date();
            setToday(today);
        }, 1000)

        return () => clearInterval(func);
    }, [])

    if(today.getDate() === props.currentDate.day && today.getMonth() === props.currentDate.month && today.getFullYear() === props.currentDate.year) {
        let redLineClass = "calendar-body-label-red-line-container"
        if(props.currentDate.specifics === "week") redLineClass = "calendar-body-week-label-red-line-container"
        redLine = <div className={redLineClass}
            style={{"top" : (today.getHours() * 60 + today.getMinutes()) / 1440 * 100 + "%"}}>
                <div className="calendar-body-label-red-line-dot"></div>
                <div className="calendar-body-label-red-line"></div>
            </div>
    }

    return(
        <div className='calendar-body-day-label-container'>
            {redLine}
            <CalendarBodyLabelsTime {...props}/>
        </div>
    );
}

function CalendarBodyAllDay(props) {
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

    let eventsToday = [...props.currentEvents].map((event, index) => {
        return {...event, "index" : index};
    }).filter((event) => {
        return event.repeat;
    }).map((event) => {
        return createEventsRepeated(event, new Date(curDate.year, curDate.month, curDate.day).getTime(), new Date(curDate.year, curDate.month, curDate.day + 1).getTime());
    }).flat().filter((event) => {
        return filterEventsStartEnd(event, new Date(curDate.year, curDate.month, curDate.day), new Date(curDate.year, curDate.month, curDate.day), props.currentUnwantedColors);
    }).concat([...props.currentEvents].map((event, index) => {
        return {...event, "index" : index};
    }).filter((event) => {
        return !event.repeat && filterEventsStartEnd(event, new Date(curDate.year, curDate.month, curDate.day), new Date(curDate.year, curDate.month, curDate.day), props.currentUnwantedColors);
    })).filter((event) => {
        return !isLongEventAllDay(event);
    })

    const ReturnedEvents = eventsToday.map((event, index) => {

        let textColor = "black";
        let pointerEvents = "";
        if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
            textColor = "white";
        }

        if(props.currentAddition.isMouseDown) {
            pointerEvents = "none";
        }

        let eventStartTime = new Date(event.startDate);
        let eventEndTime = new Date(event.endDate);
        let eventTime = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate();
        if(eventStartTime.getTime() === eventEndTime.getTime()) eventTime = "All Day"

        const handleEventOnClick = (e) => {
            props.setCurEvent({...props.currentEvents[event.index], "index" : event.index});
            let calendarBodyEvents = {};
            if(props.currentDate.specifics === "day") calendarBodyEvents = document.querySelector('.calendar-body-day').getBoundingClientRect();
            if(props.currentDate.specifics === "week") calendarBodyEvents = document.querySelector('.calendar-body-week-container').getBoundingClientRect();
            let popupPreview = document.querySelector('.popup-preview-container');
            let translateX = "translateX(-50%)";
            let translateY = "translateY(5%)";
            if(calendarBodyEvents.right - e.clientX <= 190) {
                translateX = "translateX(-100%)"
            } else if(e.clientX - calendarBodyEvents.left <= 180) {
                translateX = ""
            }

            if(calendarBodyEvents.bottom - e.clientY <= 230) {
                translateY = "translateY(-105%)";
            } 

            popupPreview.style.top = (e.clientY - calendarBodyEvents.top) / calendarBodyEvents.height * 100 + "%";
            popupPreview.style.left = (e.clientX - calendarBodyEvents.left) / calendarBodyEvents.width * 100 + "%";
            popupPreview.style.zIndex = "4";
            popupPreview.style.transform = translateX + " " + translateY;
            props.setIsVisible("visibility-visible");
            props.setCurReference(e.target);
        }

        return (<div className='calendar-body-all-day-event-container' key={'calendar-body-all-day-event-container-' + index} style={{
            "backgroundColor": event.color,
            "color" : textColor,
            pointerEvents}} onClick={(e) => handleEventOnClick(e)}>
                <div className='calendar-body-all-day-event-description'>
                    <div className='calendar-body-event-time'>{eventTime}</div>
                    <div className='calendar-body-event-title'>{event.title}</div>
                </div>
            </div>)
    });

    return(
        <div className='calendar-body-day-all-day-events-container'>
            {ReturnedEvents}
        </div>
    )
}

function CalendarBodyHeader({currentDate}) {

    let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);

    const dispatch = useDispatch();

    const handleOnClick = () => {
        dispatch(changeDate({"month" : curDay.getMonth(), "day" : curDay.getDate(), "year": curDay.getFullYear()}));
        dispatch(changeDateSpecifics("day"))
    }

    let isToday = "";
    if(curDay.getTime() === new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) {
        isToday = " date-today"
    }

    return(
        <div className='calendar-body-day-date-container'>
            <div className="calendar-body-day-date-weekday">{convertWeeks[curDay.getDay()]}</div>
            <div className="calendar-body-day-date-date">
                <div className="calendar-body-day-date-month">{convertMonths[currentDate.month]}</div>
                <div className={"calendar-body-day-date-day" + isToday} onClick={() => handleOnClick()}>{currentDate.day}</div>
            </div>
        </div>
    )
}

function CalendarBody(props) {

    const [isVisible, setIsVisible] = useState("visibility-hidden");
    const [curEvent, setCurEvent] = useState({});
    const [curReference, setCurReference] = useState(useRef());

    return(
        <div className="calendar-body-day">
            <CalendarBodyHeader currentDate={props.currentDate}/>

            <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={props.dispatch} setCurReference={setCurReference} currentEvents={props.currentEvents}/>

            <div className='calendar-body-day-main-container' onScroll={() => setIsVisible("visibility-hidden")}>
                
                <CalendarBodyLabels {...props} />

                <div className='calendar-body-day-events-container'>
                    <CalendarBodyEvents {...props} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
                </div>

            </div>

            <CalendarBodyAllDay {...props} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
        </div>
    )
}

function BodyDay() {

    const currentDate = useSelector((state) => state.date);
    const currentEvents = useSelector((state) => state.event.events);
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const currentAddition = useSelector((state) => state.currentAddition);
    const currentMoveEvent = useSelector((state) => state.moveEvent);
    const dispatch = useDispatch();

    //console.log(currentEvents)
    return(
        <div className="calendar-body-day-container">
            <CalendarBody currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent}/>
        </div>
    )
}

export { CalendarBodyEvents, CalendarBodyAllDay, CalendarBodyHeader, CalendarBodyLabels };

export default BodyDay;