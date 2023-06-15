import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate } from './dateSlice';


function CalendarBody({currentDate, currentEvents, currentUnwantedColors, dispatch}) {
    const convertWeeks = [["Sunday", "S", "Sun"], ["Monday", "M", "Mon"], ["Tuesday", "T", "Tue"], ["Wednesday", "W", "Wed"], ["Thursday", "Th", "Thu"], ["Friday", "F", "Fri"], ["Saturday", "Sa", "Sat"]];
    const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
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

    const filterEvents = (event, dateNow, currentUnwantedColors) => {
        let eventDateEnd = new Date(event.endDate);
        let eventDateStart = new Date(event.startDate);

        if(eventDateEnd.getTime() < dateNow.getTime()) {
            return false;
        }

        if(eventDateStart.getTime() > dateNow.getTime()) {
            return false;
        }

        return currentUnwantedColors.indexOf(event.color) === -1;
    }

    const filterEventsStartEnd = (event, start, end, currentUnwantedColors) => {
        let eventDateEnd = new Date(event.endDate);
        let eventDateStart = new Date(event.startDate);
        let startDate = new Date(start);
        let endDate = new Date(end);

        if(eventDateEnd.getTime() < startDate.getTime()) {
            return false;
        }

        if(eventDateStart.getTime() > endDate.getTime()) {
            return false;
        }

        return currentUnwantedColors.indexOf(event.color) === -1;
    }

    const startEndDates = (start, end) => {
        let yearNow = curYear;
        let monthStart = curMonth;
        let monthEnd = curMonth;

        if(start < 0) {
            if(curMonth === 0) yearNow -= 1;
            monthStart = (12 + monthStart - 1) % 12;
            start = daysInMonths[monthStart] + start + 1;
        }

        if(start === 0) {
            start = 1;
        }
        
        if(end > daysInMonths[monthEnd]) {
            if(curMonth === 11) yearNow += 1;
            monthEnd = (monthEnd + 1) % 12;
            end = end - daysInMonths[curMonth];
        }

        return([new Date(monthStart + 1 + " " + start + " " + yearNow), new Date(monthEnd + 1 + " " + end + " " + yearNow)])
    }

    const getWeek = (event) => {
        const [start, end] = startEndDates(firstOfMonth.getDay() * -1, daysInMonths[curMonth] + 7 - lastOfMonth.getDay() - 1)
        let eventStartWeekDay = new Date(event.startDate);
        let eventEndWeekDay = new Date(event.endDate);
        let startWeek = Math.floor(((eventStartWeekDay.getTime() - start.getTime()) / 86400000) / 7);
        let endWeek = Math.floor(((eventEndWeekDay.getTime() - start.getTime()) / 86400000) / 7);

        return {"eventStartWeek" : startWeek, "eventStartDay" : eventStartWeekDay.getDay(), "eventEndWeek" : endWeek, "eventEndDay" : eventEndWeekDay.getDay()};
    }

    // const spotsLeft = (eventSpot) => {
    //     for(let i = eventSpot.eventStartWeek; i <= eventSpot.eventEndWeek; i++) {
    //         for(let j = eventSpot.eventStartDay; i <= eventSpot.eventEndDay; j++) {
    //             if(calendarSpotsLeft[i][j] <= 0) return false;
    //         }
    //     }

    //     for(let i = eventSpot.eventStartWeek; i <= eventSpot.eventEndWeek; i++) {
    //         for(let j = eventSpot.eventStartDay; i <= eventSpot.eventEndDay; j++) {
    //             calendarSpotsLeft[i][j]--;
    //         }
    //     }

    //     return true;
    // }

    //filter so only events longer than one day and in current month including margins are shown filterEventsStartEnd(event, start, end, currentUnwantedColors)
    //to get start and end, a function that gives start and end dates is made startEndDates(start, end)
    //within those events, find their respective start week and date plus end week and date using the function getWeek(event)
    //use the array calendarSpotsLeft to see if there are spots left using spotsLeft()
    //finally, if an event has passed all of these, then put week and day onto its object / array and send it off

    let longEvents = [...currentEvents].filter((event) => {
        const [start, end] = startEndDates(firstOfMonth.getDay() * -1, daysInMonths[curMonth] + 7 - lastOfMonth.getDay() - 1);
        return filterEventsStartEnd(event, start, end, currentUnwantedColors) && (new Date(event.startDate).getTime() !== new Date(event.endDate).getTime());
    }).sort((a, b) => {
        return (new Date(a.startTime).getTime()) - (new Date(b.startTime).getTime())
    }).map((event) => {
        let objNow = {"weekAndDay" : getWeek(event)}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    });


    for(let i = firstOfMonth.getDay() * -1 + 1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i++) {
        let yearNow = curYear;
        let monthNow = curMonth;
        let dayNow = i;
        let textColor = "text-color-black";

        let searchWeek = Math.floor((i - (firstOfMonth.getDay() * -1 + 1)) / 7)
        let searchDay =  (i - (firstOfMonth.getDay() * -1 + 1)) % 7;

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

        let eventsToday = [...currentEvents].filter((event) => filterEvents(event, new Date(monthNow + 1 + " " + dayNow + " " + yearNow), currentUnwantedColors) && !(new Date(event.startDate).getTime() !== new Date(event.endDate).getTime())).sort((a, b) => {
            return (new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes()) - (new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes())
        }).map((event) => {
            let objNow = {"weekAndDay" : getWeek(event)}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        });

        let numberOfEvents = [...currentEvents].filter((event) => filterEvents(event, new Date(monthNow + 1 + " " + dayNow + " " + yearNow), currentUnwantedColors) && (new Date(event.startDate).getTime() !== new Date(event.endDate).getTime())).length + eventsToday.length

        weekAddition.push({"year" : yearNow, "month" : monthNow, "day" : dayNow, "textColor" : textColor, "eventsToday" : eventsToday, "numberOfEvents" : numberOfEvents});

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
                    <div className="calendar-body-month-text">{item[2]}</div>
                </div>
            })}
        </div>
    ];

    const ReturnValueEvents = ({value}) => {
        return value.eventsToday.map((event, index) => {
            let eventTime = new Date(event.startTime);
            eventTime = getHourAndMinutes(eventTime.getHours(), eventTime.getMinutes());
            let textColor = "black";
            if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
                textColor = "white";
            }
            return (
                <div className='calendar-body-month-day-events' key={'calendar-body-month-day-events-' + index} style={{"backgroundColor": event.color, "color" : textColor}}>
                    {/* <div className="calendar-body-month-day-events-color" style={{"backgroundColor": event.color}}></div> */}
                    <div className='calendar-body-month-day-events-time'>{eventTime}</div>
                    <div className='calendar-body-month-day-events-title'>{event.title}</div>
                </div>
            );
        })
    }

    const ReturnEvents = ({item, index}) => {
        let itemCleansed = item.map((value) => {
            return value.eventsToday;
        }).filter((event) => event.length !== 0);
        
        let calendarSpotsLeft = [[true, true, true, true, true, true, true], [true, true, true, true, true, true, true], [true, true, true, true, true, true, true], [true, true, true, true, true, true, true]];
        let returnVar = longEvents.concat(...itemCleansed).map((event, i) => {
            if(event.weekAndDay.eventStartWeek <= index && event.weekAndDay.eventEndWeek >= index) {
                let startRow = 1;
                let endRow = 8;
                let eventStartTime = new Date(event.startDate);
                let eventEndTime = new Date(event.endDate);
                let eventTime = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " - " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate();
                let textColor = "black";
                if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
                    textColor = "white";
                }
                if(event.weekAndDay.eventStartWeek === index) {
                    startRow = event.weekAndDay.eventStartDay + 1;
                }
                if(event.weekAndDay.eventEndWeek === index) {
                    endRow = event.weekAndDay.eventEndDay + 2;
                }

                let row = -1;
                for(let j = 0; j < calendarSpotsLeft.length; j++) {
                    let isAble = true;
                    for(let h = startRow - 1; h < endRow - 1; h++) {
                        if(!calendarSpotsLeft[j][h]) isAble = false; 
                    }
                    if(isAble) {
                        row = j;
                        for(let h = startRow - 1; h < endRow - 1; h++) {
                            calendarSpotsLeft[j][h] = false; 
                        }
                        break;
                    }
                }
                if(eventStartTime.getTime() === eventEndTime.getTime()) {
                    eventTime = getHourAndMinutes(new Date(event.startTime).getHours(), new Date(event.startTime).getMinutes())
                }

                if(row > -1) return(
                    <div className='calendar-body-month-week-events' key={'calendar-body-month-week-events-' + i} style={{"gridColumn" : startRow + "/" + endRow, "backgroundColor" : event.color, "top" : (row * 20) + "px", "color" : textColor}}>
                        <div className='calendar-body-month-day-events-time'>{eventTime}</div>
                        <div className='calendar-body-month-day-events-title'>{event.title}</div>
                    </div>
                )
            }
        })
        
        // item.map((value, index) => {
        //     let numEvents = value.numberOfEvents;
        //     if(numEvents > 4) {
        //         numEvents = "View More (" + numEvents + ")";
        //     } else {
        //         numEvents = "";
        //     }
        //     calendarSpotsLeft[index]--;
        //     if(calendarSpotsLeft[index] >= 0) return (
        //         <React.Fragment key={'calendar-body-month-day-events-container-' + index}>
        //             <div className='calendar-body-month-day-events-container' style={{"gridColumn" : (index + 1) + "/" + (index + 2), "top" : ((3 - calendarSpotsLeft[index]) * 20) + "px"}}>
        //                 <ReturnValueEvents value={value} />
        //             </div>
        //             <div className='calendar-body-month-day-events-number'>{numEvents}</div>
        //         </React.Fragment>
        //     );
        // })

        //     if(numEvents > 4) {
        //         numEvents = "View More (" + numEvents + ")";
        //     } else {
        //         numEvents = "";
        //     }

        let numEventsVar = item.map((value) => {
            let numEvents = value.numberOfEvents;
            if(numEvents > 4) {
                numEvents = "View More (" + numEvents + ")";
            } else {
                numEvents = "";
            }
            if(numEvents !== "") return (<div className='calendar-body-month-day-events-number calendar-body-month-day-events-number-hover'>{numEvents}</div>);
            else return(<div className='calendar-body-month-day-events-number'>{numEvents}</div>)
        })

        return (
                <React.Fragment>
                    <div className='calendar-body-month-week-events-container'>
                        {returnVar}
                    </div>
                    {numEventsVar}
                </React.Fragment>
                );
    }

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='calendar-body-month-week-group' key={"calendar-body-month-week-" + index}>
                        <div className='calendar-body-month-week-group-events'>
                            <ReturnEvents item={item} index={index} />
                        </div>
                        {item.map((value, index) => {
                            return (
                                <div className="calendar-body-month-day-container" key={"calendar-body-month-day-container-" + index}>
                                    <div className="calendar-body-month-day-values">
                                        <div className={"calendar-body-month-day " + value.textColor} key={"calendar-body-month-day-" + index}>{value.day}</div>
                                    </div>
                                    {/* <div className='calendar-body-month-day-events-container'>
                                            <ReturnValueEvents value={value} />
                                    </div> */}
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
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const dispatch = useDispatch();
    return(
        <div className="calendar-body-month-container">
            <CalendarBody currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} />
        </div>
    )
}

export default BodyMonth;