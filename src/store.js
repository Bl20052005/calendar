import { configureStore } from '@reduxjs/toolkit'
import eventReducer from './eventSlice';
import dateReducer from './dateSlice';
import colorReducer from './colorSlice';
import calendarEventReducer from './calendarEventSlice';

export default configureStore({
  reducer: {
    event: eventReducer,
    date: dateReducer,
    color: colorReducer,
    calendarEvent: calendarEventReducer,
  },
});