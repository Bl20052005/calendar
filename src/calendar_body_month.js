import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate } from './dateSlice';
import { addEvent, removeEvent, changeEvent } from './eventSlice';
import { changeSingleCalendarEvent, changeCalendarEvent } from './calendarEventSlice';
import { removeTotalColor } from './colorSlice';
import { mouseDown, mouseMove, mouseUp } from './currentAddition';
import { current } from '@reduxjs/toolkit';


function CalendarBody({currentDate, currentEvents, currentUnwantedColors, dispatch, setCurEvent, setIsVisible, currentAddition, currentAdditionIsMouseDown}) {
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
        let yearStart = curYear;
        let yearEnd = curYear;
        let monthStart = curMonth;
        let monthEnd = curMonth;

        if(start < 0) {
            if(curMonth === 0) yearStart -= 1;
            monthStart = (12 + monthStart - 1) % 12;
            start = daysInMonths[monthStart] + start + 1;
        }

        if(start === 0) {
            start = 1;
        }
        
        if(end > daysInMonths[monthEnd]) {
            if(curMonth === 11) yearEnd += 1;
            monthEnd = (monthEnd + 1) % 12;
            end = end - daysInMonths[curMonth];
        }

        return([new Date(monthStart + 1 + " " + start + " " + yearStart), new Date(monthEnd + 1 + " " + end + " " + yearEnd)])
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

    let longEvents = [...currentEvents].map((event, index) => {
        let objNow = {"index" : index}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    }).filter((event) => {
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

        let eventsToday = [...currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => filterEvents(event, new Date(monthNow + 1 + " " + dayNow + " " + yearNow), currentUnwantedColors) && !(new Date(event.startDate).getTime() !== new Date(event.endDate).getTime())).sort((a, b) => {
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
                    if(!event.isAllDay.one) eventTime = getHourAndMinutes(new Date(event.startTime).getHours(), new Date(event.startTime).getMinutes())
                    else eventTime = "All Day,";
                }

                let extraClasses = "";
                if(currentAdditionIsMouseDown) extraClasses += " pointerEvents-none";

                const handleEventsOnClick = () => {
                    let calendarLayout = document.querySelector(".calendar-body-month").getBoundingClientRect();
                    let extraLayout = document.querySelector(".calendar-body-month-container").getBoundingClientRect();
                    let r = document.querySelector('.popup-preview-container');
                    let extraAddition = extraLayout.height * 0.025;
                    setIsVisible("visibility-visible");
                    setCurEvent(event);
                    //20 + index * (calendarLayout.height - 20) / calendarArray.length + 35 + row * 20
                    let top = (20 + index * (calendarLayout.height - 50) / calendarArray.length + 35 + (row + 1) * 20);
                    let bottom = ((5 - index) * (calendarLayout.height - 50) / calendarArray.length - (row + 1) * 20 + 5);
                    let left = ((startRow - 1) * calendarLayout.width / 7);
                    let right = ((7 - (endRow - 1)) * calendarLayout.width / 7 + 20);
                    top = (top / calendarLayout.height * 100);
                    left = (left / calendarLayout.width * 100);
                    bottom = (bottom / calendarLayout.height * 100);
                    right = (right / calendarLayout.width * 100);
                    if(left + 350 > calendarLayout.width) {
                        left -= (left + 350 - calendarLayout.width)
                    }

                    if(index > 2) {
                        if(startRow - 1 < 4) {
                            r.style.setProperty("top", "")
                            r.style.setProperty("left", left + "%")
                            r.style.setProperty("right", "")
                            r.style.setProperty("bottom", bottom + "%")
                        } else {
                            r.style.setProperty("top", "")
                            r.style.setProperty("left", "")
                            r.style.setProperty("right", right + "%")
                            r.style.setProperty("bottom", bottom + "%")
                        }
                        
                    } else {
                        if(startRow - 1 < 4) {
                            r.style.setProperty("top", "calc(" + top + "%" + " + " + extraAddition + "px"+ ")")
                            r.style.setProperty("left", left + "%")
                            r.style.setProperty("right", "")
                            r.style.setProperty("bottom", "")
                        } else {
                            r.style.setProperty("top", "calc(" + top + "%" + " + " + extraAddition + "px"+ ")")
                            r.style.setProperty("left", "")
                            r.style.setProperty("right", right + "%")
                            r.style.setProperty("bottom", "")  
                        }

                    }
                }

                if(row > -1) return(
                    <div className={'calendar-body-month-week-events' + extraClasses} key={'calendar-body-month-week-events-' + i} style={{"gridColumn" : startRow + "/" + endRow, "backgroundColor" : event.color, "top" : (row * 20) + "px", "color" : textColor}} onClick={() => handleEventsOnClick()}>
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

        let numEventsVar = item.map((value, index) => {
            let numEvents = value.numberOfEvents;
            if(numEvents > 4) {
                numEvents = "View More (" + numEvents + ")";
            } else {
                numEvents = "";
            }
            if(numEvents !== "") return (<div className='calendar-body-month-day-events-number calendar-body-month-day-events-number-hover' key={'calendar-body-month-day-events-number-' + index}>{numEvents}</div>);
            else return(<div className='calendar-body-month-day-events-number' key={'calendar-body-month-day-events-number-' + index}>{numEvents}</div>)
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

    useEffect(() => {
        const handleOnMouseUp = () => {
            let eventNow = {...currentEvents[currentEvents.length-1]};
            dispatch(mouseUp({"month" : eventNow["curDateTwo"].month, "day": eventNow["curDateTwo"].day, "year" : eventNow["curDateTwo"].year}));
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
                "curTimeOne" : "--:--",
                "curTimeTwo" : "--:--",
                "curTimeDisabled": {"one" : "input-disabled", "two" : "input-disabled"},
                "isMouseDown" : false,
                "originalCoords" : [0,0],
                "selectedColor" : "#9fc0f5",
                "curTitle" : "",
                "curDescription" : "",
                "wrongInputs" : {"time1" : "", "time2" : "", "date1" : "", "date2": ""},
                "isThisVisible" : "visibility-visible",
                "functionWanted" : "edit",
                "editingIndex" : currentEvents.length - 1,
                "originalColor" : "#9fc0f5",
                "isAllDay" : {"one" : true, "two": true},
            }
            dispatch(changeCalendarEvent(EditingObj));
        }

        if(currentAdditionIsMouseDown) {
            window.addEventListener("mouseup", handleOnMouseUp);

            const cleanUpListener = () => {
                window.removeEventListener("mouseup", handleOnMouseUp);
            }
            return cleanUpListener;
        }

    })

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='calendar-body-month-week-group' key={"calendar-body-month-week-" + index}>
                        <div className='calendar-body-month-week-group-events'>
                            <ReturnEvents item={item} index={index} />
                        </div>
                        {item.map((value, i) => {

                            const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                            
                            const handleOnMouseDown = () => {
                                dispatch(mouseDown({"start" : {"month" : value.month, "day": value.day, "year" : value.year}, "end" : {"month" : value.month, "day": value.day, "year" : value.year}}));
                                let finalObj = {};
                                finalObj["title"] = "[No Title]";
                                finalObj["startDate"] = value.month + 1 + " " + value.day + " " + value.year;
                                finalObj["endDate"] = value.month + 1 + " " + value.day + " " + value.year;
                                finalObj["startTime"] = value.month + 1 + " " + value.day + " " + value.year;
                                finalObj["endTime"] = value.month + 1 + " " + value.day + " " + value.year;
                                finalObj["rawStartDate"] = convertMonths[value.month] + " " + value.day + ", " + value.year;
                                finalObj["rawStartTime"] = "";
                                finalObj["rawEndDate"] = convertMonths[value.month] + " " + value.day + ", " + value.year;
                                finalObj["rawEndTime"] = "";
                                finalObj["color"] = "#9fc0f5";
                                finalObj["location"] = "";
                                finalObj["description"] = "";
                                finalObj["curDateOne"] = {"year": value.year, "month": value.month, "day": value.day};
                                finalObj["curDateTwo"] = {"year": value.year, "month": value.month, "day": value.day};
                                finalObj["previousTime"] = {};
                                finalObj["isAllDay"] = {"one" : true, "two": true};
                                finalObj["curTimeDisabled"] = {"one" : "input-disabled", "two" : "input-disabled"};
                                dispatch(addEvent(finalObj));
                            }

                            const handleOnMouseMove = () => {
                                let startTime = new Date(currentAddition.start.month + 1 + " " + currentAddition.start.day + " " + currentAddition.start.year).getTime();
                                let endTime = new Date(value.month + 1 + " " + value.day + " " + value.year).getTime();
                                if(currentAdditionIsMouseDown && endTime >= startTime) {
                                    dispatch(mouseMove({"month" : value.month, "day": value.day, "year" : value.year}));
                                    let eventNow = {...currentEvents[currentEvents.length-1]};
                                    eventNow["endDate"] = value.month + 1 + " " + value.day + " " + value.year;
                                    eventNow["endTime"] = value.month + 1 + " " + value.day + " " + value.year;
                                    eventNow["rawEndDate"] = convertMonths[value.month] + " " + value.day + ", " + value.year;
                                    eventNow["curDateTwo"] = {"year": value.year, "month": value.month, "day": value.day};
                                    dispatch(changeEvent({"index" : currentEvents.length-1, "value" : eventNow}));
                                }

                            }

                            // const handleOnMouseUp = () => {
                            //     dispatch(mouseUp({"month" : value.month, "day": value.day, "year" : value.year}));
                            //     // let eventNow = {...currentEvents[currentEvents.length-1]};
                            //     // let EditingObj = {
                            //     //     "curDateOne" : eventNow["curDateOne"],
                            //     //     "curDateTwo" : eventNow["curDateTwo"],
                            //     //     "dateOneInput" : eventNow["rawStartDate"],
                            //     //     "dateTwoInput" : eventNow["rawEndDate"],
                            //     //     "curLocation" : "",
                            //     //     "focusCalendarVisibleOne" : "visibility-hidden",
                            //     //     "focusCalendarVisibleTwo" : "visibility-hidden",
                            //     //     "focusTimeVisibleOne" : "visibility-hidden",
                            //     //     "focusTimeVisibleTwo" : "visibility-hidden",
                            //     //     "previousTime" : {},
                            //     //     "curTimeOne" : "--:--",
                            //     //     "curTimeTwo" : "--:--",
                            //     //     "curTimeDisabled": {"one" : "input-disabled", "two" : "input-disabled"},
                            //     //     "isMouseDown" : false,
                            //     //     "originalCoords" : [0,0],
                            //     //     "selectedColor" : "#9fc0f5",
                            //     //     "curTitle" : "",
                            //     //     "curDescription" : "",
                            //     //     "wrongInputs" : {"time1" : "", "time2" : "", "date1" : "", "date2": ""},
                            //     //     "isThisVisible" : "visibility-visible",
                            //     //     "functionWanted" : "edit",
                            //     //     "editingIndex" : currentEvents.length - 1,
                            //     //     "originalColor" : "#9fc0f5",
                            //     //     "isAllDay" : {"one" : true, "two": true},
                            //     // }
                            //     // dispatch(changeCalendarEvent(EditingObj));
                            // }

                            return (
                                <div className="calendar-body-month-day-container" key={"calendar-body-month-day-container-" + i} onMouseDown={() => handleOnMouseDown()} onMouseMove={() => handleOnMouseMove()} style={{"gridColumn" : (i + 1) + " / " + (i + 2)}}>
                                    <div className="calendar-body-month-day-values">
                                        <div className={"calendar-body-month-day " + value.textColor}>{value.day}</div>
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

function PopupPreview({isVisible, setIsVisible, event, dispatch}) {

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

    const convertWeeks = [["Sunday", "S", "Sun"], ["Monday", "M", "Mon"], ["Tuesday", "T", "Tue"], ["Wednesday", "W", "Wed"], ["Thursday", "Th", "Thu"], ["Friday", "F", "Fri"], ["Saturday", "Sa", "Sat"]];
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getDisplayTime = (event) => {
        let returnStr = "";
        let eventStartDate = new Date(event.startDate);
        let eventEndDate = new Date(event.endDate);
        let eventStartTime = new Date(event.startTime);
        let eventEndTime = new Date(event.endTime);
        if(eventStartDate.getTime() === eventEndDate.getTime()) {
            if(!event.isAllDay.one) returnStr = convertWeeks[eventStartTime.getDay()][0] + ", " + convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " - " + getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes()) + " to " + getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes());
            else returnStr = "All Day, " + convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate();
        } else if(eventStartDate.getFullYear() === eventEndDate.getFullYear()) {
            returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + " to " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate();
        } else {
            returnStr = convertMonths[eventStartTime.getMonth()] + " " + eventStartTime.getDate() + ", " + eventStartDate.getFullYear() + " to " + convertMonths[eventEndTime.getMonth()] + " " + eventEndTime.getDate() + ", " + eventEndTime.getFullYear();
        }

        return returnStr;
    }

    const removeEventOnClick = () => {
        dispatch(removeEvent(event.index));
        setIsVisible("visibility-hidden");
        dispatch(removeTotalColor(event.color));
    }

    function PopupPreviewDescription () {
        if(event.description !== "") {
            return(
                <div className='popup-preview-event-description-container'>
                    <div className='popup-preview-event-description-notes'>Description:</div>
                    <div className='popup-preview-event-description-box'>
                        <div className='popup-preview-event-description'>{event.description}</div>
                    </div>
                    
                </div>
            );
        }
    }

    let EditingObj = {
        "curDateOne" : event.curDateOne,
        "curDateTwo" : event.curDateTwo,
        "dateOneInput" : event.rawStartDate,
        "dateTwoInput" : event.rawEndDate,
        "curLocation" : event.location,
        "focusCalendarVisibleOne" : "visibility-hidden",
        "focusCalendarVisibleTwo" : "visibility-hidden",
        "focusTimeVisibleOne" : "visibility-hidden",
        "focusTimeVisibleTwo" : "visibility-hidden",
        "previousTime" : event.previousTime,
        "curTimeOne" : event.rawStartTime,
        "curTimeTwo" : event.rawEndTime,
        "curTimeDisabled": event.curTimeDisabled,
        "isMouseDown" : false,
        "originalCoords" : [0,0],
        "selectedColor" : event.color,
        "curTitle" : event.title,
        "curDescription" : event.description,
        "wrongInputs" : {"time1" : "", "time2" : "", "date1" : "", "date2": ""},
        "isThisVisible" : "visibility-visible",
        "functionWanted" : "edit",
        "editingIndex" : event.index,
        "originalColor" : event.color,
        "isAllDay" : event.isAllDay,
    }

    const handlePopupEdit = () => {
        dispatch(changeCalendarEvent(EditingObj));
        setIsVisible("visibility-hidden");
    }

    return(
        <div className={'popup-preview-container ' + isVisible}>
            <div className='popup-preview-menu'>
                <svg className='popup-preview-icons' onClick={() => handlePopupEdit()} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 512 512"><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg>
                <svg className='popup-preview-icons' onClick={() => removeEventOnClick()} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 448 512"><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>
                <svg className='popup-preview-icons' onClick={() => setIsVisible("visibility-hidden")} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </div>

            <div className='popup-preview-event'>
                <div className='popup-preview-event-main'>
                    <div className="popup-preview-event-color" style={{"backgroundColor": event.color}}></div>
                    <div className='popup-preview-event-main-sub'>
                        <div className='popup-preview-event-title'>{event.title}</div>
                        <div className='popup-preview-event-time'>{getDisplayTime(event)}</div>
                    </div>
                </div>
                <PopupPreviewDescription />
            </div>

        </div>
    )
}

function BodyMonth() {
    const currentDate = useSelector((state) => state.date);
    const currentEvents = useSelector((state) => state.event.events);
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const currentAddition = useSelector((state) => state.currentAddition.currentEvent);
    const currentAdditionIsMouseDown = useSelector((state) => state.currentAddition.isMouseDown);
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState("visibility-hidden");
    const [curEvent, setCurEvent] = useState({});
    return(
        <div className="calendar-body-month-container">
            <CalendarBody currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} setCurEvent={setCurEvent} setIsVisible={setIsVisible} currentAddition={currentAddition} currentAdditionIsMouseDown={currentAdditionIsMouseDown}/>
            <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={dispatch}/>
        </div>
    )
}

export default BodyMonth;