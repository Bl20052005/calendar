import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate } from './dateSlice';


function CalendarBody({currentDate, currentEvents, curentUnwantedColors, dispatch}) {
    const convertWeeks = [["Sunday", "S", "Sun"], ["Monday", "M", "Mon"], ["Tuesday", "T", "Tue"], ["Wednesday", "W", "Wed"], ["Thursday", "Th", "Thu"], ["Friday", "F", "Fri"], ["Saturday", "Sa", "Sat"]];
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let daysInMonths = [];
    let calendarArray = [];

    let curDate = currentDate;

    let curMonth = curDate.month;
    let curYear = curDate.year;
    let curDay = curDate.day;

    let today = new Date();
    today = today.getMonth() + " " + today.getDate() + " " + today.getFullYear();

    if(curYear % 4 === 0 && curYear % 100 !== 0) {
        daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    } else {
        daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    }

    let firstOfMonth = new Date(curMonth + 1 + " 1, " + curYear);

    let lastOfMonth = new Date(curMonth + 1 + " " + daysInMonths[curMonth] + ", " + curYear);

    let weekAddition = [];

    const filterEvents = (event, year, month, day, curentUnwantedColors) => {
        let eventDate = new Date(event.startTime);
        return (eventDate.getDate() === day && 
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year &&
        curentUnwantedColors.indexOf(event.color) === -1);
    }

    for(let i = firstOfMonth.getDay() * -1 + 1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i++) {
        let yearNow = curYear;
        let monthNow = curMonth;
        let dayNow = i;
        let textColor = "text-color-black";

        if(i < 1) {
            if(curMonth === 0) yearNow -= 1;
            monthNow = (12 + monthNow - 1) % 12;
            dayNow = daysInMonths[monthNow] + i;
            textColor = "text-color-gray";
        } else if(i > daysInMonths[monthNow]) {
            if(curMonth === 11) yearNow += 1;
            monthNow = (12 + monthNow + 1) % 12;
            dayNow = i - daysInMonths[curMonth];
            textColor = "text-color-gray";
        }

        if(monthNow + " " + dayNow + " " + yearNow === today) {
            textColor = "date-today";
        }

        let eventsToday = [...currentEvents].filter((event) => filterEvents(event, yearNow, monthNow, dayNow, curentUnwantedColors)).sort((a, b) => {
            return (new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes()) - (new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes())
        })

        weekAddition.push({"year" : yearNow, "month" : monthNow, "day" : dayNow, "textColor" : textColor, "eventsToday" : eventsToday});

        if(weekAddition.length === 7) {
            calendarArray.push(weekAddition);
            weekAddition = [];
        }
    }

    const getHourAndMinutes = (hour, minute) => {
        let returnStr = "";

        let condensedHour = ((hour + 11) % 12 + 1);

        if(condensedHour < 10) condensedHour = "0" + condensedHour;
        if(minute < 10) minute = "0" + minute;

        returnStr += condensedHour + ":" + minute;

        if(hour % 24 > 11) {
            returnStr += "pm";
        } else {
            returnStr += "am";
        }

        return returnStr;
    }

    const returnCalendar = [<div className='calendar-body-month-week-top-group-container' key={"calendar-body-month-week-group-0"}>
            {convertWeeks.map((item, index) => {
            return <div className='calendar-body-month-week-top-group' key={'calendar-body-month-week-top-group-' + index}>
                    <div className={'calendar-body-month-divider-line-vertical calendar-body-month-divider-line-vertical-' + index}></div>
                    {item[2]}
                </div>
            })}
        </div>
    ];

    const ReturnValueEvents = ({value}) => {
        return value.eventsToday.map((event, index) => {
            let eventTime = new Date(event.startTime);
            eventTime = getHourAndMinutes(eventTime.getHours(), eventTime.getMinutes());
            return (
                <div className='calendar-body-month-day-events' key={'calendar-body-month-day-events-' + index}>
                    <div className="calendar-body-month-day-events-color" style={{"backgroundColor": event.color}}></div>
                    <div className='calendar-body-month-day-events-time'>{eventTime}</div>
                    <div className='calendar-body-month-day-events-title'>{event.title}</div>
                </div>
            );
        })
    }

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='calendar-body-month-week-group' key={"calendar-body-month-week-" + index}>
                        {item.map((value, index) => {
                            return (
                                <div className="calendar-body-month-day-container" key={"calendar-body-month-day-container-" + index}>
                                    <div className="calendar-body-month-day-values">
                                        <div className={"calendar-body-month-day " + value.textColor} key={"calendar-body-month-day-" + index}>{value.day}</div>
                                        <div className='calendar-body-month-day-events-container'>
                                            <ReturnValueEvents value={value} />
                                        </div>  
                                    </div>
                                </div>
                            );
                        })}
                        <div className='calendar-body-month-divider-line-horizontal'></div>
                    </div>
                ));

    let r = document.querySelector(':root');

    r.style.setProperty("--number-of-weeks", calendarArray.length)

    return(
        <div className='calendar-body-month'>
            {returnValue}
        </div>
    )
}

function BodyMonth() {
    const currentDate = useSelector((state) => state.date);
    const currentEvents = useSelector((state) => state.event.events);
    const curentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const dispatch = useDispatch();
    return(
        <div className="calendar-body-month-container">
            <CalendarBody currentDate={currentDate} currentEvents={currentEvents} curentUnwantedColors={curentUnwantedColors} />
        </div>
    )
}

export default BodyMonth;