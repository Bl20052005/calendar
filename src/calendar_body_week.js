import React from 'react';
import "./calendar_body_day.css";
import "./calendar_body_week.css";
import { CalendarBodyHeader, CalendarBodyEvents, CalendarBodyLabels } from "./calendar_body_day";
import { changeIndex, changeisMoving, changeHasBeenMoving, setInitialTime, changeEventType } from './redux_slices/moveEvent';
import { mouseDown, mouseMove, mouseUp, setEditing } from './redux_slices/currentAddition';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { addEvent, changeEvent } from './redux_slices/eventSlice';
import PopupPreview from './calendar_body_month_components/popup_preview';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';

function BodyWeek() {
    const currentDate = useSelector((state) => state.date);
    const currentEvents = useSelector((state) => state.event.events);
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const currentAddition = useSelector((state) => state.currentAddition);
    const currentMoveEvent = useSelector((state) => state.moveEvent);
    const dispatch = useDispatch();

    const [isVisible, setIsVisible] = useState("visibility-hidden");
    const [curEvent, setCurEvent] = useState({});
    const [curReference, setCurReference] = useState(useRef());
    const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);

    let currentWeek = [];

    for(let i = 0; i < 7; i++) {
        let weekDay = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate() + (i - curDay.getDay()));
        currentWeek.push({"year" : weekDay.getFullYear(), "month" : weekDay.getMonth(), "day" : weekDay.getDate(), "specifics" : "week"});
    }

    let returnWeek = currentWeek.map((day, index) => {
        return(
            <div className={"calendar-body-week-sub calendar-body-week-sub-" + index} key={"calendar-body-week-sub calendar-body-week-sub-" + index}>
                <div className={'calendar-body-week-label-line-vertical calendar-body-week-label-line-vertical-' + index}></div>
                <CalendarBodyHeader currentDate={day}/>

                <div className='calendar-body-week-main-container'></div>
            </div>
        )
    })

    let returnLabels = currentWeek.map((day, index) => {
        return (
            <div className={'calendar-body-week-day-labels calendar-body-week-day-labels-' + index} key={'calendar-body-week-day-labels-' + index}>
                <div className='calendar-body-week-events-container'>
                        <CalendarBodyEvents currentDate={day} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
                </div>
                <CalendarBodyLabels currentDate={day} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent} />
            </div>
        )
    })

    function CalendarBodyAllDay(props) {
        let curDate = currentWeek[0];
        let endDate = currentWeek[6];
    
        const isAllDay = (event) => {
            let start = new Date(event.startDate);
            let end = new Date(event.endDate);
            if(!event.isAllDay.one) {
                start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
            }
            if(!event.isAllDay.two) {
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
            }
            if(start.getTime() > end.getTime() || end.getTime() < new Date(curDate.year, curDate.month, curDate.day).getTime() || start.getTime() > new Date(endDate.year, endDate.month, endDate.day).getTime()) {
                return false;
            }
            return true;
        }

        const allDayStart = (event) => {
            let startIndex = 1;
            let endIndex = 8;
            let start = new Date(event.startDate);
            let end = new Date(event.endDate);
            if(!event.isAllDay.one) {
                start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
            }
            if(!event.isAllDay.two) {
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
            }
            start = start.getTime();
            end = end.getTime();
            for(let i = 0; i < 7; i++) {
                let curDate = currentWeek[i];
                let curDateTime = new Date(curDate.year, curDate.month, curDate.day).getTime();
                if(start === curDateTime) {
                    startIndex = i + 1;
                }
                if(end === curDateTime) {
                    endIndex = i + 2;
                }
            }

            return {...event, startIndex, endIndex};
        }
    
        let eventsToday = [...props.currentEvents].map((event, index) => {
            return {...event, "index" : index};
        }).filter((event) => {
            return event.repeat;
        }).map((event) => {
            return createEventsRepeated(event, new Date(curDate.year, curDate.month, curDate.day).getTime(), new Date(endDate.year, endDate.month, endDate.day).getTime());
        }).flat().filter((event) => {
            return filterEventsStartEnd(event, new Date(curDate.year, curDate.month, curDate.day), new Date(endDate.year, endDate.month, endDate.day), props.currentUnwantedColors);
        }).concat([...props.currentEvents].map((event, index) => {
            return {...event, "index" : index};
        }).filter((event) => {
            return !event.repeat && filterEventsStartEnd(event, new Date(curDate.year, curDate.month, curDate.day), new Date(endDate.year, endDate.month, endDate.day), props.currentUnwantedColors) && isAllDay(event);
        })).map((event) => {
            return allDayStart(event);
        }).sort((a, b) => a.startIndex - b.startIndex)
    
        const ReturnedEvents = eventsToday.map((event, index) => {
    
            let textColor = "black";
            let pointerEvents = "";
            if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
                textColor = "white";
            }
    
            if(props.currentAddition.isMouseDown || props.currentMoveEvent.hasBeenMoving) {
                pointerEvents = "none";
            }
    
            let eventStartTime = new Date(event.startDate);
            let eventEndTime = new Date(event.endDate);
            let eventTime = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate();
            if(eventStartTime.getTime() === eventEndTime.getTime()) eventTime = "All Day"
    
            const handleEventOnMouseUp = (e) => {
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

            const handleEventsOnMouseDown = (e) => {
                e.stopPropagation();
                let parentRect = document.querySelector('.calendar-body-week-events-all-day').getBoundingClientRect();
                let curIndex = Math.floor((e.clientX - parentRect.left) / parentRect.width * 7);
                if(curIndex < 0) curIndex = 0;
                let start = {"startMouse" : curIndex, "originalStart" : event.startTime, "originalEnd" : event.endTime}
                
                props.dispatch(setInitialTime(start));
                props.dispatch(changeEventType("all day"));
                props.setCurReference(e.target);
                props.dispatch(changeIndex(event.index));
                props.dispatch(changeisMoving(true));
            }
    
            const handleEventOnMouseMove = (e) => {
                if(props.currentMoveEvent.isMoving) {
                    let parentRect = document.querySelector('.calendar-body-week-events-all-day').getBoundingClientRect();
                    let curIndex = Math.floor((e.clientX - parentRect.left) / parentRect.width * 7);
                    if(curIndex < 0) curIndex = 0;
                    if(props.currentMoveEvent.initialTime.startMouse !== curIndex) {
                        props.dispatch(changeHasBeenMoving(true));
                    }
                }
                
            }
    
            return (<div className='calendar-body-week-all-day-events-container' key={'calendar-body-week-all-day-events-container-' + index} style={{
                "backgroundColor": event.color,
                "color" : textColor,
                pointerEvents,
                "gridColumn" : event.startIndex + "/" + event.endIndex}}
                onMouseUp={(e) => handleEventOnMouseUp(e)}
                onMouseDown={(e) => handleEventsOnMouseDown(e)}
                onMouseMove={(e) => handleEventOnMouseMove(e)}>
                    <div className='calendar-body-all-day-event-description'>
                        <div className='calendar-body-event-time'>{eventTime}</div>
                        <div className='calendar-body-event-title'>{event.title}</div>
                    </div>
                </div>)
        });
    
        return(
            <React.Fragment>
                {ReturnedEvents}
            </React.Fragment>
        )
    }

    let timeArray = [];

    for(let i = 0; i < 24; i++) {
        timeArray.push(i);
    }

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

    let timeArrayJSX = timeArray.map((time, index) => {
        return(
            <div className="calendar-body-week-time-label" key={"calendar-body-week-time-label-" + index}>
                <div className='calendar-body-day-label-text'>{getHourStr(time)}</div>
                <div className='calendar-body-day-label-line-horizontal'></div>
            </div>
        )
    })

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

    const handleChangeEventMove = (currentIndex, curIndex) => {
        let curEvent = {...currentEvents[currentIndex]};
        let indexDifference = curIndex - currentMoveEvent.initialTime.startMouse;
        let startTime = new Date(currentMoveEvent.initialTime.originalStart);
        let endTime = new Date(currentMoveEvent.initialTime.originalEnd);
        startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() + indexDifference, startTime.getHours(), startTime.getMinutes());
        endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate() + indexDifference, endTime.getHours(), endTime.getMinutes());
        let startDateStr = startTime.getMonth() + 1 + " " + startTime.getDate() + " " + startTime.getFullYear();
        let endDateStr = endTime.getMonth() + 1 + " " + endTime.getDate() + " " + endTime.getFullYear();
        let startTimeStr = getHourAndMinutes(startTime.getHours(), startTime.getMinutes());
        let endTimeStr = getHourAndMinutes(endTime.getHours(), endTime.getMinutes());
        curEvent["curDateOne"] = {"month": startTime.getMonth(), "day": startTime.getDate(), "year": startTime.getFullYear()};
        curEvent["startTime"] = startDateStr + " " + startTimeStr;
        curEvent["startDate"] = startDateStr;
        curEvent["rawStartTime"] = startTimeStr;
        curEvent["rawStartDate"] = convertMonths[startTime.getMonth()] + " " + startTime.getDate() + ", " + startTime.getFullYear();
        curEvent["curDateTwo"] = {"month": endTime.getMonth(), "day": endTime.getDate(), "year": endTime.getFullYear()};
        curEvent["endTime"] = endDateStr + " " + endTimeStr;
        curEvent["endDate"] = endDateStr;
        curEvent["rawEndTime"] = endTimeStr;
        curEvent["rawEndDate"] = convertMonths[endTime.getMonth()] + " " + endTime.getDate() + ", " + endTime.getFullYear();
        if(currentMoveEvent.eventType !== "day") dispatch(changeEvent({"index" : currentIndex, "value" : curEvent}));
    }

    const handleOnMouseMove = (e) => {

        if(currentAddition.isMouseDown) {
            let parentRect = document.querySelector('.calendar-body-week-events-all-day').getBoundingClientRect();
            let curIndex = Math.floor((e.clientX - parentRect.left) / parentRect.width * 7);
            if(curIndex < 0) curIndex = 0;
            let eventNow = {...currentEvents[currentEvents.length-1]};
            let dayNow = new Date(currentWeek[curIndex].year, currentWeek[curIndex].month, currentWeek[curIndex].day).getTime();
            let startDate = new Date(currentAddition.currentEvent.start.year, currentAddition.currentEvent.start.month, currentAddition.currentEvent.start.day).getTime();
            let curDate = {"month" : currentWeek[curIndex].month, "day" : currentWeek[curIndex].day, "year" : currentWeek[curIndex].year};
        if(dayNow >= startDate) {
            eventNow["startDate"] = currentAddition.currentEvent.start.month + 1 + " " + currentAddition.currentEvent.start.day + " " + currentAddition.currentEvent.start.year;
            eventNow["startTime"] = currentAddition.currentEvent.start.month + 1 + " " + currentAddition.currentEvent.start.day + " " + currentAddition.currentEvent.start.year;
            eventNow["rawStartDate"] = convertMonths[currentAddition.currentEvent.start.month] + " " + currentAddition.currentEvent.start.day + ", " + currentAddition.currentEvent.start.year;
            eventNow["curDateOne"] = curDate;
            eventNow["endDate"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year;
            eventNow["endTime"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year;
            eventNow["rawEndDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
            eventNow["curDateTwo"] = curDate;
            eventNow["isAllDay"] = {"one" : true, "two": true};
            eventNow["curTimeDisabled"] = {"one" : "input-disabled", "two" : "input-disabled"};
        } else if(dayNow < startDate) {
            eventNow["startDate"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year;
            eventNow["startTime"] = curDate.month + 1 + " " + curDate.day + " " + curDate.year;
            eventNow["rawStartDate"] = convertMonths[curDate.month] + " " + curDate.day + ", " + curDate.year;
            eventNow["curDateOne"] = curDate;
            eventNow["endDate"] = currentAddition.currentEvent.start.month + 1 + " " + currentAddition.currentEvent.start.day + " " + currentAddition.currentEvent.start.year;
            eventNow["endTime"] = currentAddition.currentEvent.start.month + 1 + " " + currentAddition.currentEvent.start.day + " " + currentAddition.currentEvent.start.year;
            eventNow["rawEndDate"] = convertMonths[currentAddition.currentEvent.start.month] + " " + currentAddition.currentEvent.start.day + ", " + currentAddition.currentEvent.start.year;
            eventNow["curDateTwo"] = curDate;
            eventNow["isAllDay"] = {"one" : true, "two": true};
            eventNow["curTimeDisabled"] = {"one" : "input-disabled", "two" : "input-disabled"};
        }
        //console.log(eventNow)
        if(!currentAddition.isCurrentlyEditing) dispatch(changeEvent({"index" : currentEvents.length-1, "value" : eventNow}));
        }

        if(currentMoveEvent.isMoving) {
            dispatch(changeHasBeenMoving(true));
            let parentRect = document.querySelector('.calendar-body-week-events-all-day').getBoundingClientRect();
            let curIndex = Math.floor((e.clientX - parentRect.left) / parentRect.width * 7);
            if(curIndex < 0) curIndex = 0;
            handleChangeEventMove(currentMoveEvent.index, curIndex);
        }
    }

    const handleOnMouseDown = (e) => {
        let parentRect = document.querySelector('.calendar-body-week-events-all-day').getBoundingClientRect();
        let curIndex = Math.floor((e.clientX - parentRect.left) / parentRect.width * 7);
        if(curIndex < 0) curIndex = 0;
        dispatch(mouseDown({"start" : {"month" : currentWeek[curIndex].month, "day": currentWeek[curIndex].day, "year" : currentWeek[curIndex].year, "time" : {"hour" : 0, "minute" : 0}}, "end" : {"month" : currentWeek[curIndex].month, "day": currentWeek[curIndex].day, "year" : currentWeek[curIndex].year}, "time" : {"hour" : 0, "minute" : 0}}));
        let finalObj = {};
        finalObj["title"] = "[No Title]";
        finalObj["startDate"] = currentWeek[curIndex].month + 1 + " " + currentWeek[curIndex].day + " " + currentWeek[curIndex].year;
        finalObj["endDate"] = currentWeek[curIndex].month + 1 + " " + currentWeek[curIndex].day + " " + currentWeek[curIndex].year;
        finalObj["startTime"] = currentWeek[curIndex].month + 1 + " " + currentWeek[curIndex].day + " " + currentWeek[curIndex].year;
        finalObj["endTime"] = currentWeek[curIndex].month + 1 + " " + currentWeek[curIndex].day + " " + currentWeek[curIndex].year;
        finalObj["rawStartDate"] = convertMonths[currentWeek[curIndex].month] + " " + currentWeek[curIndex].day + ", " + currentWeek[curIndex].year;
        finalObj["rawStartTime"] = "";
        finalObj["rawEndDate"] = convertMonths[currentWeek[curIndex].month] + " " + currentWeek[curIndex].day + ", " + currentWeek[curIndex].year;
        finalObj["rawEndTime"] = "";
        finalObj["color"] = "#9fc0f5";
        finalObj["location"] = "";
        finalObj["description"] = "";
        finalObj["curDateOne"] = {"year": currentWeek[curIndex].year, "month": currentWeek[curIndex].month, "day": currentWeek[curIndex].day};
        finalObj["curDateTwo"] = {"year": currentWeek[curIndex].year, "month": currentWeek[curIndex].month, "day": currentWeek[curIndex].day};
        finalObj["previousTime"] = {};
        finalObj["isAllDay"] = {"one" : true, "two": true};
        finalObj["curTimeDisabled"] = {"one" : "input-disabled", "two" : "input-disabled"};
        finalObj["repeat"] = false;
        finalObj["repeatSpecifics"] = {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []};
        finalObj["repeatEnding"] = {"never" : false, "onDay" : null, "afterIterations" : null};
        finalObj["repeatExceptions"] = {};

        if(!currentAddition.isCurrentlyEditing) {
            dispatch(addEvent(finalObj));
        }
    }

    return(
        <div className="calendar-body-week-container">
            <div className="calendar-body-week">
                <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={dispatch} setCurReference={setCurReference} currentEvents={currentEvents}/>
                {returnWeek}
                <div className="calendar-body-week-main" onScroll={() => setIsVisible("visibility-hidden")}>
                    <div className="calendar-body-week-time">
                        {timeArrayJSX}
                    </div>
                    {returnLabels}
                </div>
                <div className='calendar-body-week-events-all-day' onMouseMove={(e) => handleOnMouseMove(e)} onMouseDown={(e) => handleOnMouseDown(e)} onScroll={() => setIsVisible("visibility-hidden")}>
                    <CalendarBodyAllDay currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
                </div>
            </div>
        </div>
    )
}

export default BodyWeek;