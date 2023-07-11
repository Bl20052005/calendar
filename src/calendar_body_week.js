import React from 'react';
import "./calendar_body_day.css";
import "./calendar_body_week.css";
import { CalendarBodyHeader, CalendarBodyEvents, CalendarBodyAllDay, CalendarBodyLabels } from "./calendar_body_day";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import PopupPreview from './calendar_body_month_components/popup_preview';

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

    let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);

    let currentWeek = [];

    for(let i = 0; i < 7; i++) {
        let weekDay = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate() + (i - curDay.getDay()));
        currentWeek.push({"year" : weekDay.getFullYear(), "month" : weekDay.getMonth(), "day" : weekDay.getDate(), "specifics" : "week"});
    }

    let returnWeek = currentWeek.map((day, index) => {
        return(
            <div className={"calendar-body-week-sub calendar-body-week-sub-" + index}>
                <div className={'calendar-body-week-label-line-vertical calendar-body-week-label-line-vertical-' + index}></div>
                <CalendarBodyHeader currentDate={day}/>

                <div className='calendar-body-week-main-container'></div>

                <CalendarBodyAllDay currentDate={day} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
            </div>
        )
    })

    let returnLabels = currentWeek.map((day, index) => {
        return (
            <div className={'calendar-body-week-day-labels calendar-body-week-day-labels-' + index}>
                <div className='calendar-body-week-events-container'>
                        <CalendarBodyEvents currentDate={day} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent} setIsVisible={setIsVisible} setCurEvent={setCurEvent} setCurReference={setCurReference}/>
                </div>
                <CalendarBodyLabels currentDate={day} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentAddition={currentAddition} currentMoveEvent={currentMoveEvent} />
            </div>
        )
    })

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
            <div className="calendar-body-week-time-label">
                <div className='calendar-body-day-label-text'>{getHourStr(time)}</div>
                <div className='calendar-body-day-label-line-horizontal'></div>
            </div>
        )
    })


    return(
        <div className="calendar-body-week-container">
            <div className="calendar-body-week">
                <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={dispatch} setCurReference={setCurReference} currentEvents={currentEvents}/>
                {returnWeek}
                <div className="calendar-body-week-main">
                    <div className="calendar-body-week-time">
                        {timeArrayJSX}
                    </div>
                    {returnLabels}
                </div>
            </div>
        </div>
    )
}

export default BodyWeek;