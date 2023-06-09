import React from 'react';
import { useState } from "react";
import { addEvent, removeEvent, changeEvent } from './eventSlice';
import { useSelector, useDispatch } from 'react-redux';
import { changeDate } from './dateSlice';
import { current } from '@reduxjs/toolkit';

// const curDate = useSelector((state) => state.calendar.date);
// const dispatch = useDispatch();

function AddEventPopupCalendar({currentDate, dispatch}) {
    const convertWeeks = [["Sunday", "S", "SUN"], ["Monday", "M", "MON"], ["Tuesday", "T", "TUE"], ["Wednesday", "W", "WED"], ["Thursday", "Th", "THU"], ["Friday", "F", "FRI"], ["Saturday", "Sa", "SAT"]];
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let daysInMonths = [];
    let calendarArray = [];

    let curDate = currentDate;

    let curMonth = curDate.month;
    let curYear = curDate.year;

    if(curYear % 4 === 0 && curYear % 100 !== 0) {
        daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    } else {
        daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    }

    let firstOfMonth = new Date(curMonth + 1 + " 1, " + curYear);

    let lastOfMonth = new Date(curMonth + 1 + " " + daysInMonths[curMonth] + ", " + curYear);

    let weekAddition = [];

    for(let i = firstOfMonth.getDay() * -1 + 1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i++) {
        if(i < 1) {
            weekAddition.push([convertMonths[(12 + curMonth - 1) % 12], daysInMonths[(12 + curMonth - 1) % 12] + i, "text-color-gray"]);
        } else if(i >= 1 && i <= daysInMonths[curMonth]) {
            weekAddition.push([convertMonths[curMonth], i, "text-color-black"]);
        } else {
            weekAddition.push([convertMonths[(curMonth + 1) % 12], i - daysInMonths[curMonth], "text-color-gray"]);
        }

        if(weekAddition.length === 7) {
            calendarArray.push(weekAddition);
            weekAddition = [];
        }
    }

    const returnCalendar = [<div className='add-event-popup-calender-week-group' key={"add-event-popup-calender-week-group-0"}>
            {convertWeeks.map((item, index) => {
            return <div className='add-event-popup-calender-week-top-group' key={'add-event-popup-calender-week-top-group-' + index}>
                    {item[1]}
                </div>
            })}
        </div>
    ];

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='add-event-popup-calender-week' key={"add-event-popup-calender-week-" + index}>
                        <div className='add-event-popup-calender-week-group' key={"add-event-popup-calender-week-" + index}>
                            {item.map((value, index) => {
                                return <div className={"add-event-popup-calender-day " + value[2]} key={"add-event-popup-calender-day-" + index}>{value[1]}</div>
                            })}
                        </div>
                    </div>
                ));

    const changeDateEnablerMinus = () => {
        if(curMonth === 0) {
            return {
                    year: curYear - 1,
                    month: 11,
                    day: 1
                }
        } else {
            return {
                    year: curYear,
                    month: curMonth - 1,
                    day: 1
                }
            }
        }

    const changeDateEnablerPlus = () => {
        if(curMonth === 11) {
            return {
                year: curYear + 1,
                month: 0,
                day: 1
            }
        } 
        else {
            return {
                year: curYear,
                month: curMonth + 1,
                day: 1
            }
        }
    }

    return(
        <div className='add-event-popup-calender'>
            <div className='add-event-popup-calender-top'>
                <div className='add-event-popup-calender-arrow-left' onClick={() => dispatch(changeDate(changeDateEnablerMinus()))}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </div>
                <div className='add-event-popup-calender-title'>{convertMonths[curMonth]}, {curYear}</div>
                <div className='add-event-popup-calender-arrow-right' onClick={() => dispatch(changeDate(changeDateEnablerPlus()))}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                </div>
            </div>
            {returnValue}
        </div>
    )

}

function AddEventPopUp() {

    let currentDate = new Date();
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const [curDate, setCurDate] = [currentDate];

    return(
        <div className='add-event-popup'>
            <input type="text" className='add-event-popup-title' name="add-event-popup-title"></input>
            <div className='add-event-popup-time'>
                <input type="date" className='add-event-popup-time-date-1' name="add-event-popup-time-date-1"></input>
                <div>at</div>
                <input type="time" className='add-event-popup-time-time-1' name="add-event-popup-time-time-1"></input>
            </div>
        </div>
    );
}

function AddEvent() {
    return(
        <div className='add-event-container'>
            <div className='add-event-add-sign'>
                <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
            </div>
            <div className='add-event-text'>event</div>
        </div>
    )
}

function TodayEvents({currentEvents}) {
    //const currentEvents = [["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"],["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"],["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"],["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"]];
    const currentEventsJSX = currentEvents.map((item, index) =>
        <div className='today-events-item-container' key={"today-events-" + index}>
            <div className='today-events-item'>
                <div className="today-events-item-color" style={{"backgroundColor": item[1]}}></div>
                <div className='today-events-item-name'>{item[0]}</div>
            </div>
            <div className='today-events-divider-line'></div>
        </div>
        );
    return(
        <div className='today-events-container'>
            <div className='today-events-text'>Today's Agenda...</div>
            <div className='today-events'>
                {currentEventsJSX}
            </div>
        </div>
    );
    
}

function Menu() {
    const currentEvents = useSelector((state) => state.event.events);
    const currentDate = useSelector((state) => state.date);
    const dispatch = useDispatch();
    return(
        <div className="calendar-menu">
            <AddEvent />
            <div className='calendar-menu-divider-line'></div>
            <TodayEvents currentEvents={currentEvents}/>
            <div className='calendar-menu-divider-line'></div>
            <AddEventPopupCalendar currentDate={currentDate} dispatch={dispatch}/>
        </div>
    )
}

export default Menu;