import React from 'react';
import { useState, useEffect, useRef } from "react";
import { addEvent, removeEvent, changeEvent } from './eventSlice';
import { useSelector, useDispatch } from 'react-redux';
import { changeDate } from './dateSlice';
import { addUndesiredColor, removeUndesiredColor, addTotalColor, removeTotalColor } from './colorSlice';
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

    curYear = new Date("January 01 " + curYear).getFullYear();

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

    let firstOfMonth = new Date(curMonth + 1 + " 1, " + curYear);
    let lastOfMonth = new Date(curMonth + 1 + " " + daysInMonths[curMonth] + ", " + curYear);
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

    let firstOfMonth = new Date(curMonth + 1 + " 1, " + curYear);

    let lastOfMonth = new Date(curMonth + 1 + " " + daysInMonths[curMonth] + ", " + curYear);

    let weekAddition = [];

    for(let i = firstOfMonth.getDay() * -1 + 1; i < daysInMonths[curMonth] + 7 - lastOfMonth.getDay(); i++) {
        let yearNow = curYear;
        if(i < 1) {
            if(curMonth === 0) yearNow -= 1;
            if(((12 + curMonth - 1) % 12) + " " + (daysInMonths[(12 + curMonth - 1) % 12] + i) + " " + curYear === today) weekAddition.push([convertMonths[(12 + curMonth - 1) % 12], daysInMonths[(12 + curMonth - 1) % 12] + i, "date-today", yearNow]);
            else weekAddition.push([(12 + curMonth - 1) % 12, daysInMonths[(12 + curMonth - 1) % 12] + i, "text-color-gray", yearNow]);
        } else if(i >= 1 && i <= daysInMonths[curMonth]) {
            if(curMonth + " " + i + " " + curYear === today) weekAddition.push([curMonth, i, "date-today", yearNow]);
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
                            return <div className={"base-calendar-day " + value[2]} key={"base-calendar-day-" + index}>{value[1]}</div>
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
                <div className='base-calendar-title'>{convertMonths[curMonth]}, {curYear}</div>
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
            else timeArr.push([(i + 11) % 12 + 1, j, i < 12 ? "AM": "PM"]);
        }
    }

    let resultArr = timeArr.map((item, index) => {
        if(item[0] < 10) item[0] = "0" + item[0]
        if(item[1] < 10) item[1] = "0" + item[1]
        return (
            <div className="popup-time-choices" key={"popup-time-choices-" + index}>
                    {item[0] + ":" + item[1] + " " + item[2]}
            </div>
        )
    })

    const handlePopupTimeClick = (e) => {
        setCurTime(e.target.innerText);
        if(setPreviousTime !== null) {
            let addition = 0;
            if(e.target.innerText.substring(6) === "PM") addition = 12
            setPreviousTime({hour: parseInt(e.target.innerText.substring(0,2)) % 12 + addition, minute: parseInt(e.target.innerText.substring(3,5))})
        }
    }

    return (
        <div className={'popup-time-container ' + isVisible}>
            <div className='popup-time' onClick={(e) => handlePopupTimeClick(e)}>
                {resultArr}
            </div>
        </div>
        
    )
}

function ChooseColorPalate({selectedColor, setSelectedColor}) {
    let colors = ["#9fc0f5", "#4332d9", "#ae99e0", "#320699", "#c979bf", "#8a0e79", "#cf5f66", "#9e0812", "#93db7f", "#26820d", "#7adedc", "#0da3a1"];

    let returnArr = colors.map((color, index) => {
        return(
            <div className='color-palate' key={'color-palate-container-' + index}>
                <div style={{"backgroundColor" : color, "border" : color === selectedColor ? "3px solid white" : ""}} className='color-palate-color' onClick={() => setSelectedColor(color)}></div>
            </div>
        )
    });

    return(
        <div className='color-palate-container'>
            {returnArr}
        </div>
    )
}

function AddEventPopUp({isThisVisible, setIsThisVisible, dispatch, currentColors}) {

    const getTimeIn15MinuteIntervals = (hour, minute, wantedFunction) => {
        let returnStr = "";

        let condensedHour = ((hour + 11) % 12 + 1);
        let condensedMinute = Math.ceil(minute / 15) * 15;
        let addedDays = 0;
        let totalHours = hour;

        condensedHour = ((condensedHour + 11 + Math.floor(condensedMinute / 60)) % 12 + 1);
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

    let currentDate = new Date();

    let currentDateOne = new Date(currentDate.getTime() + (15 - currentDate.getMinutes() % 15) * 60000);
    let currentDateTwo = new Date(currentDate.getTime() + (15 - currentDate.getMinutes() % 15) * 60000 + 1800000);

    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const [curDateOne, setCurDateOne] = useState({"year": currentDateOne.getFullYear(), "month": currentDateOne.getMonth(), "day": currentDateOne.getDate()});
    const [curDateTwo, setCurDateTwo] = useState({"year": currentDateTwo.getFullYear(), "month": currentDateTwo.getMonth(), "day": currentDateTwo.getDate()});
    const [dateOneInput, setDateOneInput] = useState(convertMonths[currentDateOne.getMonth()] + " " + currentDateOne.getDate() + ", " + currentDateOne.getFullYear());
    const [dateTwoInput, setDateTwoInput] = useState(convertMonths[currentDateTwo.getMonth()] + " " + currentDateTwo.getDate() + ", " + currentDateTwo.getFullYear());
    const [curLocation, setCurLocation] = useState("");
    const [focusCalendarVisibleOne, setFocusCalendarVisibleOne] = useState("visibility-hidden");
    const [focusCalendarVisibleTwo, setFocusCalendarVisibleTwo] = useState("visibility-hidden");
    const [focusTimeVisibleOne, setFocusTimeVisibleOne] = useState("visibility-hidden");
    const [focusTimeVisibleTwo, setFocusTimeVisibleTwo] = useState("visibility-hidden");
    const [previousTime, setPreviousTime] = useState({hour: currentDateOne.getHours() + Math.floor((Math.ceil(currentDateOne.getMinutes() / 15) * 15) / 60), minute: (Math.ceil(currentDateOne.getMinutes() / 15) * 15) % 60});
    const [curTimeOne, setCurTimeOne] = useState(getTimeIn15MinuteIntervals(currentDateOne.getHours(), currentDateOne.getMinutes()));
    const [curTimeTwo, setCurTimeTwo] = useState(getTimeIn15MinuteIntervals(currentDateTwo.getHours(), currentDateTwo.getMinutes()));
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [originalCoords, setOriginalCoords] = useState([0,0]);
    const [selectedColor, setSelectedColor] = useState("#9fc0f5");
    const [curTitle, setCurTitle] = useState("");
    const [curDescription, setCurDescription] = useState("");
    const [wrongInputs, setWrongInputs] = useState({"time1" : "", "time2" : "", "date1" : "", "date2": ""});

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

    const handleSetCurDateOne = (e) => {
        let newArr = e.target.value.trim().split(/[, -/]/ig).filter((item) => item !== '');
        let monthNow = new Date(newArr[0] + " 01, 2000").getMonth();
        setCurDateOne({"year": parseInt(newArr[2]), "month": monthNow, "day" : parseInt(newArr[1])})
        setDateOneInput(e.target.value);
    }

    const handleSetCurDateTwo = (e) => {
        let newArr = e.target.value.trim().split(/[, -/]/ig).filter((item) => item !== '');
        let monthNow = new Date(newArr[0] + " 01, 2000").getMonth();
        setCurDateTwo({"year": parseInt(newArr[2]), "month": monthNow, "day" : parseInt(newArr[1])})
        setDateTwoInput(e.target.value);
    }

    useEffect(() => {
        if(!isNaN(Date.parse("01 01 01 " + curTimeOne)) && !isNaN(Date.parse("01 01 01 " + curTimeTwo)) && curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day) {
            let dateNow = new Date("01 01 01 " + curTimeOne);
            let dateTwo = new Date("01 01 01 " + curTimeTwo);
            if(dateNow.getHours() > dateTwo.getHours() || (dateNow.getHours() >= dateTwo.getHours() && dateNow.getMinutes() > dateTwo.getMinutes())) {
                setCurTimeTwo(getTimeIn15MinuteIntervals(dateNow.getHours(), dateNow.getMinutes()));
            }
        }
    }, [curTimeOne, dateOneInput, dateTwoInput]);

    useEffect(() => {
        let finalObj = {}
        if(isNaN(Date.parse("01 01 01 " + curTimeOne)) || curTimeOne === "") finalObj["time1"] = "input-incorrect";
        else finalObj["time1"] = "";
        if(isNaN(Date.parse("01 01 01 " + curTimeTwo)) || curTimeTwo === "") finalObj["time2"] = "input-incorrect";
        else finalObj["time2"] = "";
        if(isNaN(Date.parse(dateOneInput)) || dateOneInput.length < 5) finalObj["date1"] = "input-incorrect";
        else finalObj["date1"] = "";
        if(isNaN(Date.parse(dateTwoInput)) || dateTwoInput.length < 5) finalObj["date2"] = "input-incorrect";
        else finalObj["date2"] = "";

        if(finalObj.time1 !== "input-incorrect" && finalObj.time2 !== "input-incorrect" && finalObj.date1 !== "input-incorrect" && finalObj.date2 !== "input-incorrect") {
            let dayOne = new Date(dateOneInput)
            let dayTwo = new Date(dateTwoInput)
            dayOne = new Date(dayOne.getMonth() + 1 + " " + dayOne.getDate() + " " + dayOne.getFullYear() + " " + curTimeOne);
            dayTwo = new Date(dayTwo.getMonth() + 1 + " " + dayTwo.getDate() + " " + dayTwo.getFullYear() + " " + curTimeTwo);
            if(dayOne.getTime() > dayTwo.getTime()) {
                if(dayOne.getFullYear() === dayTwo.getFullYear() && dayOne.getMonth() === dayTwo.getMonth() && dayOne.getDate() === dayTwo.getDate()) {
                    finalObj["time1"] = "input-incorrect";
                } else {
                    finalObj["time1"] = "input-incorrect";
                    finalObj["date1"] = "input-incorrect";
                }
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

    const handleMoveMouseMove = (e) => {
        if(isMouseDown) {
            let effectedClass = document.querySelector('.add-event-popup');
            effectedClass.style.top = (e.clientY - originalCoords[0]) + "px";
            effectedClass.style.left = (e.clientX - originalCoords[1]) + "px";
        }
    }

    document.onmousemove = handleMoveMouseMove;

    const handleMoveMouseUp = () => {
        setIsMouseDown(false);
        document.onmousemove = null;
    }

    const handleClickEventExit = () => {
        setIsThisVisible("visibility-hidden")
        let effectedClass = document.querySelector('.add-event-popup');
        effectedClass.style.top = "calc((100% - 585px) / 2)";
        effectedClass.style.left = "calc((100% - 430px) / 2)";
        resetAll();
    }

    const handleClickEventSave = () => {
        if(wrongInputs.time1 !== "input-incorrect" && wrongInputs.time2 !== "input-incorrect" && wrongInputs.date1 !== "input-incorrect" && wrongInputs.date2 !== "input-incorrect") {
            let finalObj = {};
            if(curTitle === "") {
                finalObj["title"] = "[No Title]";
            } else {
                finalObj["title"] = curTitle;
            }
            let dayOne = new Date(dateOneInput);
            let dayTwo = new Date(dateTwoInput);
            finalObj["startTime"] = dayOne.getMonth() + 1 + " " + dayOne.getDate() + " " + dayOne.getFullYear() + " " + curTimeOne;
            finalObj["endTime"] = dayTwo.getMonth() + 1 + " " + dayTwo.getDate() + " " + dayTwo.getFullYear() + " " + curTimeTwo;
            finalObj["rawStartDate"] = dateOneInput;
            finalObj["rawStartTime"] = curTimeOne;
            finalObj["rawEndDate"] = dateTwoInput;
            finalObj["rawEndTime"] = curTimeTwo;
            finalObj["color"] = selectedColor;
            finalObj["location"] = curLocation;
            finalObj["description"] = curDescription;

            dispatch(addEvent(finalObj));

            if(currentColors.indexOf(selectedColor) === -1) {
                dispatch(addTotalColor(selectedColor));
            }

            handleClickEventExit();
        }
    }

    return(
        <div className={'add-event-popup add-event-popup-position ' + isThisVisible}>
            <div className='add-event-popup-move' onMouseDown={(e) => handleMoveMouseDown(e)} onMouseUp={(e) => handleMoveMouseUp(e)}>
                <svg className='add-event-popup-exit' onClick={() => handleClickEventExit()} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </div>
            <input type="text" className='add-event-popup-title' name="add-event-popup-title" placeholder='Enter title here' value={curTitle} onChange={(e) => setCurTitle(e.target.value)}></input>
            <div className='add-event-popup-time-container'>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                <div className='add-event-popup-texts'>Time</div>
            </div>
            <div className='add-event-popup-time'>
                <div className='add-event-popup-time-sub'>
                    <div className='add-event-popup-time-sub1-ref' ref={ref1}>
                        <input type="text" className={'add-event-popup-time-date ' + wrongInputs.date1} placeholder='Enter date here' name="add-event-popup-time-date-1" value={dateOneInput} onChange={handleSetCurDateOne} onFocus={() => setFocusCalendarVisibleOne("visibility-visible")}></input>
                        <AddEventPopupCalendar currentDate={curDateOne} setCurrentDate={setCurDateOne} setDateInput={setDateOneInput} focusCalendarVisible={focusCalendarVisibleOne}/>
                    </div>
                    <div>at</div>
                    <div className='add-event-popup-time-sub3-ref' ref={ref3}>
                        <input type="text" className={'add-event-popup-time-time ' + wrongInputs.time1} name="add-event-popup-time-time" value={curTimeOne} onChange={(e) => setCurTimeOne(e.target.value)} onFocus={() => setFocusTimeVisibleOne("visibility-visible")}></input>
                        <AddEventPopUpTime previousTime={{hour: 0, minute: 0}} setPreviousTime={setPreviousTime} setCurTime={setCurTimeOne} isVisible={focusTimeVisibleOne} curTime={curTimeOne}/>
                    </div>
                </div>
                <div className='add-event-popup-time-to'>to</div>
                <div className='add-event-popup-time-sub'>
                <div className='add-event-popup-time-sub2-ref' ref={ref2}>
                    <input type="text" className={'add-event-popup-time-date ' + wrongInputs.date2} placeholder='Enter date here' name="add-event-popup-time-date-1" value={dateTwoInput} onChange={handleSetCurDateTwo} onFocus={() => setFocusCalendarVisibleTwo("visibility-visible")}></input>
                    <AddEventPopupCalendar currentDate={curDateTwo} setCurrentDate={setCurDateTwo} setDateInput={setDateTwoInput} focusCalendarVisible={focusCalendarVisibleTwo}/>
                </div>
                    <div>at</div>
                    <div className='add-event-popup-time-sub4-ref' ref={ref4}>
                        <input type="text" className={'add-event-popup-time-time ' + wrongInputs.time2} name="add-event-popup-time-time" value={curTimeTwo} onChange={(e) => setCurTimeTwo(e.target.value)} onFocus={() => setFocusTimeVisibleTwo("visibility-visible")}></input>
                        <AddEventPopUpTime previousTime={curDateOne.year === curDateTwo.year && curDateOne.month === curDateTwo.month && curDateOne.day === curDateTwo.day ? previousTime : {hour: 0, minute: 0}} setCurTime={setCurTimeTwo} isVisible={focusTimeVisibleTwo} curTime={curTimeTwo}/>
                    </div>
                </div>
            </div>
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
            <input type="text" className='add-event-popup-location' name="add-event-popup-location" value={curLocation} onChange={(e) => setCurLocation(e.target.value)}></input>
            <div className='add-event-popup-save'>
                <div className='add-event-popup-button' onClick={() => handleClickEventSave()}>Save</div>
                <div className='add-event-popup-button' onClick={() => handleClickEventExit()}>Cancel</div>
            </div>
            
        </div>
    );
}

function AddEvent({setAddEventPopUpVisible}) {
    return(
        <div className='add-event-container' onClick={() => setAddEventPopUpVisible("visibility-visible")}>
            <div className='add-event'>
                <div className='add-event-add-sign'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
                </div>
                <div className='add-event-text'>Event</div>
            </div>
        </div>
    )
}

function TodayEvents({currentEvents, curentUnwantedColors}) {
    const getHourAndMinutes = (hour, minute) => {
        let returnStr = "";

        let condensedHour = ((hour + 11) % 12 + 1);

        if(condensedHour < 10) condensedHour = "0" + condensedHour;
        if(minute < 10) minute = "0" + minute;

        returnStr += condensedHour + ":" + minute;

        if(hour % 24 > 11) {
            returnStr += " PM";
        } else {
            returnStr += " AM";
        }

        return returnStr;
    }

    const filterEvents = (event, year, month, day, curentUnwantedColors) => {
        let eventDate = new Date(event.startTime);
        return (eventDate.getDate() === day && 
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year &&
        curentUnwantedColors.indexOf(event.color) === -1);
    }

    let newDate = new Date();

    //const currentEvents = [["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"],["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"],["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"],["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"], ["Kazuha", "red"]];
    const currentEventsJSX = [...currentEvents].filter((event) => filterEvents(event, newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), curentUnwantedColors)).sort((a, b) => {
        return (new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes()) - (new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes())
    }).map((item, index) =>
        <div className='today-events-item-container' key={"today-events-" + index}>
            <div className='today-events-item'>
                <div className="today-events-item-color" style={{"backgroundColor": item.color}}></div>
                <div className="today-events-item-time">{getHourAndMinutes(new Date(item.startTime).getHours(), new Date(item.startTime).getMinutes())}</div>
                <div className='today-events-item-name'>{item.title}</div>
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

function ColorChooser({curentUnwantedColors, dispatch, currentColors}) {
    let colors = ["#9fc0f5", "#4332d9", "#ae99e0", "#320699", "#c979bf", "#8a0e79", "#cf5f66", "#9e0812", "#93db7f", "#26820d", "#7adedc", "#0da3a1"];
    colors = colors.filter((color) => {
        return currentColors.indexOf(color) !== -1
    });


    const handleColorCheckboxChange = (e, color) => {
        if(!e.target.checked && curentUnwantedColors.indexOf(color) === -1) {
            dispatch(addUndesiredColor(color));
        } else {
            let index = curentUnwantedColors.indexOf(color);
            if(index !== -1) {
                dispatch(removeUndesiredColor(index));
            }
        }
        console.log(curentUnwantedColors);
    }

    let returnArr = colors.map((color, index) => {
        return(
            <div className='color-chooser' key={'color-chooser-' + index}>
                <input type="checkbox" id={"color-chooser-checkbox " + index} name={"color-chooser-checkbox " + index} value={color} defaultChecked={true} onChange={(e) => handleColorCheckboxChange(e, color)}></input>
                <div style={{"backgroundColor" : color}} className='color-chooser-color'></div>
                <input type="text" placeholder='Enter label here...' className='color-chooser-label' name={"color-chooser-label-" + index}></input>
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
    const curentUnwantedColors = useSelector((state) => state.color.undesiredColors);
    const currentColors = useSelector((state) => state.color.totalColors);
    const dispatch = useDispatch();
    const [addEventPopUpVisible, setAddEventPopUpVisible] = useState("visibility-hidden");
    return(
        <div className="calendar-menu">
            <AddEvent setAddEventPopUpVisible={setAddEventPopUpVisible}/>
            <AddEventPopUp isThisVisible={addEventPopUpVisible} setIsThisVisible={setAddEventPopUpVisible} dispatch={dispatch} currentColors={currentColors}/>
            <div className='calendar-menu-divider-line'></div>
            <BaseCalendar currentDate={currentDate} dispatch={dispatch}/>
            <div className='calendar-menu-divider-line'></div>
            <TodayEvents currentEvents={currentEvents} curentUnwantedColors={curentUnwantedColors}/>
            <div className='calendar-menu-divider-line'></div>
            <ColorChooser curentUnwantedColors={curentUnwantedColors} dispatch={dispatch} currentColors={currentColors}/>
        </div>
    )
}

export default Menu;