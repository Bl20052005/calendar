import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './store';
import { Provider } from 'react-redux'

let ls = document.getElementById("root");

let root = ReactDOM.createRoot(ls);

root.render(<Provider store={store}>
    <App />
</Provider>);