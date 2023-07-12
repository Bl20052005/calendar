import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';

function HeaderToggleSideMenu({menuHidden, setMenuHidden}) {
    const handleHeaderMenuOnClick = () => {
        let menu = document.querySelector('.calendar-menu');
        let body = document.querySelector('.calendar-body-container');
        let addEvent = document.querySelector('.add-event');
        let addEventText = document.querySelector('.add-event-text');
        let menuContainer = document.querySelector('.toggle-header-menu-container')
        if(!menuHidden) {
            menu.style.transform = "translateX(-100%)";
            body.style.left = "0px";
            body.style.width = "100%";
            body.style.transition = "left 0.5s ease-in-out, width 0.5s ease-in-out";
            addEvent.style.left = "10px";
            addEvent.style.top = "80px";
            addEvent.style.width = "40px";
            addEventText.style.display = "none";
            menuContainer.style.pointerEvents = "none";
            setTimeout(() => {
                menuContainer.style.pointerEvents = "";
                body.style.transition = "";
            }, 500)
            setMenuHidden(true);
        } else {
            menu.style.transform = "";
            body.style.left = "";
            body.style.width = "";
            body.style.transition = "left 0.5s ease-in-out, width 0.5s ease-in-out";
            addEvent.style = "";
            addEventText.style = "";
            menuContainer.style.pointerEvents = "none";
            setTimeout(() => {
                body.style = "";
                menuContainer.style.pointerEvents = "";
            }, 500)
            setMenuHidden(false);
        }

    }
    return(
        <div className='toggle-header-menu-container' onClick={() => handleHeaderMenuOnClick()}>
            <div className='toggle-header-menu-line'></div>
            <div className='toggle-header-menu-line'></div>
            <div className='toggle-header-menu-line'></div>
        </div>
    );
}

function HeaderCalendar() {
    return(
        <div className='header-calendar-container'>
            <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 0 448 512"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"/></svg>
            <div className='header-calendar-text'>Calendar</div>
        </div>
    );
}

function HeaderDropdownMenu(props) {

    const [visible, setVisible] = useState(["hidden", 0]);

    const ref = useRef();

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(visible[0] === "visible" && ref.current && !ref.current.contains(e.target)) {
                setVisible(["hidden", 0])
            }
        }

        document.addEventListener("click", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("click", HeaderDropdownMenuClicked);
        }
    }, [visible]);

    const changeDateSpecificsOnClick = (value) => {
        props.dispatch(changeDateSpecifics(value));
    }

    return(
        <div className='header-dropdown-container'>
            <div className='dropdown-main' onClick={() => visible[0] === "visible" ? setVisible(["hidden", 0]) : setVisible(["visible", 1])} ref={ref}>
                <span>{props.currentDate.specifics[0].toUpperCase() + props.currentDate.specifics.substring(1)}</span>
                <svg className="dropdown-main-down-arrow" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
            </div>
            <div className='header-dropdown-select' style={{"visibility": visible[0], "opacity": visible[1]}}>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("day")}>Day</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("week")}>Week</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("month")}>Month</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("year")}>Year</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("schedule")}>Schedule</div>
            </div>
        </div>
    );
}

function HeaderSignIn() {
    return(
        <div className='header-signIn-container'>
            <div className='header-signIn-text'>Sign In</div>
            <img className='header-signIn-profile-pic' src="https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg"/>
        </div>
    )
}

function HeaderDescription({currentDate, dispatch}) {
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let display = "";

    switch(currentDate.specifics) {
        case "month":
            display = convertMonths[currentDate.month] + ", " + currentDate.year;
            break;
        case "year":
            display = currentDate.year;
            break;
        case "week":
            let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
            let dayOne = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate() - curDay.getDay());
            let dayTwo = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate() + 6 - curDay.getDay());
            if(dayOne.getFullYear() !== dayTwo.getFullYear()) {
                display = convertMonths[dayOne.getMonth()].substring(0, 3) + " " + dayOne.getDate() + ", " + (dayOne.getFullYear() % 100) + " - " + convertMonths[dayTwo.getMonth()].substring(0, 3) + " " + dayTwo.getDate() + ", " + (dayTwo.getFullYear() % 100);
            } else if(dayOne.getMonth() !== dayTwo.getMonth()) {
                display = convertMonths[dayOne.getMonth()].substring(0, 3) + " " + dayOne.getDate() + " - " + convertMonths[dayTwo.getMonth()].substring(0, 3) + " " + dayTwo.getDate() + ", " + dayTwo.getFullYear();
            } else {
                display = convertMonths[dayOne.getMonth()].substring(0, 3) + " " + dayOne.getDate() + " - " + dayTwo.getDate() + ", " + dayTwo.getFullYear();
            }
            break;
        case "day":
            display = convertMonths[currentDate.month] + " " + currentDate.day + ", " + currentDate.year;
            break;
    }

    const changeDateEnablerMinus = () => {
        if(currentDate.month === 0) {
            return {
                    year: currentDate.year - 1,
                    month: 11,
                    day: 1
                }
        } else {
            return {
                    year: currentDate.year,
                    month: currentDate.month - 1,
                    day: 1
                }
            }
        }

    const changeDateEnablerPlus = () => {
        if(currentDate.month === 11) {
            return {
                year: currentDate.year + 1,
                month: 0,
                day: 1
            }
        } 
        else {
            return {
                year: currentDate.year,
                month: currentDate.month + 1,
                day: 1
            }
        }
    }

    const changeCalendarDatePlus = () => {
        let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
        switch(currentDate.specifics) {
            case "month":
                return changeDateEnablerPlus();
                break;
            case "year":
                return {year: currentDate.year + 1, month: 0, day: 1};
                break;
            case "week":
                curDay.setDate(curDay.getDate() + 7);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
                break;
            case "day":
                curDay.setDate(curDay.getDate() + 1);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
                break;
        }
    }

    const changeCalendarDateMinus = () => {
        let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
        switch(currentDate.specifics) {
            case "month":
                return changeDateEnablerMinus();
                break;
            case "year":
                return {year: currentDate.year - 1, month: 0, day: 1};
                break;
            case "week":
                curDay.setDate(curDay.getDate() - 7);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
                break;
            case "day":
                curDay.setDate(curDay.getDate() - 1);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
                break;
        }
    }

    return(
        <div className='header-description-container'>
            <div className='header-description-arrow-left' onClick={() => dispatch(changeDate(changeCalendarDateMinus()))}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
            </div>
            <div className='header-description-arrow-right' onClick={() => dispatch(changeDate(changeCalendarDatePlus()))}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
            </div>
            <div className='header-description-title'>{display}</div>
        </div>
    );
}

function HeaderToday({dispatch}) {
    let curDay = new Date();
    return(
        <div className='header-today' onClick={() => dispatch(changeDate({year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()}))}>Today</div>
    )
}

function Header() {
    const currentDate = useSelector((state) => state.date);
    const dispatch = useDispatch();
    const [menuHidden, setMenuHidden] = useState(false);
    return(
        <div className="calendar-header">
            <HeaderToggleSideMenu menuHidden={menuHidden} setMenuHidden={setMenuHidden}/>
            <HeaderCalendar />
            <HeaderToday dispatch={dispatch} />
            <HeaderDescription currentDate={currentDate} dispatch={dispatch}/>
            <HeaderDropdownMenu currentDate={currentDate} dispatch={dispatch}/>
            <HeaderSignIn />
        </div>
    );
}

export default Header;