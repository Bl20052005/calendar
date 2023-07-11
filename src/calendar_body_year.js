import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';
import "./calendar_body_year.css";

function BodyYearMonth({currentDate, dispatch}) {
    const convertWeeks = ["S", "M", "T", "W", "Th", "F", "Sa"]
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let daysInMonths = [];
    let calendarArray = [];

    let curDate = currentDate;

    let curMonth = curDate.month;
    let curYear = curDate.year;

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

    const returnCalendar = [<div className='body-year-calendar-week-group' key={"body-year-calendar-week-group-0"}>
            {convertWeeks.map((item, index) => {
            return <div className='body-year-calendar-week-top-group' key={'body-year-calendar-week-top-group-' + index}>
                    {item}
                </div>
            })}
        </div>
    ];

    const returnValue = returnCalendar.concat(calendarArray.map((item, index) =>
                    <div className='body-year-calendar-week-group' key={"body-year-calendar-week-" + index}>
                        {item.map((value, index) => {
                           
                            const handleOnClick = () => {
                                dispatch(changeDate({"month" : value[0], "day" : value[1], "year": value[3]}));
                                dispatch(changeDateSpecifics("day"));
                            }
                            return <div onClick={() => handleOnClick()} className={"body-year-calendar-day " + value[2]} key={"body-year-calendar-day-" + index}>{value[1]}</div>
                        })}
                    </div>
                ));

    return(
        <div className='body-year-calendar'>
            <div className='body-year-calendar-top'>
                <div className='body-year-calendar-title'>{convertMonths[curMonth]}</div>
            </div>
            {returnValue}
        </div>
    )
}

function BodyYear() {
    const dispatch = useDispatch();
    const currentDate = useSelector((state) => state.date);

    let yearArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    let returnValue = yearArray.map((month) => {
        return(
            <BodyYearMonth currentDate={{"year" : currentDate.year, "month" : month}} dispatch={dispatch}/>
        )
    })

    return(
        <div className="calendar-body-year">
            {returnValue}
        </div>
    )

}

export default BodyYear;