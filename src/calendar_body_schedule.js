import React from 'react';
import "./calendar_body_schedule.css";
import { useState, useEffect, useRef } from "react";
import { addEvent, removeEvent, changeEvent } from './redux_slices/eventSlice';
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';
import { changeSingleCalendarEvent, changeCalendarEvent } from './redux_slices/calendarEventSlice';
import { mouseDown, mouseMove, mouseUp, setEditing } from './redux_slices/currentAddition';
import { changeIndex, changeisMoving, changeHasBeenMoving, setInitialTime, changeEventType } from './redux_slices/moveEvent';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';
import getHourAndMinutes from './calendar_body_useful_functions/get_hours_and_minutes';
import PopupPreview from './calendar_body_month_components/popup_preview';

function getDisplayTime(event, date) {
    let returnStr = "";
    let eventStartDate = new Date(event.startDate);
    let eventEndDate = new Date(event.endDate);
    let eventStartTime = new Date(event.startTime);
    let eventEndTime = new Date(event.endTime);
    if(eventStartDate.getTime() === eventEndDate.getTime()) {
        if(event.isAllDay.one) {
            return "All Day";
        }
        let start = getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes());
        let end = getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes())
        if(start.substring(start.length - 2) === end.substring(end.length - 2)) {
            returnStr = start.substring(0, start.length - 2) + " - " + end;
        } else {
            returnStr = start + " - " + end;
        }
    } else {
        if(eventStartDate.getTime() === date.getTime()) {
            return `${getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes())}`;
        }
        if(eventEndDate.getTime() === date.getTime()) {
            if(event.isAllDay.two) {
                return "All Day";
            }
            return `Until ${getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes())}`;
        }
        return `All Day`;
    }

    return returnStr;
}

function getDisplayDays(event) {
    let eventStartDate = new Date(event.startDate);
    let eventEndDate = new Date(event.endDate);
    if(eventStartDate.getTime() !== eventEndDate.getTime()) {
        return `(Day ${event.eventLengthStart}/${event.eventLength})`;
    }
    return "";
}

const convertWeeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ScheduleDays(props) {
    let totalEvents = [];
    let totalEventsNum = 0;
    const mapLongEvents = (event, curDate) => {
        let start = new Date(event.startDate).getTime();
        let end = new Date(event.endDate).getTime();
        let eventLength = Math.round((end - start) / 86400000) + 1;
        let eventLengthStart = Math.round((curDate.getTime() - start) / 86400000) + 1;
        if(start === end) {
            return event;
        } else {
            return {...event, eventLength, eventLengthStart};
        }
        //let timeDifference = Math.round((end - start) / 86400000);
    }
    for(let i = 0; i < 365; i++) {
        let curDate = props.currentDate;
        curDate = new Date(curDate.year, curDate.month, curDate.day + i)
        let eventsToday = [...props.currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => {
            return event.repeat;
        }).map((event) => {
            return createEventsRepeated(event, curDate.getTime(), new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + 1).getTime());
        }).flat().filter((event) => {
            return filterEventsStartEnd(event, curDate, curDate, props.currentUnwantedColors);
        }).concat([...props.currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => {
            return !event.repeat && filterEventsStartEnd(event, curDate, curDate, props.currentUnwantedColors);
        })).map((event) => {
            return mapLongEvents(event, curDate);
        }).sort((a, b) => {
            return (new Date(a.startTime).getTime()) - (new Date(b.startTime).getTime())
        })
        let eventsTodayAllDay = eventsToday.filter((event) => {
            return getDisplayTime(event, curDate) === "All Day";
        })
        let eventsTodayNotAllDay = eventsToday.filter((event) => {
            return getDisplayTime(event, curDate) !== "All Day";
        })

        eventsToday = eventsTodayNotAllDay.concat(eventsTodayAllDay);
        totalEventsNum += eventsToday.length;
        totalEvents.push({"date" : curDate, "events" : eventsToday});
        if(totalEventsNum > 100) break;
    }

    totalEvents = totalEvents.filter((event) => {
        if(event.events.length > 0) {
            return true;
        } else if(event.date.getTime() === new Date(props.currentDate.year, props.currentDate.month, props.currentDate.day).getTime()) {
            return true;
        } else {
            return false;
        }
    })
    
    let ReturnEvents = totalEvents.map((event, index) => {

        const handleOnClick = () => {
            props.dispatch(changeDate({"month" : event.date.getMonth(), "day" : event.date.getDate(), "year": event.date.getFullYear()}));
            props.dispatch(changeDateSpecifics("day"))
        }

        let isToday = "";
        if(event.date.getTime() === new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) {
            isToday = " date-today"
        }

        return(
            <div className="calendar-body-schedule-events" key={"calendar-body-schedule-events-" + index}>
                <div className="calendar-body-schedule-events-day">
                    <div className={"calendar-body-schedule-events-date" + isToday} onClick={() => handleOnClick()}>{event.date.getDate()}</div>
                    <div className="calendar-body-schedule-events-month">{convertMonths[event.date.getMonth()] + ", " + convertWeeks[event.date.getDay()]}</div>
                </div>
                <div className="calendar-body-schedule-event-container">
                    {event.events.map((item) => {

                        const handleEventOnMouseUp = (e) => {
                            props.setCurEvent({...props.currentEvents[item.index], "index" : item.index});
                            let calendarBodyEvents = {};
                            calendarBodyEvents = document.querySelector('.calendar-body-schedule-container').getBoundingClientRect();
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

                        return(
                            <div className="calendar-body-schedule-event" onClick={(e) => handleEventOnMouseUp(e)}>
                                <div className="calendar-body-schedule-event-color" style={{"backgroundColor" : item.color}}></div>
                                <div className="calendar-body-schedule-event-time">
                                    {getDisplayTime(item, event.date)}
                                </div>
                                <div className="calendar-body-schedule-event-title">{item.title + ' ' + getDisplayDays(item)}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    })

    return(
        <React.Fragment>
            {ReturnEvents}
        </React.Fragment>
    )
}

function BodySchedule() {
    const currentDate = useSelector((state) => state.date);
    const currentEvents = useSelector((state) => state.event.events);
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState("visibility-hidden");
    const [curEvent, setCurEvent] = useState({});
    const [curReference, setCurReference] = useState(useRef());
    return(
        <div className="calendar-body-schedule-container" onScroll={() => setIsVisible("visibility-hidden")}>
            <ScheduleDays currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} setIsVisible={setIsVisible} setCurReference={setCurReference} setCurEvent={setCurEvent} />
            <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={dispatch} setCurReference={setCurReference} currentEvents={currentEvents}/>
        </div>
    )
}

export default BodySchedule;