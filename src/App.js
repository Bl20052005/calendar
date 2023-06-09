import React from 'react';
import "./App.css";
import Header from './calendar_header';
import Menu from './calendar_menu';
import BodyMonth from './calendar_body_month';


function App() {

    return(
        <div id="calendar-container">
            <Header />
            <Menu />
            <BodyMonth />
            {/* <p>{curDate}</p>
            <p onClick={() => dispatch(addDate())}>+</p>
            <p onClick={() => dispatch(minusDate())}>-</p> */}
        </div>
    )
}

export default App;