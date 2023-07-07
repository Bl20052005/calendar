import { configureStore } from '@reduxjs/toolkit'
import eventReducer from './redux_slices/eventSlice';
import dateReducer from './redux_slices/dateSlice';
import colorReducer from './redux_slices/colorSlice';
import calendarEventReducer from './redux_slices/calendarEventSlice';
import currentAdditionReducer from './redux_slices/currentAddition';
import moveEventReducer from './redux_slices/moveEvent';
import viewAllReducer from './redux_slices/viewAllSlice';

export default configureStore({
  reducer: {
    event: eventReducer,
    date: dateReducer,
    color: colorReducer,
    calendarEvent: calendarEventReducer,
    currentAddition: currentAdditionReducer,
    moveEvent : moveEventReducer,
    viewAll : viewAllReducer,
  },
});