import React from 'react';
import { useState, useEffect, useRef } from "react";

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

function HeaderDropdownMenu() {

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

    return(
        <div className='header-dropdown-container' ref={ref}>
            <div className='dropdown-main' onClick={() => visible[0] === "visible" ? setVisible(["hidden", 0]) : setVisible(["visible", 1])}>
                <span>Month</span>
                <svg className="dropdown-main-down-arrow" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
            </div>
            <div className='header-dropdown-select' style={{"visibility": visible[0], "opacity": visible[1]}}>
                <div className='header-dropdown-select-options'>Day</div>
                <div className='header-dropdown-select-options'>Week</div>
                <div className='header-dropdown-select-options'>Month</div>
                <div className='header-dropdown-select-options'>Year</div>
                <div className='header-dropdown-select-options'>Schedule</div>
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

function header() {
    return(
        <div className="calendar_header">
            <HeaderToggleSideMenu />
            <HeaderCalendar />
            <HeaderDropdownMenu />
            <HeaderSignIn />
        </div>
    );
}

export default header;