import React from 'react';
import "./App.css";
import Header from './calendar_header';
import Menu from './calendar_menu';
import Body from './calendar_body';


function App() {

    return(
        <div id="calendar-container">
            <Header />
            <Menu />
            <Body />
        </div>
    )
}

export default App;