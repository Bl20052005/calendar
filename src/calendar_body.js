import BodyMonth from "./calendar_body_month";
import BodyDay from "./calendar_body_day";
import BodySchedule from "./calendar_body_schedule";
import BodyYear from "./calendar_body_year";
import BodyWeek from "./calendar_body_week";
import React from 'react';
import { useSelector } from 'react-redux';

function Body() {
    const currentSpecifics = useSelector((state) => state.date.specifics);
    const returnFunc = () => {
        switch(currentSpecifics) {
            case "year":
                return <BodyYear />;
            case "month":
                return <BodyMonth />;
            case "week":
                return <BodyWeek />;
            case "day":
                return <BodyDay />;
            case "schedule":
                return <BodySchedule />;
        }
    }
    
    return(
        <div className="calendar-body-container">
            {returnFunc()}
        </div>
    )

}

export default Body;