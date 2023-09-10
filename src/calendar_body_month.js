import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';
import { addEvent, changeEvent } from './redux_slices/eventSlice';
import { changeCalendarEvent } from './redux_slices/calendarEventSlice';
import { mouseDown, mouseMove, mouseUp, setEditing } from './redux_slices/currentAddition';
import { changeIndex, changeisMoving, changeHasBeenMoving } from './redux_slices/moveEvent';
import { changeViewAllContents, changeSingleViewAllContents } from './redux_slices/viewAllSlice';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';
import getHourAndMinutes from './calendar_body_useful_functions/get_hours_and_minutes';
import PopupPreview from './calendar_body_month_components/popup_preview';
import addZeroes from './calendar_shared_components/add_zeroes_to_dates';
import { current } from '@reduxjs/toolkit';


function CalendarBody({currentDate, currentEvents, currentUnwantedColors, dispatch, setCurEvent, setIsVisible, currentAddition, currentAdditionIsMouseDown, currentAdditionEditing, currentMoveEvent, setCurReference}) {
    const [curHeight, setCurHeight] = useState(window.innerHeight);

    useEffect(() => {
        function listenWindowChange() {
            setCurHeight(window.innerHeight);
        }
        window.addEventListener('resize', listenWindowChange);

        return () => window.removeEventListener('resize', listenWindowChange);
    }, []);

    const convertWeeks = [["Sunday", "S", "Sun"], ["Monday", "M", "Mon"], ["Tuesday", "T", "Tue"], ["Wednesday", "W", "Wed"], ["Thursday", "Th", "Thu"], ["Friday", "F", "Fri"], ["Saturday", "Sa", "Sat"]];
    const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
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

    let firstOfMonth = new Date(curYear, curMonth, 1);

    let lastOfMonth = new Date(curYear, curMonth, daysInMonths[curMonth]);

    let weekAddition = [];

    const startEndDates = () => {

        const dateHelper = (date) => {
            return new Date(curYear, curMonth, date + 1)
        }

        const dateHelperMinus = (date) => {
            return new Date(curYear, curMonth, date - 1)
        }

        let returnValue = [];

        for(let i = firstOfMonth.getDay() * -1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i += 7) {
            returnValue.push(dateHelper(i));
        }

        let weekTime = returnValue.map((week) => {
            return week;
        })

        return([dateHelper(firstOfMonth.getDay() * -1), dateHelperMinus(daysInMonths[curMonth] + 7 - lastOfMonth.getDay()), weekTime])
    }

    const getWeek = (event) => {
        const [, , weekTime] = startEndDates();
        let eventStartWeekDay = new Date(event.startDate);
        let eventEndWeekDay = new Date(event.endDate);
        let startWeek = -1;
        let endWeek = 6;

        //console.log(weekTime)

        for(let i = 0; i < weekTime.length - 1; i++) {
            if(eventStartWeekDay.getTime() >= weekTime[i].getTime() && eventStartWeekDay.getTime() < weekTime[i+1].getTime()) {
                startWeek = i;
                break;
            }
        }

        for(let i = 0; i < weekTime.length - 1; i++) {
            if(eventEndWeekDay.getTime() >= weekTime[i].getTime() && eventEndWeekDay.getTime() < weekTime[i+1].getTime()) {
                endWeek = i;
                break;
            }
        }

        //console.log({"eventStartWeek" : startWeek, "eventStartDay" : eventStartWeekDay.getDay(), "eventEndWeek" : endWeek, "eventEndDay" : eventEndWeekDay.getDay()})
        
        return {"eventStartWeek" : startWeek, "eventStartDay" : eventStartWeekDay.getDay(), "eventEndWeek" : endWeek, "eventEndDay" : eventEndWeekDay.getDay()};
    }

    let longEvents = [...currentEvents].map((event, index) => {
        let objNow = {"index" : index}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    }).filter((event) => {
        return (new Date(event.startDate).getTime() !== new Date(event.endDate).getTime()) && event.repeat && currentUnwantedColors.indexOf(event.color) === -1;
    }).map((event) => {
        let [start, end] = startEndDates();
        return createEventsRepeated(event, new Date(start).getTime(), new Date(end).getTime());
    }).flat().map((event) => {
        let objNow = {"weekAndDay" : getWeek(event)}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    }).concat([...currentEvents].map((event, index) => {
        let objNow = {"index" : index}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    }).filter((event) => {
        const [start, end] = startEndDates();
        return filterEventsStartEnd(event, start, end, currentUnwantedColors) && (new Date(event.startDate).getTime() !== new Date(event.endDate).getTime()) && !event.repeat;
    }).map((event) => {
        let objNow = {"weekAndDay" : getWeek(event)}
        let returnedObj = Object.assign(objNow, event)
        return returnedObj;
    })).sort((a, b) => {
        return (new Date(a.startTime).getTime()) - (new Date(b.startTime).getTime())
    });


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

        let eventsToday = [...currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => {
            return !(new Date(event.startDate).getTime() !== new Date(event.endDate).getTime()) && event.repeat && currentUnwantedColors.indexOf(event.color) === -1;
        }).map((event) => {
            return createEventsRepeated(event, new Date(yearNow, monthNow, dayNow).getTime(), new Date(yearNow, monthNow, dayNow).getTime());
        }).flat().map((event) => {
            let objNow = {"weekAndDay" : getWeek(event)}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).concat([...currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => {
            return filterEventsStartEnd(event, new Date(yearNow, monthNow, dayNow), new Date(yearNow, monthNow, dayNow), currentUnwantedColors) && !(new Date(event.startDate).getTime() !== new Date(event.endDate).getTime()) && !event.repeat
        }).map((event) => {
            let objNow = {"weekAndDay" : getWeek(event)}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        })).sort((a, b) => {
            return (new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes()) - (new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes())
        });

        let numberOfEvents = longEvents.filter((event) => filterEventsStartEnd(event, new Date(yearNow, monthNow, dayNow), new Date(yearNow, monthNow, dayNow), currentUnwantedColors)).length + eventsToday.length;

        weekAddition.push({"year" : yearNow, "month" : monthNow, "day" : dayNow, "textColor" : textColor, "eventsToday" : eventsToday, "numberOfEvents" : numberOfEvents});

        if(weekAddition.length === 7) {
            calendarArray.push(weekAddition);
            weekAddition = [];
        }
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
                    dispatch(changeHasBeenMoving(false));
                    if(!currentMoveEvent.hasBeenMoving) {
                        let calendarLayout = document.querySelector(".calendar-body-month").getBoundingClientRect();
                        let extraLayout = document.querySelector(".calendar-body-month-container").getBoundingClientRect();
                        let r = document.querySelector('.popup-preview-container');
                        let numOfWeeks = calendarArray.length;
                        let extraAddition = extraLayout.height * 0.025;
                        setIsVisible("visibility-visible");
                        setCurEvent(event);
                        //20 + index * (calendarLayout.height - 20) / calendarArray.length + 35 + row * 20
                        let top = (20 + index * (calendarLayout.height - 50) / calendarArray.length + 35 + (row + 1) * 20);
                        let bottom = ((numOfWeeks - index) * (calendarLayout.height - 50) / calendarArray.length - (row + 1) * 20 + 5);
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
                                r.style.setProperty("transform", "")
                            } else {
                                r.style.setProperty("top", "")
                                r.style.setProperty("left", "")
                                r.style.setProperty("right", right + "%")
                                r.style.setProperty("bottom", bottom + "%")
                                r.style.setProperty("transform", "")
                            }
                            
                        } else {
                            if(startRow - 1 < 4) {
                                r.style.setProperty("top", "calc(" + top + "%" + " + " + extraAddition + "px"+ ")")
                                r.style.setProperty("left", left + "%")
                                r.style.setProperty("right", "")
                                r.style.setProperty("bottom", "")
                                r.style.setProperty("transform", "")
                            } else {
                                r.style.setProperty("top", "calc(" + top + "%" + " + " + extraAddition + "px"+ ")")
                                r.style.setProperty("left", "")
                                r.style.setProperty("right", right + "%")
                                r.style.setProperty("bottom", "")
                                r.style.setProperty("transform", "")
                            }

                        }
                    }
                    
                }

                const handleEventsOnMouseDown = (e) => {
                    setCurReference(e.target);
                    dispatch(changeIndex(event.index));
                    dispatch(changeisMoving(true));
                }

                
                //console.log([startRow, endRow, eventStartTime, eventEndTime, eventTime, extraClasses])

                if(row > -1) return(
                    <div className={'calendar-body-month-week-events' + extraClasses} key={'calendar-body-month-week-events-' + i} style={{"gridColumn" : startRow + "/" + endRow, "backgroundColor" : event.color, "top" : (row * 20) + "px", "color" : textColor, "cursor" : "pointer"}} onMouseUp={() => handleEventsOnClick()} onMouseDown={(e) => handleEventsOnMouseDown(e)} onTouchStart={(e) => handleEventsOnMouseDown(e)}>
                        <div className='calendar-body-month-day-events-time'>{eventTime}</div>
                        <div className='calendar-body-month-day-events-title'>{event.title}</div>
                    </div>
                )
            }
        })

        let numEventsVar = item.map((value, i) => {
            let curDateStr = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
            let extraEvents = longEvents.filter((event) => {
                return filterEventsStartEnd(event, curDateStr, curDateStr, currentUnwantedColors);
            });
            //console.log(value.month + 1 + " " + value.day + "    " + extraEvents)
            let numEvents = value.numberOfEvents;
            let numEventsStr = "";
            let combinedEvents = value.eventsToday.concat(...extraEvents);
            //dispatch(changeViewAllContents({"date" : new Date(value.month + 1 + " " + value.day + " " + value.year), "column" : new Date(value.month + 1 + " " + value.day + " " + value.year).getDay(), "row" : index, "events" : combinedEvents, "visibility" : "visibility-visible"}))
            let curColumn = new Date(value.year, value.month, value.day).getDay() + 1;
            if(numEvents > Math.min(4, Math.floor(((((curHeight - 71) * 0.95) - 20) / calendarArray.length - 52) / 20)) && numEvents !== 0) {
                numEventsStr = "View More (" + numEvents + ")";
            } else {
                numEventsStr = "";
            }

            const handleViewAllOnClick = () => {
                dispatch(changeViewAllContents({"date" : value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00', "month": convertMonths[value.month], "day" : value.day, "column" : new Date(value.year, value.month, value.day).getDay(), "row" : index, "events" : combinedEvents, "visibility" : "visibility-visible", "numberOfWeeks" : calendarArray.length}))
            }

            if(numEvents > Math.min(4, Math.floor(((((curHeight - 71) * 0.95) - 20) / calendarArray.length - 52) / 20)) && numEvents !== 0) return (
                <div onClick={() => handleViewAllOnClick()} className={'calendar-body-month-day-events-number'} key={'calendar-body-month-day-events-number-' + i} style={{"gridColumn" : curColumn + " / " + (curColumn + 1)}}>{numEventsStr}</div>
            );
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
                "functionWanted" : "edit-delete",
                "editingIndex" : currentEvents.length - 1,
                "originalColor" : "#9fc0f5",
                "isAllDay" : {"one" : true, "two": true},
                "repeat" : false,
                "repeatSpecifics" : {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []},
                "repeatEnding" : {"never" : false, "onDay" : null, "afterIterations" : null},
                "repeatExceptions" : {},
            }
            dispatch(changeCalendarEvent(EditingObj));
            dispatch(setEditing(true));
        }

        if(currentAdditionIsMouseDown) {
            window.addEventListener("mouseup", handleOnMouseUp);
            window.addEventListener("touchend", handleOnMouseUp);

            const cleanUpListener = () => {
                window.removeEventListener("mouseup", handleOnMouseUp);
                window.removeEventListener("touchend", handleOnMouseUp);
            }
            return cleanUpListener;
        }

    });

    useEffect(() => {
        const handleOnMouseUp = () => {
            dispatch(changeIndex(-1));
            dispatch(changeisMoving(false));
            dispatch(changeHasBeenMoving(false));
        }

        if(currentMoveEvent.isMoving) {
            window.addEventListener("mouseup", handleOnMouseUp);
            window.addEventListener("touchend", handleOnMouseUp);

            const cleanUpListener = () => {
                window.removeEventListener("mouseup", handleOnMouseUp);
                window.addEventListener("touchend", handleOnMouseUp);
            }
            return cleanUpListener;
        }

    });

    //console.log(calendarArray)

    const returnValue = calendarArray.map((item, index) =>
                    <div className='calendar-body-month-week-group' key={"calendar-body-month-week-" + index}>
                        <div className='calendar-body-month-week-group-events'>
                            <ReturnEvents item={item} index={index} />
                        </div>
                        {item.map((value, i) => {

                            const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                            // const dateDifference = (originalStart, originalEnd, newStart) => {
                            //     let dateDifference = 0;
                            //     let originalStartDays = originalStart.getFullYear() * 365 + Math.floor(originalStart.getFullYear() / 4) - Math.floor(originalStart.getFullYear() / 100);
                            //     let originalEndDays = originalEnd.getFullYear() * 365 + Math.floor(originalEnd.getFullYear() / 4) - Math.floor(originalEnd.getFullYear() / 100);
                            //     let daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                            //     if(originalStart.getFullYear() % 4 === 0 && originalStart.getFullYear() % 100 !== 0) {
                            //         daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                            //     }
                            //     for(let i = 0; i < originalStart.getMonth(); i++) {
                            //         originalStartDays += daysInMonths[i];
                            //     }
                            //     originalStartDays += originalStart.getDate();

                            //     if(originalEnd.getFullYear() % 4 === 0 && originalEnd.getFullYear() % 100 !== 0) {
                            //         daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                            //     } else {
                            //         daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                            //     }
                            //     for(let i = 0; i < originalEnd.getMonth(); i++) {
                            //         originalEndDays += daysInMonths[i];
                            //     }
                            //     originalEndDays += originalEnd.getDate();

                                
                            //     //console.log("originalStartDays " + originalStart + "   originalEndDays " + originalEnd)

                            //     dateDifference = originalStartDays - originalEndDays;

                            //     let newStartCopy = new Date(newStart.toString())

                            //     let returnedVal = newStart;

                            //     if(dateDifference > 1) {
                            //         for(let i = 0; i < dateDifference; i++) {
                            //             originalEnd.setDate(originalEnd.getDate() + 1);
                            //         }
                            //     } else {
                            //         for(let i = 0; i < dateDifference * -1; i++) {
                            //             originalEnd.setDate(originalEnd.getDate() - 1);
                            //         }
                            //     }

                            //     return [newStartCopy, originalEnd];
                            // }

                            const handleChangeEvent = (currentIndex) => {
                                let curEvent = {...currentEvents[currentIndex]};
                                let curEventStart = new Date(curEvent.startDate).getTime();
                                let curEventEnd = new Date(curEvent.endDate).getTime();
                                let timeDifference = Math.round((new Date(value.year, value.month, value.day).getTime() - curEventStart) / 86400000) * 86400000;
                                curEventStart = new Date(Math.round((curEventStart + timeDifference) / 86400000) * 86400000 + new Date().getTimezoneOffset() * 60000);
                                curEventEnd = new Date(Math.round((curEventEnd + timeDifference) / 86400000) * 86400000 + new Date().getTimezoneOffset()*60000);
                                let curEventStartStr = (curEventStart.getFullYear() + "-" + addZeroes(curEventStart.getMonth() + 1) + "-" + addZeroes(curEventStart.getDate()) + 'T00:00:00');
                                let curEventEndStr = (curEventEnd.getFullYear() + "-" + addZeroes(curEventEnd.getMonth() + 1) + "-" + addZeroes(curEventEnd.getDate()) + 'T00:00:00');
                                let curEventStartStrMonth = (convertMonths[curEventStart.getMonth()] + " " + curEventStart.getDate() + ", " + curEventStart.getFullYear());
                                let curEventEndStrMonth = (convertMonths[curEventEnd.getMonth()] + " " + curEventEnd.getDate() + ", " + curEventEnd.getFullYear());
                                let curDateOne = {"year": curEventStart.getFullYear(), "month": curEventStart.getMonth(), "day": curEventStart.getDate()};
                                let curDateTwo = {"year": curEventEnd.getFullYear(), "month": curEventEnd.getMonth(), "day": curEventEnd.getDate()};
                                let objNow = {"startDate" : curEventStartStr, "endDate" : curEventEndStr, "startTime" : curEventStartStr, "endTime" : curEventEndStr, "rawStartDate" : curEventStartStrMonth, "rawEndDate" : curEventEndStrMonth, "curDateOne" : curDateOne, "curDateTwo" : curDateTwo};
                                let returnedObj = Object.assign(curEvent, objNow);
                                dispatch(changeEvent({"index" : currentIndex, "value" : returnedObj}));
                            }

                            const handleChangeEventMove = (currentIndex) => {
                                //console.log('hmmmmmmmmmmm')
                                let curEvent = {...currentEvents[currentIndex]};
                                let curEventStart = new Date(curEvent.startDate).getTime();
                                let curEventEnd = new Date(curEvent.endDate).getTime();
                                //console.log(new Date(value.year, value.month, value.day))
                                let timeDifference = Math.round((new Date(value.year, value.month, value.day).getTime() - curEventStart) / 86400000) * 86400000;
                                //console.log(new Date(Math.round((curEventStart + timeDifference) / 86400000) * 86400000) + "        " + new Date(curEventStart + timeDifference))
                                curEventStart = new Date(Math.round((curEventStart + timeDifference) / 86400000) * 86400000 + new Date().getTimezoneOffset() * 60000);
                                curEventEnd = new Date(Math.round((curEventEnd + timeDifference) / 86400000) * 86400000 + new Date().getTimezoneOffset() * 60000);
                                let curEventStartStr = (curEventStart.getFullYear() + "-" + addZeroes(curEventStart.getMonth() + 1) + "-" + addZeroes(curEventStart.getDate()));
                                let curEventEndStr = (curEventEnd.getFullYear() + "-" + addZeroes(curEventEnd.getMonth() + 1) + "-" + addZeroes(curEventEnd.getDate()));
                                let curEventStartStrMonth = (convertMonths[curEventStart.getMonth()] + " " + curEventStart.getDate() + ", " + curEventStart.getFullYear());
                                let curEventEndStrMonth = (convertMonths[curEventEnd.getMonth()] + " " + curEventEnd.getDate() + ", " + curEventEnd.getFullYear());
                                let curDateOne = {"year": curEventStart.getFullYear(), "month": curEventStart.getMonth(), "day": curEventStart.getDate()};
                                let curDateTwo = {"year": curEventEnd.getFullYear(), "month": curEventEnd.getMonth(), "day": curEventEnd.getDate()};
                                let objNow = {"startDate" : curEventStartStr + "T00:00:00", "endDate" : curEventEndStr + "T00:00:00", "rawStartDate" : curEventStartStrMonth, "rawEndDate" : curEventEndStrMonth, "curDateOne" : curDateOne, "curDateTwo" : curDateTwo};
                                objNow["startTime"] = (curEventStartStr + "T" + addZeroes(new Date(curEvent.startTime).getHours()) + ":" + addZeroes(new Date(curEvent.startTime).getMinutes()))
                                objNow["endTime"] = (curEventEndStr + "T" + addZeroes(new Date(curEvent.endTime).getHours()) + ":" + addZeroes(new Date(curEvent.endTime).getMinutes()))
                                let returnedObj = Object.assign(curEvent, objNow);
                                //console.log(returnedObj)
                                //console.log(currentEvents)
                                dispatch(changeEvent({"index" : currentIndex, "value" : returnedObj}));
                            }
                            
                            const handleOnMouseDown = () => {
                                dispatch(mouseDown({"start" : {"month" : value.month, "day": value.day, "year" : value.year}, "end" : {"month" : value.month, "day": value.day, "year" : value.year}}));
                                let finalObj = {};
                                finalObj["title"] = "[No Title]";
                                finalObj["startDate"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                finalObj["endDate"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                finalObj["startTime"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                finalObj["endTime"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
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
                                finalObj["repeat"] = false;
                                finalObj["repeatSpecifics"] = {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []};
                                finalObj["repeatEnding"] = {"never" : false, "onDay" : null, "afterIterations" : null};
                                finalObj["repeatExceptions"] = {};
                                if(!currentAdditionEditing) {
                                    dispatch(addEvent(finalObj));
                                }
                                else {
                                    handleChangeEvent(currentEvents.length-1);
                                }
                            }

                            const handleOnMouseMove = () => {
                                let startTime = new Date(currentAddition.start.year, currentAddition.start.month, currentAddition.start.day).getTime();
                                let endTime = new Date(value.year, value.month, value.day).getTime();
                                if(currentAdditionIsMouseDown && endTime >= startTime) {
                                    dispatch(mouseMove({"month" : value.month, "day": value.day, "year" : value.year}));
                                    let eventNow = {...currentEvents[currentEvents.length-1]};
                                    eventNow["endDate"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                    eventNow["endTime"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                    eventNow["rawEndDate"] = convertMonths[value.month] + " " + value.day + ", " + value.year;
                                    eventNow["curDateTwo"] = {"year": value.year, "month": value.month, "day": value.day};
                                    if(!currentAdditionEditing) {
                                        dispatch(changeEvent({"index" : currentEvents.length-1, "value" : eventNow}));
                                    }
                                }

                                if(currentMoveEvent.isMoving) {
                                    handleChangeEventMove(currentMoveEvent.index);
                                    dispatch(changeHasBeenMoving(true));
                                    setIsVisible("visibility-hidden");
                                }
                            }

                            const handleOnTouchMove = (e) => {
                                let startTime = new Date(currentAddition.start.year, currentAddition.start.month, currentAddition.start.day).getTime();
                                let endTime = new Date(value.year, value.month, value.day).getTime();
                                if(currentAdditionIsMouseDown && endTime >= startTime) {
                                    dispatch(mouseMove({"month" : value.month, "day": value.day, "year" : value.year}));
                                    let eventNow = {...currentEvents[currentEvents.length-1]};
                                    eventNow["endDate"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                    eventNow["endTime"] = value.year + "-" + addZeroes(value.month + 1) + "-" + addZeroes(value.day) + 'T00:00:00';
                                    eventNow["rawEndDate"] = convertMonths[value.month] + " " + value.day + ", " + value.year;
                                    eventNow["curDateTwo"] = {"year": value.year, "month": value.month, "day": value.day};
                                    if(!currentAdditionEditing) {
                                        dispatch(changeEvent({"index" : currentEvents.length-1, "value" : eventNow}));
                                    }
                                }

                                if(currentMoveEvent.isMoving) {
                                    handleChangeEventMove(currentMoveEvent.index);
                                    dispatch(changeHasBeenMoving(true));
                                    setIsVisible("visibility-hidden");
                                }
                            }

                            const changeDateOnClick = (e, month, day, year) => {
                                e.stopPropagation()
                                dispatch(changeDate({"year" : year, "month" : month, "day" : day}));
                                dispatch(changeDateSpecifics("day"));
                            }

                            return (
                                <div className="calendar-body-month-day-container" key={"calendar-body-month-day-container-" + i} onMouseDown={() => handleOnMouseDown()} onTouchStart={(e) => e.stopPropagation()} onMouseMove={() => handleOnMouseMove()} onTouchMove={(e) => handleOnTouchMove(e)} style={{"gridColumn" : (i + 1) + " / " + (i + 2)}} draggable={false}>
                                    <div className="calendar-body-month-day-values">
                                        <div className={"calendar-body-month-day " + value.textColor} onMouseDown={(e) => changeDateOnClick(e, value.month, value.day, value.year)}>{value.day}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className='calendar-body-month-divider-line-horizontal'></div>
                    </div>
                );

    return(
        <div className='calendar-body-month'>
            {returnCalendar}
            <div className='calendar-body-month-week-group-container'>
                {returnValue}
            </div>
        </div>
    )
}

function PopupViewAll({currentViewAll, dispatch, setCurEvent, setIsVisible, setCurReference}) {

    //console.log("calc( 2.5% + " + (currentViewAll.row * 95 / 7) + "% )" + "calc(" + (currentViewAll.column * 100 / 5) + "% )")

    let curStyling = ({"top" : "calc( 2.5% + 20px + " + ((currentViewAll.row + 0.5) * 95 / currentViewAll.numberOfWeeks / 100) + "* (95% - 20px) )", "left" : "calc( 2.5% + " + ((currentViewAll.column + 0.5) * 95 / 7) + "% )", "right" : "", "bottom" : "", "transform" : "translateX(-50%) translateY(-50%)"});

    if(currentViewAll.row >= currentViewAll.numberOfWeeks - 2) {
        curStyling["top"] = "";
        curStyling["bottom"] = "calc( 2.5% + " + ((currentViewAll.numberOfWeeks - 1 - currentViewAll.row) * 95 / currentViewAll.numberOfWeeks / 100) + "* (95%) )";
        curStyling["transform"] = "translateX(-50%)"
    }

    if(currentViewAll.row === 0) {
        curStyling["top"] = "calc(2.5% + 20px)";
        curStyling["bottom"] = "";
        curStyling["transform"] = "translateX(-50%)"
    }

    const convertWeeks = [["Sunday", "S", "Sun"], ["Monday", "M", "Mon"], ["Tuesday", "T", "Tue"], ["Wednesday", "W", "Wed"], ["Thursday", "Th", "Thu"], ["Friday", "F", "Fri"], ["Saturday", "Sa", "Sat"]];

    const ref = useRef();

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(currentViewAll.visibility === "visibility-visible" && ref.current && !ref.current.contains(e.target) && !document.querySelector(".popup-preview-container").contains(e.target)) {
                dispatch(changeSingleViewAllContents({"key" : "visibility", "value" : "visibility-hidden"}));
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [currentViewAll.visibility]);

    const handleViewAllClose = () => {
        dispatch(changeSingleViewAllContents({"key" : "visibility", "value" : "visibility-hidden"}));
    }

    const viewAllEvents = currentViewAll.events.map((event, index) => {
        const handleEventsOnClick = (e) => {
                let r = document.querySelector('.popup-preview-container');
                setCurReference(e.target);
                setIsVisible("visibility-visible");
                setCurEvent(event);
                r.style.top = (e.target.getBoundingClientRect().y - 71) + "px";
                r.style.bottom = "";
                r.style.left = (e.target.getBoundingClientRect().left + e.target.getBoundingClientRect().width - 281) + "px";
                r.style.right = "";
                r.style.transform = "translateY(-100%) translateX(-100%)";
        }
        let eventStartTime = new Date(event.startDate).getTime();
        let eventEndTime = new Date(event.endDate).getTime();
        let newDate = new Date(currentViewAll.date).getTime();
        let eventTime = "All Day";
        let textColor = "black";
        if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(event.color) === -1) {
            textColor = "white";
        }
        if(eventStartTime === newDate) {
            eventTime = getHourAndMinutes(new Date(event.startTime).getHours(), new Date(event.startTime).getMinutes(), event.isAllDay.one)
        } else if(eventEndTime === newDate) {
            eventTime = getHourAndMinutes(new Date(event.endTime).getHours(), new Date(event.endTime).getMinutes(), event.isAllDay.two)
        }

        return(
            <div className='popup-view-all-events' key={'calendar-body-month-week-events-' + index} onMouseDown={(e) => handleEventsOnClick(e)} style={{"backgroundColor" : event.color, "color" : textColor}}>
                <div className='popup-view-all-events-time'>{eventTime}</div>
                <div className='popup-view-all-events-title'>{event.title}</div>
            </div>
        )
    })

    return(
        <div className={"popup-view-all-container " + currentViewAll.visibility} ref={ref} style={curStyling}>
            <div className="popup-view-all-exit-button" onClick={() => handleViewAllClose()}>
                <svg className='svg-fill' xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </div>
            <div className="popup-view-all-title-container">
                <div className="popup-view-all-weekday">{convertWeeks[currentViewAll.column][2]}</div>
                <div className="popup-view-all-date">
                    <div className="popup-view-all-month">{currentViewAll.month}</div>
                    <div className="popup-view-all-day">{currentViewAll.day}</div>
                </div>
            </div>
            <div className="popup-view-all-events-container">
                {viewAllEvents}
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
    const currentAdditionEditing = useSelector((state) => state.currentAddition.isCurrentlyEditing);
    const currentMoveEvent = useSelector((state) => state.moveEvent);
    const currentViewAll = useSelector((state) => state.viewAll.contents);
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState("visibility-hidden");
    const [curEvent, setCurEvent] = useState({});
    const [curReference, setCurReference] = useState(useRef());
    return(
        <div className="calendar-body-month-container">
            <CalendarBody currentDate={currentDate} currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} setCurEvent={setCurEvent} setIsVisible={setIsVisible} currentAddition={currentAddition} currentAdditionIsMouseDown={currentAdditionIsMouseDown} currentAdditionEditing={currentAdditionEditing} currentMoveEvent={currentMoveEvent} setCurReference={setCurReference}/>
            <PopupPreview isVisible={isVisible} setIsVisible={setIsVisible} event={curEvent} dispatch={dispatch} setCurReference={setCurReference} currentEvents={currentEvents}/>
            <PopupViewAll currentViewAll={currentViewAll} dispatch={dispatch} currentMoveEvent={currentMoveEvent} setCurEvent={setCurEvent} setIsVisible={setIsVisible} setCurReference={setCurReference}/>
        </div>
    )
}

export default BodyMonth;