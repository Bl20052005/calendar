import { configureStore } from '@reduxjs/toolkit'
import eventReducer from './eventSlice';
import dateReducer from './dateSlice';

export default configureStore({
  reducer: {
    event: eventReducer,
    date: dateReducer,
  },
});