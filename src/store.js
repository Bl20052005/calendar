import { configureStore } from '@reduxjs/toolkit'
import eventReducer from './eventSlice';
import dateReducer from './dateSlice';
import colorReducer from './colorSlice';
import calendarEventReducer from './calendarEventSlice';
import currentAdditionReducer from './currentAddition';
import moveEventReducer from './moveEvent';

export default configureStore({
  reducer: {
    event: eventReducer,
    date: dateReducer,
    color: colorReducer,
    calendarEvent: calendarEventReducer,
    currentAddition: currentAdditionReducer,
    moveEvent : moveEventReducer,
  },
});