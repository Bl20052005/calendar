import React from 'react';
import "./App.css";
import Header from './calendar_header';
import Menu from './calendar_menu';
import Body from './calendar_body';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0cYcE9V1gIORQdShcK8HX2loaG-jp8AA",
  authDomain: "calendar-8597c.firebaseapp.com",
  projectId: "calendar-8597c",
  storageBucket: "calendar-8597c.appspot.com",
  messagingSenderId: "1078599797924",
  appId: "1:1078599797924:web:473bdd05b3a2e5e5a1ea31",
  measurementId: "G-9YCH3JXEZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



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