import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';

function HeaderToggleSideMenu() {
    return(
        <div className='toggle-header-menu-container'>
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

        document.addEventListener("mousedown", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("mousedown", HeaderDropdownMenuClicked);
        }
    }, [visible]);

    const changeDateSpecificsOnClick = (value) => {
        props.dispatch(changeDateSpecifics(value));
    }

    return(
        <div className='header-dropdown-container' ref={ref}>
            <div className='dropdown-main' onClick={() => visible[0] === "visible" ? setVisible(["hidden", 0]) : setVisible(["visible", 1])}>
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
            display = convertMonths[currentDate.month] + ", " + currentDate.year;
            break;
        case "day":
            display = convertMonths[currentDate.month] + " " + currentDate.day + ", " + currentDate.year;
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

                break;
            case "week":

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

                break;
            case "week":

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

function Header() {
    const currentDate = useSelector((state) => state.date);
    const dispatch = useDispatch();
    return(
        <div className="calendar-header">
            <HeaderToggleSideMenu />
            <HeaderCalendar />
            <HeaderDescription currentDate={currentDate} dispatch={dispatch}/>
            <HeaderDropdownMenu currentDate={currentDate} dispatch={dispatch}/>
            <HeaderSignIn />
        </div>
    );
}

export default Header;