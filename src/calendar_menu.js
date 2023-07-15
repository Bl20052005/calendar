import React from 'react';
import { useState, useEffect, useRef } from "react";
import { addEvent, removeEvent, changeEvent } from './redux_slices/eventSlice';
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';
import { addUndesiredColor, removeUndesiredColor, addTotalColorNumber, addTotalColor, removeTotalColor, changeTotalColorLabel, changeTotalColorIsLocked } from './redux_slices/colorSlice';
import { changeSingleCalendarEvent, changeCalendarEvent } from './redux_slices/calendarEventSlice';
import addZeroes from './calendar_shared_components/add_zeroes_to_dates';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';
import getHourAndMinutes from './calendar_body_useful_functions/get_hours_and_minutes';
import { setEditing } from './redux_slices/currentAddition';
import { current } from '@reduxjs/toolkit';

// const curDate = useSelector((state) => state.calendar.date);
// const dispatch = useDispatch();

function AddEventPopupCalendar({currentDate, setCurrentDate, setDateInput, focusCalendarVisible}) {
    const convertWeeks = [["Sunday", "S", "SUN"], ["Monday", "M", "MON"], ["Tuesday", "T", "TUE"], ["Wednesday", "W", "WED"], ["Thursday", "Th", "THU"], ["Friday", "F", "FRI"], ["Saturday", "Sa", "SAT"]];
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let daysInMonths = [];
    let calendarArray = [];
    let curDate = currentDate;
    let curMonth = curDate.month;
    let curYear = curDate.year;
    let curDay = curDate.day;

    curYear = new Date(curYear + '-01-01T00:00').getFullYear();

    let today = new Date();
    today = today.getMonth() + " " + today.getDate() + " " + today.getFullYear();

    if(!Number(Date.parse(curDate["day"] + " " + convertMonths[curMonth] + " " + curYear)) || Date.parse(curDate["day"] + " " + convertMonths[curMonth] + " " + curYear).isNaN) {
        let newDate = new Date();
        curDate = {"year": newDate.getFullYear(), "month": newDate.getMonth(), "day": newDate.getDate()};
        curMonth = curDate.month;
        curYear = curDate.year;
        curDay = curDate.day;
    }

    if(curYear % 4 === 0 && curYear % 100 !== 0) {
        daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    } else {
        daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    }

    let firstOfMonth = new Date(curYear, curMonth, 1);
    let lastOfMonth = new Date(curYear, curMonth, daysInMonths[curMonth]);
    let weekAddition = [];

    for(let i = firstOfMonth.getDay() * -1 + 1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i++) {
        let yearNow = curYear;
        if(i < 1) {
            if(curMonth === 0) yearNow -= 1;
            if(((12 + curMonth - 1) % 12) + " " + (daysInMonths[(12 + curMonth - 1) % 12] + i) + " " + curYear === today) weekAddition.push([convertMonths[(12 + curMonth - 1) % 12], daysInMonths[(12 + curMonth - 1) % 12] + i, "date-today", yearNow]);
            else weekAddition.push([(12 + curMonth - 1) % 12, daysInMonths[(12 + curMonth - 1) % 12] + i, "text-color-gray", yearNow]);
        } else if(i >= 1 && i <= daysInMonths[curMonth]) {
            if(curMonth + " " + i + " " + curYear === today) weekAddition.push([curMonth, i, "date-today", yearNow]);
            else if(i === curDay) weekAddition.push([curMonth, i, "date-highlighted", yearNow]);
            else weekAddition.push([curMonth, i, "text-color-black", yearNow]);
        } else {
            if(curMonth === 11) yearNow += 1;
            if(((curMonth + 1) % 12) + " " + (i - daysInMonths[curMonth]) + " " + curYear === today) weekAddition.push([(curMonth + 1) % 12, i - daysInMonths[curMonth], "date-today", yearNow])
            else weekAddition.push([(curMonth + 1) % 12, i - daysInMonths[curMonth], "text-color-gray", yearNow]);
        }
        if(weekAddition.length === 7) {
            calendarArray.push(weekAddition);
            weekAddition = [];
        }
    }

    const returnCalendar = [<div className='add-event-popup-calendar-week-group' key={"add-event-popup-calendar-week-group-0"}>
            {convertWeeks.map((item, index) => {
            return <div className='add-event-popup-calendar-week-top-group' key={'add-event-popup-calendar-week-top-group-' + index}>
                    {item[1]}
                </div>
            })}
        </div>
    ];

    const handleCalendarDayClick = (value) => {
        setCurrentDate({year: value[3], month: value[0], day: value[1]});
        setDateInput(convertMonths[value[0]] + " " + value[1] + ", " + value[3]);
    }

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='add-event-popup-calendar-week-group' key={"add-event-popup-calendar-week-" + index}>
                        {item.map((value, index) => {
                            return <div className={"add-event-popup-calendar-day " + value[2]} key={"add-event-popup-calendar-day-" + index} onClick={() => handleCalendarDayClick(value)}>{value[1]}</div>
                        })}
                    </div>
                ));

    const changeDateEnablerMinus = () => {
        if(curMonth === 0) {
            setCurrentDate({
                year: curYear - 1,
                month: 11,
                day: 1
            });
            setDateInput("December 1, " + (curYear - 1));
        } else {
            setCurrentDate({
                year: curYear,
                month: curMonth - 1,
                day: 1
            });
            setDateInput(convertMonths[curMonth - 1] + " 1, " + curYear);
        }
    }

    const changeDateEnablerPlus = () => {
        if(curMonth === 11) {
            setCurrentDate({
                year: curYear + 1,
                month: 0,
                day: 1
            });
            setDateInput("January 1, " + (curYear + 1));
        } 
        else {
            setCurrentDate({
                year: curYear,
                month: curMonth + 1,
                day: 1
            });
            setDateInput(convertMonths[curMonth + 1] + " 1, " + curYear);
        }
    }

    return(
        <div className={'add-event-popup-calendar ' + focusCalendarVisible}>
            <div className='add-event-popup-calendar-top'>
                <div className='add-event-popup-calendar-arrow-left' onClick={() => changeDateEnablerMinus()}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </div>
                <div className='add-event-popup-calendar-title'>{convertMonths[curMonth]}, {curYear}</div>
                <div className='add-event-popup-calendar-arrow-right' onClick={() => changeDateEnablerPlus()}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                </div>
            </div>
            {returnValue}
        </div>
    )

}

function BaseCalendar({currentDate, dispatch}) {
    const convertWeeks = [["Sunday", "S", "SUN"], ["Monday", "M", "MON"], ["Tuesday", "T", "TUE"], ["Wednesday", "W", "WED"], ["Thursday", "Th", "THU"], ["Friday", "F", "FRI"], ["Saturday", "Sa", "SAT"]];
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

    let firstOfMonth = new Date(curYear, curMonth, 1);

    let lastOfMonth = new Date(curYear, curMonth, daysInMonths[curMonth]);

    let weekAddition = [];

    for(let i = firstOfMonth.getDay() * -1 + 1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i++) {
        let yearNow = curYear;
        if(i < 1) {
            if(curMonth === 0) yearNow -= 1;
            if(((12 + curMonth - 1) % 12) + " " + (daysInMonths[(12 + curMonth - 1) % 12] + i) + " " + curYear === today) weekAddition.push([convertMonths[(12 + curMonth - 1) % 12], daysInMonths[(12 + curMonth - 1) % 12] + i, "date-today", yearNow]);
            else weekAddition.push([(12 + curMonth - 1) % 12, daysInMonths[(12 + curMonth - 1) % 12] + i, "text-color-gray", yearNow]);
        } else if(i >= 1 && i <= daysInMonths[curMonth]) {
            if(curMonth + " " + i + " " + curYear === today) weekAddition.push([curMonth, i, "date-today", yearNow]);
            else if(i === curDay) weekAddition.push([curMonth, i, "date-highlighted", yearNow]);
            else weekAddition.push([curMonth, i, "text-color-black", yearNow]);
        } else {
            if(curMonth === 11) yearNow += 1;
            if(((curMonth + 1) % 12) + " " + (i - daysInMonths[curMonth]) + " " + curYear === today) weekAddition.push([(curMonth + 1) % 12, i - daysInMonths[curMonth], "date-today", yearNow])
            else weekAddition.push([(curMonth + 1) % 12, i - daysInMonths[curMonth], "text-color-gray", yearNow]);
        }
        if(weekAddition.length === 7) {
            calendarArray.push(weekAddition);
            weekAddition = [];
        }
    }

    const returnCalendar = [<div className='base-calendar-week-group' key={"base-calendar-week-group-0"}>
            {convertWeeks.map((item, index) => {
            return <div className='base-calendar-week-top-group' key={'base-calendar-week-top-group-' + index}>
                    {item[1]}
                </div>
            })}
        </div>
    ];

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='base-calendar-week-group' key={"base-calendar-week-" + index}>
                        {item.map((value, index) => {
                           
                            const handleOnClick = () => {
                                dispatch(changeDate({"month" : value[0], "day" : value[1], "year": value[3]}));
                            }
                            return <div onClick={() => handleOnClick()} className={"base-calendar-day " + value[2]} key={"base-calendar-day-" + index}>{value[1]}</div>
                        })}
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
        <div className='base-calendar'>
            <div className='base-calendar-top'>
                <div className='base-calendar-arrow-left' onClick={() => dispatch(changeDate(changeDateEnablerMinus()))}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </div>
                
                <div className='base-calendar-title'><span className='base-calendar-title-month' onClick={() => dispatch(changeDateSpecifics("month"))}>{convertMonths[curMonth]}</span>, <span className='base-calendar-title-year' onClick={() => dispatch(changeDateSpecifics("year"))}>{curYear}</span></div>
                <div className='base-calendar-arrow-right' onClick={() => dispatch(changeDate(changeDateEnablerPlus()))}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                </div>
            </div>
            {returnValue}
        </div>
    )
}

function AddEventPopUpTime({previousTime = {hour: 0, minute: 0}, setPreviousTime = null, setCurTime, isVisible, curTime}) {
    let timeArr = [];
    
    for(let i = previousTime.hour; i < 24; i++) {
        for(let j = 0; j < 60; j += 15){
            if(i === previousTime.hour && j < previousTime.minute) continue; 
            else timeArr.push([i, j, i < 12 ? "AM": "PM"]);
        }
    }

    let resultArr = timeArr.map((item, index) => {
        let displayHours = (item[0] + 11) % 12 + 1;
        if(item[0] < 10) item[0] = "0" + item[0]
        if(item[1] < 10) item[1] = "0" + item[1]

        const handlePopupTimeClick = (e) => {
            console.log(displayHours)
            setCurTime(displayHours + ":" + item[1] + " " + item[2]);
            if(setPreviousTime !== null) {
                let addition = 0;
                if(e.target.innerText.substring(6) === "PM") addition = 12
                setPreviousTime({hour: parseInt(item[0]), minute: parseInt(item[1])})
            }
        }
        
        return (
            <div className="popup-time-choices" key={"popup-time-choices-" + index} onClick={(e) => handlePopupTimeClick(e)}>
                    {displayHours + ":" + item[1] + " " + item[2]}
            </div>
        )
    })

    return (
        <div className={'popup-time-container ' + isVisible}>
            <div className='popup-time'>
                {resultArr}
            </div>
        </div>
        
    )
}

function ChooseColorPalate({selectedColor, setSelectedColor}) {
    let colors = ["#9fc0f5", "#4332d9", "#ae99e0", "#320699", "#c979bf", "#8a0e79", "#cf5f66", "#9e0812", "#93db7f", "#26820d", "#7adedc", "#0da3a1"];
    let textColor = "black";
    let borderSize = "2px";
    if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(selectedColor) === -1) {
        textColor = "white";
        borderSize = "3px";
    }

    let returnArr = colors.map((color, index) => {
        let hoverClass = "hover-black"
        if(["#9fc0f5", "#ae99e0", "#c979bf", "#cf5f66", "#93db7f", "#7adedc"].indexOf(color) === -1) {
            hoverClass = "hover-white";
        }
        return(
            <div className='color-palate' key={'color-palate-container-' + index}>
                <div style={{"backgroundColor" : color, "border" : color === selectedColor ? borderSize + " solid " + textColor : ""}} className={'color-palate-color ' + hoverClass} onClick={() => setSelectedColor(color)}></div>
            </div>
        )
    });

    return(
        <div className='color-palate-container'>
            {returnArr}
        </div>
    )
}

function AddEventPopUpRepeatAdvanced(props) {

    const [curNumber, setCurNumber] = useState(1);
    const [curOption, setCurOption] = useState("week");
    const [numIterations, setNumIterations] = useState(1);
    const [curRepeatEnding, setCurRepeatEnding] = useState("never");
    const [curWeekdays, setCurWeekdays] = useState([0]);
    const [curEndDate, setCurEndDate] = useState("");
    const [isAdvancedSelectorVisible, setIsAdvancedSelectorVisible] = useState("visibility-hidden");

    const handleAdvancedNumberChange = (e) => {
        setCurNumber(parseInt(e.target.value));
        let returnedObj = {...props.repeatSpecifics};
        returnedObj[curOption] = e.target.value;
    }

    const handleAdvancedOptionChange = (option) => {
        setCurOption(option);
        let returnedObj = {...props.repeatSpecifics};
        returnedObj[option] = curNumber;
    }

    const ref = useRef();

    const ref1 = useRef();

    const handleAdvancedMainClick = () => {
        setIsAdvancedSelectorVisible("visibility-visible");
    }

    const handleExitAdvanced = () => {
        setCurNumber(1);
        setCurOption("week");
        setIsAdvancedSelectorVisible("visibility-hidden");
        props.setIsAdvancedVisible("visibility-hidden");
        setCurRepeatEnding("never");
        setNumIterations(1);
        setCurEndDate("");
        setCurWeekdays([0]);
    }

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(isAdvancedSelectorVisible === "visibility-visible" && ref.current && !ref.current.contains(e.target)) {
                setIsAdvancedSelectorVisible("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [isAdvancedSelectorVisible]);

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(props.isAdvancedVisible === "visibility-visible" && ref1.current && !ref1.current.contains(e.target)) {
                props.setIsAdvancedVisible("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [props.isAdvancedVisible]);

    const handleRepeatEndChange = (e, val) => {
        if(e.target.checked) {
            setCurRepeatEnding(val);
        }
    }

    const handleAdvancedSave = () => {
        let returnedObj = {"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : curWeekdays};
        let returnedRepeatEnding = {"never" : false, "onDay" : null, "afterIterations" : null};
        returnedObj[curOption] = curNumber;
        if(curRepeatEnding === "afterIterations") returnedRepeatEnding[curRepeatEnding] = numIterations;
        if(curRepeatEnding === "onDay" && Date.parse(curEndDate)) returnedRepeatEnding[curRepeatEnding] = curEndDate;
        console.log(returnedObj);
        props.setRepeat(true);
        props.setRepeatSpecifics(returnedObj);
        props.setRepeatEnding(returnedRepeatEnding);
        console.log(returnedRepeatEnding);
        console.log(curEndDate)
        handleExitAdvanced();
    }

    const changeDisplayWeekClass = () => {
        if(curOption !== "week") {
            return 'add-event-popup-repeat-optional-week add-event-popup-repeat-optional-week-not-visible';
        } else {
            return 'add-event-popup-repeat-optional-week';
        }
    }

    const handleDisplayDayOnClick = (index) => {
        console.log(curWeekdays)
        if(curWeekdays.indexOf(index) === -1) {
            // e.target.setAttribute("class", "add-event-popup-repeat-advanced-week-day add-event-popup-repeat-advanced-week-day-clicked");
            setCurWeekdays([...curWeekdays, index]);
        } else if(curWeekdays.indexOf(index) !== -1 && curWeekdays.length > 1) {
            // e.target.setAttribute("class", "add-event-popup-repeat-advanced-week-day");
            setCurWeekdays(curWeekdays.filter(item => item !== index));
        }
    }

    const displayWeek = <div className={changeDisplayWeekClass()}>
        {["S", "M", "T", "W", "Th", "F", "Sa"].map((item, index) => {
            let curClassName = "add-event-popup-repeat-advanced-week-day";
            if(curWeekdays.indexOf(index) !== -1) curClassName += " add-event-popup-repeat-advanced-week-day-clicked";
            return <div onClick={() => handleDisplayDayOnClick(index)} className={curClassName} key={'add-event-popup-repeat-advanced-week-day-' + index}>
                    {item}
                </div>
        })}
        </div>

    return(
        <div className={'add-event-popup-repeat-advanced-container ' + props.isAdvancedVisible} ref={ref1}>
            <svg className='add-event-popup-repeat-advanced-exit' onClick={() => handleExitAdvanced()} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            <div className='add-event-popup-repeat-advanced-title'>Repeats every</div>
            <div className='add-event-popup-repeat-advanced-main-container'>
                <input className='add-event-popup-repeat-advanced-input' type="number" min={1} max={99} value={curNumber} onChange={(e) => handleAdvancedNumberChange(e)}></input>
                <div className='add-event-popup-repeat-advanced-main' onClick={() => handleAdvancedMainClick()}>
                    <div className='add-event-popup-repeat-advanced-main-name'>{curOption[0].toUpperCase() + curOption.substring(1)}</div>
                    <svg className="add-event-popup-repeat-advanced-main-down-arrow" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                </div>
            </div>


            <div className={'add-event-popup-repeat-advanced-selector ' + isAdvancedSelectorVisible} ref={ref}>
                <div className='add-event-popup-repeat-advanced-selector-option' onClick={() => handleAdvancedOptionChange("day")}>Day</div>
                <div className='add-event-popup-repeat-advanced-selector-option' onClick={() => handleAdvancedOptionChange("week")}>Week</div>
                <div className='add-event-popup-repeat-advanced-selector-option' onClick={() => handleAdvancedOptionChange("month")}>Month</div>
                <div className='add-event-popup-repeat-advanced-selector-option' onClick={() => handleAdvancedOptionChange("year")}>Year</div>
            </div>

            {displayWeek}

            <div className='add-event-popup-repeat-advanced-limit'>
                <div className='add-event-popup-repeat-advanced-limit-ends'>Ends...</div>
                <div className='add-event-popup-repeat-advanced-limit-option'>
                    <input type="radio" name="add-event-popup-repeat-advanced-limit" value="never" defaultChecked></input>
                    <div className='add-event-popup-repeat-advanced-limit-option-never-text'>Never</div>
                </div>
                <div className='add-event-popup-repeat-advanced-limit-option'>
                    <input type="radio" name="add-event-popup-repeat-advanced-limit" value="onDay" onChange={(e) => handleRepeatEndChange(e, "onDay")}></input>
                    <div className='add-event-popup-repeat-advanced-limit-option-on-date-text'>On</div>
                    <input className='add-event-popup-repeat-advanced-limit-option-on-date-input' type="date" value={curEndDate} onChange={(e) => setCurEndDate(e.target.value)}></input>
                </div>
                <div className='add-event-popup-repeat-advanced-limit-option'>
                <input type="radio" name="add-event-popup-repeat-advanced-limit" value="afterIterations" onChange={(e) => handleRepeatEndChange(e, "afterIterations")}></input>
                    <div className='add-event-popup-repeat-advanced-limit-option-after-iterations-text'>After</div>
                    <input className='add-event-popup-repeat-advanced-limit-option-after-iterations-input' value={numIterations} onChange={(e) => setNumIterations(parseInt(e.target.value))} min={1} type="number"></input>
                    <div className='add-event-popup-repeat-advanced-limit-option-after-iterations-text'>iterations</div>
                </div>
            </div>

            <div className='add-event-popup-repeat-advanced-save'>
                <div className='add-event-popup-repeat-advanced-button' onClick={() => handleAdvancedSave()}>Save</div>
                <div className='add-event-popup-repeat-advanced-button' onClick={() => handleExitAdvanced()}>Cancel</div>
            </div>
        </div>
    )
}

function AddEventPopUpRepeat(props) {

    //implementation notes:
    //add a week selector when selecting "week" that shows M - Sun
    //the repeat in eventSlice should be a boolean of true or false
    //there should be an object like {"month", "day", "year", "week"} that specifies how many ___s it will repeat by
    //for example: month: 2 means repeat every 2 months
    //seperate arrays for repats and nonrepeats for each month
    //when a date in repeat is moved out, a "move this or every" should appear
    //auto end dates, day: 1 year, week: 4 years, month: 10 years, year: never
    //we extract out every repeat function
    //use .map((event) => helperFunction(event)) for each repeat
    //within helper, create a let allEvents
    //look at the repeat function of day week month year and decide accordingly how many to put
    //use spread ... operator to return
    //get start and end dates, iterate through start and end with add date

    let repeatTitle = "None";

    const [isAdvancedVisible, setIsAdvancedVisible] = useState("visibility-hidden");

    if(props.repeat) {
        if(props.repeatSpecifics.day === 1) {
            repeatTitle = "Every Day";
        } else if(props.repeatSpecifics.week === 1) {
            repeatTitle = "Every Week";
        } else if(props.repeatSpecifics.month === 1) {
            repeatTitle = "Every Month";
        } else if(props.repeatSpecifics.year === 1) {
            repeatTitle = "Every Year";
        } else {
            repeatTitle = "Custom";
        }
    }

    const handleRepeatSelectorOnClick = (repeatVal) => {
        switch (repeatVal) {
            case "None" :
                props.setRepeat(false);
                break;
            case "Every Day":
                props.setRepeat(true);
                props.setRepeatSpecifics({"day" : 1, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []});
                break;
            case "Every Week":
                props.setRepeat(true);
                props.setRepeatSpecifics({"day" : 0, "week" : 1, "month" : 0, "year" : 0, "weekdays" : []});
                break;
            case "Every Month":
                props.setRepeat(true);
                props.setRepeatSpecifics({"day" : 0, "week" : 0, "month" : 1, "year" : 0, "weekdays" : []});
                break;
            case "Every Year":
                props.setRepeat(true);
                props.setRepeatSpecifics({"day" : 0, "week" : 0, "month" : 0, "year" : 1, "weekdays" : []});
                break;
            case "Custom":
                handleSetAdvancedVisible();
                props.setIsAddEventPopUpRepeatVisible("visibility-hidden");
                props.setRepeat(true);
                break;
        }
    }

    const ref = useRef();

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(props.isAddEventPopUpRepeatVisible === "visibility-visible" && ref.current && !ref.current.contains(e.target)) {
                props.setIsAddEventPopUpRepeatVisible("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [props.isAddEventPopUpRepeatVisible]);

    const handleOpenRepeatSelector = () => {
        props.setIsAddEventPopUpRepeatVisible("visibility-visible");
    }

    const handleSetAdvancedVisible = () => {
        setIsAdvancedVisible("visibility-visible");
    }

    return(
        <div className='add-event-popup-repeat'>
            <div className='add-event-popup-repeat-main-container'>
                <div className='add-event-popup-repeat-title'>Repeat...</div>
                <div className='add-event-popup-repeat-main' onClick={() => handleOpenRepeatSelector()}>
                    <div className='add-event-popup-repeat-main-name'>{repeatTitle}</div>
                    <svg className="add-event-popup-repeat-main-down-arrow" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                </div>
            </div>
            <div className={'add-event-popup-repeat-selector ' + props.isAddEventPopUpRepeatVisible} ref={ref}>
                <div className='add-event-popup-repeat-selector-option' onClick={() => handleRepeatSelectorOnClick("None")}>None</div>
                <div className='add-event-popup-repeat-selector-option' onClick={() => handleRepeatSelectorOnClick("Every Day")}>Every Day</div>
                <div className='add-event-popup-repeat-selector-option' onClick={() => handleRepeatSelectorOnClick("Every Week")}>Every Week</div>
                <div className='add-event-popup-repeat-selector-option' onClick={() => handleRepeatSelectorOnClick("Every Month")}>Every Month</div>
                <div className='add-event-popup-repeat-selector-option' onClick={() => handleRepeatSelectorOnClick("Every Year")}>Every Year</div>
                <div className='add-event-popup-repeat-selector-option' onClick={() => handleRepeatSelectorOnClick("Custom")}>Custom</div>
            </div>
            <div className='add-event-popup-repeat-advanced-settings' onClick={() => handleSetAdvancedVisible()}>
                <svg className='add-event-popup-repeat-advanced-settings-icon' xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 640 512"><path d="M308.5 135.3c7.1-6.3 9.9-16.2 6.2-25c-2.3-5.3-4.8-10.5-7.6-15.5L304 89.4c-3-5-6.3-9.9-9.8-14.6c-5.7-7.6-15.7-10.1-24.7-7.1l-28.2 9.3c-10.7-8.8-23-16-36.2-20.9L199 27.1c-1.9-9.3-9.1-16.7-18.5-17.8C173.9 8.4 167.2 8 160.4 8h-.7c-6.8 0-13.5 .4-20.1 1.2c-9.4 1.1-16.6 8.6-18.5 17.8L115 56.1c-13.3 5-25.5 12.1-36.2 20.9L50.5 67.8c-9-3-19-.5-24.7 7.1c-3.5 4.7-6.8 9.6-9.9 14.6l-3 5.3c-2.8 5-5.3 10.2-7.6 15.6c-3.7 8.7-.9 18.6 6.2 25l22.2 19.8C32.6 161.9 32 168.9 32 176s.6 14.1 1.7 20.9L11.5 216.7c-7.1 6.3-9.9 16.2-6.2 25c2.3 5.3 4.8 10.5 7.6 15.6l3 5.2c3 5.1 6.3 9.9 9.9 14.6c5.7 7.6 15.7 10.1 24.7 7.1l28.2-9.3c10.7 8.8 23 16 36.2 20.9l6.1 29.1c1.9 9.3 9.1 16.7 18.5 17.8c6.7 .8 13.5 1.2 20.4 1.2s13.7-.4 20.4-1.2c9.4-1.1 16.6-8.6 18.5-17.8l6.1-29.1c13.3-5 25.5-12.1 36.2-20.9l28.2 9.3c9 3 19 .5 24.7-7.1c3.5-4.7 6.8-9.5 9.8-14.6l3.1-5.4c2.8-5 5.3-10.2 7.6-15.5c3.7-8.7 .9-18.6-6.2-25l-22.2-19.8c1.1-6.8 1.7-13.8 1.7-20.9s-.6-14.1-1.7-20.9l22.2-19.8zM112 176a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM504.7 500.5c6.3 7.1 16.2 9.9 25 6.2c5.3-2.3 10.5-4.8 15.5-7.6l5.4-3.1c5-3 9.9-6.3 14.6-9.8c7.6-5.7 10.1-15.7 7.1-24.7l-9.3-28.2c8.8-10.7 16-23 20.9-36.2l29.1-6.1c9.3-1.9 16.7-9.1 17.8-18.5c.8-6.7 1.2-13.5 1.2-20.4s-.4-13.7-1.2-20.4c-1.1-9.4-8.6-16.6-17.8-18.5L583.9 307c-5-13.3-12.1-25.5-20.9-36.2l9.3-28.2c3-9 .5-19-7.1-24.7c-4.7-3.5-9.6-6.8-14.6-9.9l-5.3-3c-5-2.8-10.2-5.3-15.6-7.6c-8.7-3.7-18.6-.9-25 6.2l-19.8 22.2c-6.8-1.1-13.8-1.7-20.9-1.7s-14.1 .6-20.9 1.7l-19.8-22.2c-6.3-7.1-16.2-9.9-25-6.2c-5.3 2.3-10.5 4.8-15.6 7.6l-5.2 3c-5.1 3-9.9 6.3-14.6 9.9c-7.6 5.7-10.1 15.7-7.1 24.7l9.3 28.2c-8.8 10.7-16 23-20.9 36.2L315.1 313c-9.3 1.9-16.7 9.1-17.8 18.5c-.8 6.7-1.2 13.5-1.2 20.4s.4 13.7 1.2 20.4c1.1 9.4 8.6 16.6 17.8 18.5l29.1 6.1c5 13.3 12.1 25.5 20.9 36.2l-9.3 28.2c-3 9-.5 19 7.1 24.7c4.7 3.5 9.5 6.8 14.6 9.8l5.4 3.1c5 2.8 10.2 5.3 15.5 7.6c8.7 3.7 18.6 .9 25-6.2l19.8-22.2c6.8 1.1 13.8 1.7 20.9 1.7s14.1-.6 20.9-1.7l19.8 22.2zM464 304a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
                <div className='add-event-popup-repeat-advanced-settings-text'>Advanced</div>
            </div>
            <AddEventPopUpRepeatAdvanced {...props} isAdvancedVisible={isAdvancedVisible} setIsAdvancedVisible={setIsAdvancedVisible}/>
        </div>
    )
}

function AddEventPopUp({dispatch, currentColors, currentCalendarDate, currentEvents}) {

    const getTimeIn15MinuteIntervals = (hour, minute, wantedFunction) => {
        let returnStr = "";
    
        let condensedHour = ((hour + 11) % 12 + 1);
        let condensedMinute = Math.ceil(minute / 15) * 15;
        let addedDays = 0;
        let totalHours = hour;
    
        condensedHour = ((condensedHour + 11 + Math.floor(condensedMinute / 60)) % 12 + 1);
        //let condensedHour = (hour + Math.floor(condensedMinute / 60)) % 24;
        totalHours += Math.floor(condensedMinute / 60);
        addedDays = Math.floor(totalHours / 24);
        condensedMinute %= 60;
    
        if(condensedHour < 10) condensedHour = "0" + condensedHour;
        if(condensedMinute < 10) condensedMinute = "0" + condensedMinute;
    
        returnStr += condensedHour + ":" + condensedMinute;
    
        if(totalHours % 24 > 11) {
            returnStr += " PM";
        } else {
            returnStr += " AM";
        }
    
        if(wantedFunction === "date") {
            return Math.floor(condensedMinute / 60) * 60 * 60000;
        }
    
        return returnStr;
    }

    const getTrueTime = (time) => {
        let timeArr = time.trim().split(/[ :]/ig).filter((item) => item !== '');
        if(timeArr.length === 3 && !isNaN(parseInt(timeArr[0])) && !isNaN(parseInt(timeArr[1]))) {
            if(timeArr[2].toLowerCase() === "am" && parseInt(timeArr[0]) <= 12 && parseInt(timeArr[0]) > 0 && parseInt(timeArr[1]) < 60) {
                if(parseInt(timeArr[0]) === 12) return "00:" + addZeroes(parseInt(timeArr[1]));
                else return addZeroes(parseInt(timeArr[0])) + ":" + addZeroes(parseInt(timeArr[1]));
            } else if(timeArr[2].toLowerCase() === "pm" && parseInt(timeArr[0]) <= 12 && parseInt(timeArr[0]) > 0 && parseInt(timeArr[1]) < 60) {
                if(parseInt(timeArr[0]) === 12) return "12:" + addZeroes(parseInt(timeArr[1]));
                else return addZeroes(parseInt(timeArr[0]) + 12) + ":" + addZeroes(parseInt(timeArr[1]));
            }
        } else if(timeArr.length === 2 && !isNaN(parseInt(timeArr[0])) && !isNaN(parseInt(timeArr[1]))) {
            if(parseInt(timeArr[0]) < 24 && parseInt(timeArr[0]) >= 0 && parseInt(timeArr[1]) < 60) {
                return addZeroes(parseInt(timeArr[0])) + ":" + addZeroes(parseInt(timeArr[1]));
            }
        }
        return undefined;
    }

    let currentDate = new Date();

    let currentDateOne = new Date(currentDate.getTime() + (15 - currentDate.getMinutes() % 15) * 60000);
    let currentDateTwo = new Date(currentDate.getTime() + (15 - currentDate.getMinutes() % 15) * 60000 + 1800000);

    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const buildFunction = (key) => {
        return function(value) {
            return dispatch(changeSingleCalendarEvent({"key" : key, "value" : value}))
        }
    }

    const [curDateOne, setCurDateOne] = [currentCalendarDate.curDateOne, buildFunction("curDateOne")];
    const [curDateTwo, setCurDateTwo] = [currentCalendarDate.curDateTwo, buildFunction("curDateTwo")];
    const [dateOneInput, setDateOneInput] = [currentCalendarDate.dateOneInput, buildFunction("dateOneInput")];
    const [dateTwoInput, setDateTwoInput] = [currentCalendarDate.dateTwoInput, buildFunction("dateTwoInput")];
    const [curLocation, setCurLocation] = [currentCalendarDate.curLocation, buildFunction("curLocation")];
    const [focusCalendarVisibleOne, setFocusCalendarVisibleOne] = [currentCalendarDate.focusCalendarVisibleOne, buildFunction("focusCalendarVisibleOne")];
    const [focusCalendarVisibleTwo, setFocusCalendarVisibleTwo] = [currentCalendarDate.focusCalendarVisibleTwo, buildFunction("focusCalendarVisibleTwo")];
    const [focusTimeVisibleOne, setFocusTimeVisibleOne] = [currentCalendarDate.focusTimeVisibleOne, buildFunction("focusTimeVisibleOne")];
    const [focusTimeVisibleTwo, setFocusTimeVisibleTwo] = [currentCalendarDate.focusTimeVisibleTwo, buildFunction("focusTimeVisibleTwo")];
    const [previousTime, setPreviousTime] = [currentCalendarDate.previousTime, buildFunction("previousTime")];
    const [curTimeOne, setCurTimeOne] = [currentCalendarDate.curTimeOne, buildFunction("curTimeOne")];
    const [curTimeTwo, setCurTimeTwo] = [currentCalendarDate.curTimeTwo, buildFunction("curTimeTwo")];
    const [curTimeDisabled, setCurTimeDisabled] = [currentCalendarDate.curTimeDisabled, buildFunction("curTimeDisabled")];
    const [isMouseDown, setIsMouseDown] = [currentCalendarDate.isMouseDown, buildFunction("isMouseDown")];
    const [originalCoords, setOriginalCoords] = [currentCalendarDate.originalCoords, buildFunction("originalCoords")];
    const [selectedColor, setSelectedColor] = [currentCalendarDate.selectedColor, buildFunction("selectedColor")];
    const [curTitle, setCurTitle] = [currentCalendarDate.curTitle, buildFunction("curTitle")];
    const [curDescription, setCurDescription] = [currentCalendarDate.curDescription, buildFunction("curDescription")];
    const [wrongInputs, setWrongInputs] = [currentCalendarDate.wrongInputs, buildFunction("wrongInputs")];
    const [isThisVisible, setIsThisVisible] = [currentCalendarDate.isThisVisible, buildFunction("isThisVisible")];
    const [originalColor, setOriginalColor] = [currentCalendarDate.originalColor, buildFunction("originalColor")];
    const [isAllDay, setIsAllDay] = [currentCalendarDate.isAllDay, buildFunction("isAllDay")];
    const [tempTime, setTempTime] = useState({"time1" : "", "time2" : ""});
    const [repeat, setRepeat] = [currentCalendarDate.repeat, buildFunction("repeat")];
    const [repeatSpecifics, setRepeatSpecifics] = [currentCalendarDate.repeatSpecifics, buildFunction("repeatSpecifics")];
    const [repeatEnding, setRepeatEnding] = [currentCalendarDate.repeatEnding, buildFunction("repeatEnding")];
    const [repeatExceptions, setRepeatExceptions] = [currentCalendarDate.repeatExceptions, buildFunction("repeatExceptions")];
    const [isAddEventPopUpRepeatVisible, setIsAddEventPopUpRepeatVisible] = useState("visibility-hidden");

    const resetAll = () => {
        setCurDateOne({"year": currentDateOne.getFullYear(), "month": currentDateOne.getMonth(), "day": currentDateOne.getDate()});
        setCurDateTwo({"year": currentDateTwo.getFullYear(), "month": currentDateTwo.getMonth(), "day": currentDateTwo.getDate()});
        setDateOneInput(convertMonths[currentDateOne.getMonth()] + " " + currentDateOne.getDate() + ", " + currentDateOne.getFullYear());
        setDateTwoInput(convertMonths[currentDateTwo.getMonth()] + " " + currentDateTwo.getDate() + ", " + currentDateTwo.getFullYear());
        setCurLocation("");
        setFocusCalendarVisibleOne("visibility-hidden");
        setFocusCalendarVisibleTwo("visibility-hidden");
        setFocusTimeVisibleOne("visibility-hidden");
        setFocusTimeVisibleTwo("visibility-hidden");
        setPreviousTime({hour: currentDateOne.getHours() + Math.floor((Math.ceil(currentDateOne.getMinutes() / 15) * 15) / 60), minute: (Math.ceil(currentDateOne.getMinutes() / 15) * 15) % 60});
        setCurTimeOne(getTimeIn15MinuteIntervals(currentDateOne.getHours(), currentDateOne.getMinutes()));
        setCurTimeTwo(getTimeIn15MinuteIntervals(currentDateTwo.getHours(), currentDateTwo.getMinutes()));
        setIsMouseDown(false);
        setOriginalCoords([0,0]);
        setSelectedColor("#9fc0f5");
        setCurTitle("");
        setCurDescription("");
        setWrongInputs({"time1" : "", "time2" : "", "date1" : "", "date2": ""});
        setCurTimeDisabled({"one" : "", "two": ""});
        setIsAllDay({"one" : false, "two": false});
        dispatch(changeSingleCalendarEvent({"key" : "functionWanted", "value" : "add"}));
        setTempTime({"time1" : "", "time2" : ""});
        setRepeat(false);
        setRepeatSpecifics({"day" : 0, "week" : 0, "month" : 0, "year" : 0, "weekdays" : []});
        setRepeatEnding({"never" : false, "onDay" : null, "afterIterations" : null});
        setRepeatExceptions({});
    }

    const ref1 = useRef();

    const ref2 = useRef();

    const ref3 = useRef();

    const ref4 = useRef();

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(focusCalendarVisibleOne === "visibility-visible" && ref1.current && !ref1.current.contains(e.target)) {
                setFocusCalendarVisibleOne("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [focusCalendarVisibleOne]);

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(focusCalendarVisibleTwo === "visibility-visible" && ref2.current && !ref2.current.contains(e.target)) {
                setFocusCalendarVisibleTwo("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [focusCalendarVisibleTwo]);

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(focusTimeVisibleOne === "visibility-visible" && ref3.current && !ref3.current.contains(e.target)) {
                setFocusTimeVisibleOne("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [focusTimeVisibleOne]);

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(focusTimeVisibleTwo === "visibility-visible" && ref4.current && !ref4.current.contains(e.target)) {
                setFocusTimeVisibleTwo("visibility-hidden");
            }
        }

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [focusTimeVisibleTwo]);

    const dateValidator = (dateString) => {
        let checkMonths = [["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
                            ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]];
        let finalDate = null;
        let newArr = dateString.trim().split(/[, -/]/ig).filter((item) => item !== '');
        if(newArr.length >= 3) {
            for(let i = 0; i < 2; i++) {
                if(checkMonths[i].indexOf(newArr[0].toLowerCase()) !== -1) {
                    if(Date.parse(newArr[2] + "-" + addZeroes(checkMonths[i].indexOf(newArr[0].toLowerCase()) + 1) + "-" + addZeroes(newArr[1]) + "T00:00:00")) finalDate = {"year": parseInt(newArr[2]), "month": checkMonths[i].indexOf(newArr[0].toLowerCase()), "day" : parseInt(newArr[1])};
                } else if(checkMonths[i].indexOf(newArr[1].toLowerCase()) !== -1) {
                    if(Date.parse(newArr[2] + "-" + addZeroes(checkMonths[i].indexOf(newArr[1].toLowerCase()) + 1) + "-" + addZeroes(newArr[0]) + "T00:00:00")) finalDate = {"year": parseInt(newArr[2]), "month": checkMonths[i].indexOf(newArr[1].toLowerCase()), "day" : parseInt(newArr[0])};
                }
            }
            if(finalDate === null) {
                if(Date.parse(newArr[0] + "-" + addZeroes(parseInt(newArr[1])) + "-" + addZeroes(parseInt(newArr[2])) + "T00:00:00")) {
                    finalDate = {"year": parseInt(newArr[0]), "month": parseInt(newArr[1]) - 1, "day" : parseInt(newArr[2])};
                } else if(Date.parse(newArr[2] + "-" + addZeroes(parseInt(newArr[0])) + "-" + addZeroes(parseInt(newArr[1])) + "T00:00:00")) {
                    finalDate = {"year": parseInt(newArr[2]), "month": parseInt(newArr[0]) - 1, "day" : parseInt(newArr[1])};
                }
            }
        } else {
            finalDate = null;
        }

        return finalDate;
    }

    const handleSetCurDateOne = (e) => {
        setDateOneInput(e.target.value);
        let finalDate = dateValidator(e.target.value);
        if(finalDate !== null) {
            setCurDateOne(finalDate);
            setWrongInputs({"time1" : wrongInputs.time1, "time2" : wrongInputs.time2, "date1" : "", "date2" : wrongInputs.date2})
        } else {
            setWrongInputs({"time1" : wrongInputs.time1, "time2" : wrongInputs.time2, "date1" : "input-incorrect", "date2" : wrongInputs.date2})
        }
    }

    const handleSetCurDateTwo = (e) => {
        setDateTwoInput(e.target.value);
        let finalDate = dateValidator(e.target.value);
        if(finalDate !== null) {
            setCurDateTwo(finalDate);
            setWrongInputs({"time1" : wrongInputs.time1, "time2" : wrongInputs.time2, "date1" : wrongInputs.date1, "date2" : ""});
        } else {
            setWrongInputs({"time1" : wrongInputs.time1, "time2" : wrongInputs.time2, "date1" : wrongInputs.date1, "date2" : "input-incorrect"});
        }
    }

    useEffect(() => {
        if(getTrueTime(curTimeOne) !== undefined && getTrueTime(curTimeTwo) !== undefined && curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day) {
            let dateNow = new Date("2000-01-01T" + getTrueTime(curTimeOne));
            let dateTwo = new Date("2000-01-01T" + getTrueTime(curTimeTwo));
            if(dateNow.getHours() > dateTwo.getHours() || (dateNow.getHours() >= dateTwo.getHours() && dateNow.getMinutes() > dateTwo.getMinutes())) {
                setCurTimeTwo(getTimeIn15MinuteIntervals(dateNow.getHours(), dateNow.getMinutes()));
            }
        }
    }, [curTimeOne, dateOneInput, dateTwoInput]);

    useEffect(() => {
        let finalObj = {...wrongInputs};
        if(getTrueTime(curTimeOne) === undefined) finalObj["time1"] = "input-incorrect";
        else finalObj["time1"] = "";
        if(getTrueTime(curTimeTwo) === undefined) finalObj["time2"] = "input-incorrect";
        else finalObj["time2"] = "";
        if(dateValidator(dateOneInput) === null) finalObj["date1"] = "input-incorrect";
        else finalObj["date1"] = "";
        if(dateValidator(dateTwoInput) === null) finalObj["date2"] = "input-incorrect";
        else finalObj["date2"] = "";

        if(finalObj.time1 !== "input-incorrect" && finalObj.time2 !== "input-incorrect" && finalObj.date1 !== "input-incorrect" && finalObj.date2 !== "input-incorrect") {
            let dayOne = dateValidator(dateOneInput);
            let dayTwo = dateValidator(dateTwoInput);
            dayOne = new Date(dayOne.year + '-' + addZeroes(dayOne.month + 1) + '-' + addZeroes(dayOne.day) + 'T' + getTrueTime(curTimeOne));
            dayTwo = new Date(dayTwo.year + '-' + addZeroes(dayTwo.month + 1) + '-' + addZeroes(dayTwo.day) + 'T' + getTrueTime(curTimeTwo));
            console.log(dayOne)
            console.log(dateValidator(dateOneInput))
            if(dayOne.getTime() > dayTwo.getTime()) {
                if(dayOne.getFullYear() === dayTwo.getFullYear() && dayOne.getMonth() === dayTwo.getMonth() && dayOne.getDate() === dayTwo.getDate()) {
                    finalObj["time1"] = "input-incorrect";
                } else {
                    finalObj["time1"] = "input-incorrect";
                    finalObj["date1"] = "input-incorrect";
                }
            }
        }

        if(finalObj.time1 === "input-incorrect" || finalObj.time2 === "input-incorrect") {
            let dayOne = dateValidator(dateOneInput);
            let dayTwo = dateValidator(dateTwoInput);
            dayOne = new Date(dayOne.year + '-' + addZeroes(dayOne.month + 1) + '-' + addZeroes(dayOne.day));
            dayTwo = new Date(dayTwo.year + '-' + addZeroes(dayTwo.month + 1) + '-' + addZeroes(dayTwo.day));
            if(dayOne.getTime() > dayTwo.getTime()) {
                finalObj["date1"] = "input-incorrect";
            }
        }

        setWrongInputs(finalObj);

    }, [curTimeOne, curTimeTwo, dateOneInput, dateTwoInput]);

    const handleMoveMouseDown = (e) => {
        setIsMouseDown(true);
        let top = e.target.getBoundingClientRect().top;
        let left = e.target.getBoundingClientRect().left;
        setOriginalCoords([e.clientY - top, e.clientX - left]);
    }

    const handleTouchStart = (e) => {
        let top = e.target.getBoundingClientRect().top;
        let left = e.target.getBoundingClientRect().left;
        setOriginalCoords([e.touches[0].clientY - top, e.touches[0].clientX - left]);
    }

    const handleMoveMouseMove = (e) => {
        if(isMouseDown) {
            let effectedClass = document.querySelector('.add-event-popup');
            effectedClass.style.top = (e.clientY - originalCoords[0]) + "px";
            effectedClass.style.left = (e.clientX - originalCoords[1]) + "px";
            effectedClass.style.transform = "translate(0%, 0%)";
        }
    }

    const handleTouchMove = (e) => {
        let effectedClass = document.querySelector('.add-event-popup');
        effectedClass.style.top = (e.touches[0].clientY - originalCoords[0]) + "px";
        effectedClass.style.left = (e.touches[0].clientX - originalCoords[1]) + "px";
        effectedClass.style.transform = "translate(0%, 0%)";
    }

    document.onmousemove = handleMoveMouseMove;

    const handleMoveMouseUp = () => {
        setIsMouseDown(false);
        document.onmousemove = null;
    }

    const handleClickEventExit = () => {
        setIsThisVisible("visibility-hidden")
        let effectedClass = document.querySelector('.add-event-popup');
        effectedClass.style.top = "50%";
        effectedClass.style.left = "50%";
        effectedClass.style.transform = "translate(-50%, -50%)";
        dispatch(setEditing(false));
        resetAll();
    }

    const handleCancelClick = () => {
        if(currentCalendarDate.functionWanted === "edit-delete") {
            dispatch(removeEvent(currentEvents.length - 1));
            handleClickEventExit();
        } else {
            handleClickEventExit();
        }
    }

    const handleClickEventSave = () => {
        const handleSubmit = () => {
            let finalObj = {};
            let TimeOne = "T00:00:00";
            let TimeTwo = "T00:00:00";
            if(!isAllDay.one) {
                TimeOne = "T" + getTrueTime(curTimeOne);
            }
            if(!isAllDay.two) {
                TimeTwo = "T" + getTrueTime(curTimeTwo);
            }
            if(curTitle === "") {
                finalObj["title"] = "[No Title]";
            } else {
                finalObj["title"] = curTitle;
            }
            let dayOne = dateValidator(dateOneInput);
            let dayTwo = dateValidator(dateTwoInput);
            // dayOne = new Date(dayOne.year + '-' + addZeroes(dayOne.month + 1) + '-' + addZeroes(dayOne.day));
            // dayTwo = new Date(dayTwo.year + '-' + addZeroes(dayTwo.month + 1) + '-' + addZeroes(dayTwo.day));
            finalObj["startDate"] = dayOne.year + '-' + addZeroes(dayOne.month + 1) + '-' + addZeroes(dayOne.day) + "T00:00:00";
            finalObj["endDate"] = dayTwo.year + '-' + addZeroes(dayTwo.month + 1) + '-' + addZeroes(dayTwo.day) + "T00:00:00";
            finalObj["startTime"] = dayOne.year + '-' + addZeroes(dayOne.month + 1) + '-' + addZeroes(dayOne.day) + TimeOne;
            finalObj["endTime"] = dayTwo.year + '-' + addZeroes(dayTwo.month + 1) + '-' + addZeroes(dayTwo.day) + TimeTwo;
            finalObj["rawStartDate"] = dateOneInput;
            finalObj["rawStartTime"] = curTimeOne;
            finalObj["rawEndDate"] = dateTwoInput;
            finalObj["rawEndTime"] = curTimeTwo;
            finalObj["color"] = selectedColor;
            finalObj["location"] = curLocation;
            finalObj["description"] = curDescription;
            finalObj["curDateOne"] = curDateOne;
            finalObj["curDateTwo"] = curDateTwo;
            finalObj["previousTime"] = previousTime;
            finalObj["isAllDay"] = isAllDay;
            finalObj["curTimeDisabled"] = curTimeDisabled;
            finalObj["repeat"] = repeat;
            finalObj["repeatSpecifics"] = repeatSpecifics;
            finalObj["repeatEnding"] = repeatEnding;
            finalObj["repeatExceptions"] = repeatExceptions;

            console.log(finalObj)

            if(currentCalendarDate.functionWanted === "edit-delete") {
                dispatch(changeEvent({"index" : currentCalendarDate.editingIndex, "value" : finalObj}));
                dispatch(changeSingleCalendarEvent({"key" : "functionWanted", "value" : "add"}));
                dispatch(addTotalColorNumber(currentCalendarDate.selectedColor));
            } else if(currentCalendarDate.functionWanted === "edit") {
                dispatch(changeEvent({"index" : currentCalendarDate.editingIndex, "value" : finalObj}));
                dispatch(changeSingleCalendarEvent({"key" : "functionWanted", "value" : "add"}));
                if(currentCalendarDate.selectedColor !== originalColor) {
                    dispatch(removeTotalColor(originalColor));
                    dispatch(addTotalColorNumber(currentCalendarDate.selectedColor));
                }
                setOriginalColor(currentCalendarDate.selectedColor);
            } else {
                dispatch(addEvent(finalObj));
                dispatch(addTotalColorNumber(currentCalendarDate.selectedColor));
            }
            

            if(currentColors.indexOf(selectedColor) === -1) {
                dispatch(addTotalColor(selectedColor));
            }

            handleClickEventExit();
        }

        if((wrongInputs.time1 !== "input-incorrect" || isAllDay.one) && (wrongInputs.time2 !== "input-incorrect" || isAllDay.two) && wrongInputs.date1 !== "input-incorrect" && wrongInputs.date2 !== "input-incorrect") {
            handleSubmit();
        }
    }

    const handleAllDayChangeOne = (e) => {
        if(e.target.checked) {
            if(curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day) {
                setCurTimeDisabled({"one" : "input-disabled", "two" : "input-disabled"});
                setCurTimeOne("--:--");
                setCurTimeTwo("--:--");
                setTempTime({"time1" : curTimeOne, "time2" : curTimeTwo});
                setIsAllDay({"one" : true, "two": true});
            } else {
                setCurTimeDisabled({"one" : "input-disabled", "two" : curTimeDisabled.two});
                setTempTime({"time1" : curTimeOne, "time2" : tempTime.time2});
                setCurTimeOne("--:--");
                setIsAllDay({"one" : true, "two": isAllDay.two});
            }
        } else {
            if(curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day) {
                setCurTimeDisabled({"one" : "", "two" : ""});
                setIsAllDay({"one" : false, "two": false});
                setCurTimeOne(tempTime.time1);
                setCurTimeTwo(tempTime.time2);
            } else {
                setCurTimeDisabled({"one" : "", "two" : curTimeDisabled.two});
                setIsAllDay({"one" : "", "two": isAllDay.two});
                setCurTimeOne(tempTime.time1);
            }
        }
    }

    const handleAllDayChangeTwo = (e) => {
        if(e.target.checked) {
            if(curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day) {
                setCurTimeDisabled({"one" : "input-disabled", "two" : "input-disabled"});
                setTempTime({"time1" : curTimeOne, "time2" : curTimeTwo});
                setCurTimeOne("--:--");
                setCurTimeTwo("--:--");
                setIsAllDay({"one" : true, "two": true});
            } else {
                setTempTime({"time1" : tempTime.time1, "time2" : curTimeTwo});
                setCurTimeDisabled({"one" : curTimeDisabled.one, "two" : "input-disabled"});
                setCurTimeTwo("--:--");
                setIsAllDay({"one" : isAllDay.one, "two": true});
            }
        } else {
            if(curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day) {
                setCurTimeDisabled({"one" : "", "two" : ""});
                setIsAllDay({"one" : false, "two": false});
                setCurTimeOne(tempTime.time1);
                setCurTimeTwo(tempTime.time2);
            } else {
                setCurTimeDisabled({"one" : curTimeDisabled.one, "two" : ""});
                setIsAllDay({"one" : isAllDay.one, "two": false});
                setCurTimeTwo(tempTime.time2);
            }
        }
    }

    useEffect(() => {
        if(curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day && isAllDay.two) {
            setCurTimeDisabled({"one" : "input-disabled", "two" : "input-disabled"});
            setCurTimeOne("--:--");
            setCurTimeTwo("--:--");
            setIsAllDay({"one" : true, "two": true});
        }
    }, [dateOneInput]);

    useEffect(() => {
        if(curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day && isAllDay.one) {
            setCurTimeDisabled({"one" : "input-disabled", "two" : "input-disabled"});
            setCurTimeOne("--:--");
            setCurTimeTwo("--:--");
            setIsAllDay({"one" : true, "two": true});
        }
    }, [dateTwoInput]);

    return(
        <div className={'add-event-popup add-event-popup-position ' + isThisVisible}>
            <div className='add-event-popup-move' onMouseDown={(e) => handleMoveMouseDown(e)} onMouseUp={(e) => handleMoveMouseUp(e)} onTouchMove={(e) => handleTouchMove(e)} onTouchStart={(e) => handleTouchStart(e)}>
                <svg className='add-event-popup-exit' onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCancelClick();
                }} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </div>
            <input type="text" className='add-event-popup-title' name="add-event-popup-title" placeholder='Enter title here' value={curTitle} onChange={(e) => setCurTitle(e.target.value)} autoComplete="off"></input>
            <div className='add-event-popup-time-container'>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                <div className='add-event-popup-texts'>Time</div>
            </div>
            <div className='add-event-popup-time'>
                <div className='add-event-popup-time-sub'>
                    <div className='add-event-popup-time-sub1-ref' ref={ref1}>
                        <input type="text" className={'add-event-popup-time-date ' + wrongInputs.date1} placeholder='Enter date here' name="add-event-popup-time-date-1" value={dateOneInput} onChange={handleSetCurDateOne} onFocus={() => setFocusCalendarVisibleOne("visibility-visible")} autoComplete="off"></input>
                        <AddEventPopupCalendar currentDate={curDateOne} setCurrentDate={setCurDateOne} setDateInput={setDateOneInput} focusCalendarVisible={focusCalendarVisibleOne}/>
                    </div>
                    <div>at</div>
                    <div className='add-event-popup-time-sub3-ref' ref={ref3}>
                        <input type="text" className={'add-event-popup-time-time '  + curTimeDisabled.one + " " + wrongInputs.time1} name="add-event-popup-time-time" value={curTimeOne} onChange={(e) => setCurTimeOne(e.target.value)} onFocus={() => setFocusTimeVisibleOne("visibility-visible")} autoComplete="off"></input>
                        <AddEventPopUpTime previousTime={{hour: 0, minute: 0}} setPreviousTime={setPreviousTime} setCurTime={setCurTimeOne} isVisible={focusTimeVisibleOne} curTime={curTimeOne}/>
                    </div>
                    <div className='add-event-popup-all-day-selection'>
                    <input type="checkbox" className='add-event-popup-all-day-selection-checkbox' name="add-event-popup-all-day-selection-1" checked={isAllDay.one} onChange={(e) => handleAllDayChangeOne(e)}></input>
                        <div className='add-event-popup-all-day-selection-text'>All Day</div>
                    </div>
                </div>
                <div className='add-event-popup-time-to'>to</div>
                <div className='add-event-popup-time-sub'>
                    <div className='add-event-popup-time-sub2-ref' ref={ref2}>
                        <input type="text" className={'add-event-popup-time-date ' + wrongInputs.date2} placeholder='Enter date here' name="add-event-popup-time-date-1" value={dateTwoInput} onChange={handleSetCurDateTwo} onFocus={() => setFocusCalendarVisibleTwo("visibility-visible")} autoComplete="off"></input>
                        <AddEventPopupCalendar currentDate={curDateTwo} setCurrentDate={setCurDateTwo} setDateInput={setDateTwoInput} focusCalendarVisible={focusCalendarVisibleTwo}/>
                    </div>
                    <div>at</div>
                    <div className='add-event-popup-time-sub4-ref' ref={ref4}>
                        <input type="text" className={'add-event-popup-time-time ' + curTimeDisabled.two + " " + wrongInputs.time2} name="add-event-popup-time-time" value={curTimeTwo} onChange={(e) => setCurTimeTwo(e.target.value)} onFocus={() => setFocusTimeVisibleTwo("visibility-visible")} autoComplete="off"></input>
                        <AddEventPopUpTime previousTime={curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day ? previousTime : {hour: 0, minute: 0}} setCurTime={setCurTimeTwo} isVisible={focusTimeVisibleTwo} curTime={curTimeTwo}/>
                    </div>
                    <div className='add-event-popup-all-day-selection' >
                        <input type="checkbox" className='add-event-popup-all-day-selection-checkbox' name="add-event-popup-all-day-selection-1" checked={isAllDay.two} onChange={(e) => handleAllDayChangeTwo(e)}></input>
                        <div className='add-event-popup-all-day-selection-text'>All Day</div>
                    </div>
                </div>
            </div>
            <AddEventPopUpRepeat repeat={repeat} setRepeat={setRepeat} repeatEnding={repeatEnding} setRepeatEnding={setRepeatEnding} repeatSpecifics={repeatSpecifics} setRepeatSpecifics={setRepeatSpecifics} isAddEventPopUpRepeatVisible={isAddEventPopUpRepeatVisible} setIsAddEventPopUpRepeatVisible={setIsAddEventPopUpRepeatVisible}/>
            <div className='add-event-popup-description-container'>
                <div className='add-event-popup-description-menu'>
                    <div className='add-event-popup-description-menu-line add-event-popup-description-menu-line-1'></div>
                    <div className='add-event-popup-description-menu-line add-event-popup-description-menu-line-2'></div>
                    <div className='add-event-popup-description-menu-line add-event-popup-description-menu-line-3'></div>
                </div>
                <div className='add-event-popup-texts'>Description</div>
            </div>
            <textarea className='add-event-popup-description' name='add-event-popup-description' value={curDescription} onChange={(e) => setCurDescription(e.target.value)}></textarea>
            <div className='add-event-popup-color-container'>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 576 512"><path d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/></svg>
                <div className='add-event-popup-texts'>Color & Label</div>
            </div>
            <ChooseColorPalate selectedColor={selectedColor} setSelectedColor={setSelectedColor}/>
            <div className='add-event-popup-location-container'>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                <div className='add-event-popup-texts'>Location</div>
            </div>
            <input type="text" className='add-event-popup-location' name="add-event-popup-location" value={curLocation} onChange={(e) => setCurLocation(e.target.value)} autoComplete="off"></input>
            <div className='add-event-popup-save'>
                <div className='add-event-popup-button' onClick={() => handleClickEventSave()}>Save</div>
                <div className='add-event-popup-button' onClick={() => handleCancelClick()}>Cancel</div>
            </div>
            
        </div>
    );
}

function AddEvent({dispatch}) {
    return(
        <div className='add-event' onClick={() => dispatch(changeSingleCalendarEvent({"key" : "isThisVisible", "value" : "visibility-visible"}))}>
            <div className='add-event-add-sign'>
                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
            </div>
            <div className='add-event-text'>Event</div>
        </div>

    )
}

function TodayEvents({currentEvents, currentUnwantedColors, currentDate}) {

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
            returnStr = start;
        } else {
            if(eventStartDate.getTime() === date.getTime()) {
                return `${getHourAndMinutes(eventStartTime.getHours(), eventStartTime.getMinutes())}`;
            }
            if(eventEndDate.getTime() === date.getTime()) {
                return `Until ${getHourAndMinutes(eventEndTime.getHours(), eventEndTime.getMinutes())}`;
            }
            return `All Day`;
        }
    
        return returnStr;
    }

    let curDate = currentDate;
        curDate = new Date(curDate.year, curDate.month, curDate.day)
        let eventsToday = [...currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => {
            return event.repeat;
        }).map((event) => {
            return createEventsRepeated(event, curDate.getTime(), new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + 1).getTime());
        }).flat().filter((event) => {
            return filterEventsStartEnd(event, curDate, curDate, currentUnwantedColors);
        }).concat([...currentEvents].map((event, index) => {
            let objNow = {"index" : index}
            let returnedObj = Object.assign(objNow, event)
            return returnedObj;
        }).filter((event) => {
            return !event.repeat && filterEventsStartEnd(event, curDate, curDate, currentUnwantedColors);
        })).sort((a, b) => {
            return (new Date(a.startTime).getTime()) - (new Date(b.startTime).getTime())
        })
        let eventsTodayAllDay = eventsToday.filter((event) => {
            return getDisplayTime(event, curDate) === "All Day";
        })
        let eventsTodayNotAllDay = eventsToday.filter((event) => {
            return getDisplayTime(event, curDate) !== "All Day";
        })

        eventsToday = eventsTodayNotAllDay.concat(eventsTodayAllDay);

        let returnEvents = eventsToday.map((item, index) => {
            return (<div className='today-events-item-container' key={"today-events-" + index}>
                <div className='today-events-item'>
                    <div className="today-events-item-color" style={{"backgroundColor": item.color}}></div>
                    <div className="today-events-item-time">{getDisplayTime(item, curDate)}</div>
                    <div className='today-events-item-name'>{item.title}</div>
                </div>
                <div className='today-events-divider-line'></div>
            </div>);
        });



    return(
        <div className='today-events-container'>
            <div className='today-events-text'>Today's Agenda...</div>
            <div className='today-events'>
                {returnEvents}
            </div>
        </div>
    );
    
}

function ColorChooser({currentUnwantedColors, dispatch, currentColors, currentColorLabels, currentColorIsLocked}) {
    let colors = ["#9fc0f5", "#4332d9", "#ae99e0", "#320699", "#c979bf", "#8a0e79", "#cf5f66", "#9e0812", "#93db7f", "#26820d", "#7adedc", "#0da3a1"];
    colors = colors.filter((color) => {
        return currentColors.indexOf(color) !== -1
    });


    const handleColorCheckboxChange = (e, color) => {
        if(!e.target.checked && currentUnwantedColors.indexOf(color) === -1) {
            dispatch(addUndesiredColor(color));
        } else {
            let index = currentUnwantedColors.indexOf(color);
            if(index !== -1) {
                dispatch(removeUndesiredColor(index));
            }
        }
    }

    const handleColorLabelChange = (e, color) => {
        dispatch(changeTotalColorLabel({"value" : e.target.value, "color" : color}));
    }

    let returnArr = colors.map((color, index) => {

        let bgColorClass = "";

        let fillColor = "black";

        if(currentColorIsLocked[color]) {
            bgColorClass = " color-chooser-lock-black";
            fillColor = "white";
        }

        const handleChangeIsLocked = () => {
            dispatch(changeTotalColorIsLocked({"color" : color, "value" : !currentColorIsLocked[color]}));
        }

        return(
            <div className='color-chooser' key={'color-chooser-' + index}>
                <input type="checkbox" id={"color-chooser-checkbox " + index} name={"color-chooser-checkbox " + index} value={color} defaultChecked={true} onChange={(e) => handleColorCheckboxChange(e, color)}></input>
                <div style={{"backgroundColor" : color}} className='color-chooser-color'></div>
                <input type="text" placeholder='Enter label here...' className='color-chooser-label' name={"color-chooser-label-" + index} value={currentColorLabels[color]} onChange={(e) => handleColorLabelChange(e, color)} disabled={currentColorIsLocked[color]} autoComplete="off"></input>
                <div className={"color-chooser-lock" + bgColorClass} onClick={() => handleChangeIsLocked()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="color-chooser-lock-svg" height="15px" fill={fillColor} viewBox="0 0 448 512"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>
                </div>
            </div>
        )
    });

    return(
        <div className='color-chooser-container'>
            <div className='color-chooser-introduction'>
                <div className='color-chooser-title'>Color Chooser</div>
                <div className='color-chooser-introduction-box'>
                    <div className='color-chooser-checkbox-description'>
                        <input type="checkbox" className="color-chooser-checkbox-example" name="color-chooser-checkbox-example" checked={true} readOnly></input>
                        <div>indicates to show color</div>
                    </div>
                    <div className='color-chooser-checkbox-description'>
                        <input type="checkbox" className="color-chooser-checkbox-example" name="color-chooser-checkbox-example" checked={false} readOnly></input>
                        <div>indicates to hide color</div>
                    </div>
                </div>
            </div>
            <div className='color-chooser-main'>
                {returnArr}
            </div>
        </div>
    )

}

function Menu() {
    const currentEvents = useSelector((state) => state.event.events);
    const currentDate = useSelector((state) => state.date);
    const currentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const currentColors = useSelector((state) => state.color.totalColors);
    const currentColorLabels = useSelector((state) => state.color.totalColorsLabel);
    const currentColorIsLocked = useSelector((state) => state.color.totalColorsisLocked);
    const currentCalendarDate = useSelector((state) => state.calendarEvent.events);
    const dispatch = useDispatch();
    return(
        <React.Fragment>
            <AddEvent dispatch={dispatch}/>
            <AddEventPopUp dispatch={dispatch} currentColors={currentColors} currentCalendarDate={currentCalendarDate} currentEvents={currentEvents}/>
            <div className="calendar-menu">
                <div className='calendar-menu-spacer'></div>
                <div className='calendar-menu-divider-line'></div>
                <div className="calendar-menu-scroll">
                    <BaseCalendar currentDate={currentDate} dispatch={dispatch}/>
                    <div className='calendar-menu-divider-line'></div>
                    <TodayEvents currentEvents={currentEvents} currentUnwantedColors={currentUnwantedColors} currentDate={currentDate}/>
                    <div className='calendar-menu-divider-line'></div>
                    <ColorChooser currentUnwantedColors={currentUnwantedColors} dispatch={dispatch} currentColors={currentColors} currentColorLabels={currentColorLabels} currentColorIsLocked={currentColorIsLocked}/>
                </div>  
            </div>
        </React.Fragment>

    )
}

export { AddEventPopUp };

export default Menu;