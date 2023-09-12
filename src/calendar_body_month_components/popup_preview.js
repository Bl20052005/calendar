import React from 'react';
import { useEffect, useRef } from "react";
import { removeTotalColor } from '../redux_slices/colorSlice';
import { removeEvent } from '../redux_slices/eventSlice';
import { changeCalendarEvent } from '../redux_slices/calendarEventSlice';
import { changeSingleViewAllContents } from '../redux_slices/viewAllSlice';
import getHourAndMinutes from '../calendar_body_useful_functions/get_hours_and_minutes';


function PopupPreview({isVisible, setIsVisible, event, dispatch, setCurReference, currentEvents}) {

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

    const handlePopupEdit = () => {
        let EditingObj = {
            "curDateOne" : currentEvents[event.index].curDateOne,
            "curDateTwo" : currentEvents[event.index].curDateTwo,
            "dateOneInput" : currentEvents[event.index].rawStartDate,
            "dateTwoInput" : currentEvents[event.index].rawEndDate,
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
            "repeat" : event.repeat,
            "repeatSpecifics" : event.repeatSpecifics,
            "repeatEnding" : event.repeatEnding,
            "repeatExceptions" : event.repeatExceptions,
        }
        dispatch(changeCalendarEvent(EditingObj));
        setIsVisible("visibility-hidden");
        dispatch(changeSingleViewAllContents({"key" : "visibility", "value" : "visibility-hidden"}));
    }

    const ref = useRef();

    useEffect(() => {
        const makeVisibilityHiddenClick = (e) => {
            setCurReference((curReference) => {
                if(isVisible === "visibility-visible" && ref.current && !ref.current.contains(e.target) && e.target !== curReference ) {
                    setIsVisible("visibility-hidden")
                }
                return curReference;
            })
        }

        document.addEventListener("click", makeVisibilityHiddenClick);

        return () => {
            document.removeEventListener("click", makeVisibilityHiddenClick);
        }
    }, [isVisible]);

    return(
        <div className={'popup-preview-container ' + isVisible} ref={ref}>
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

export default PopupPreview;