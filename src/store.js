import { configureStore } from '@reduxjs/toolkit'
import eventReducer from './eventSlice';
import dateReducer from './dateSlice';
import colorReducer from './colorSlice';

export default configureStore({
  reducer: {
    event: eventReducer,
    date: dateReducer,
    color: colorReducer,
  },
});