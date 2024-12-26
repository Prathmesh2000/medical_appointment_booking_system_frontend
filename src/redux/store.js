import { configureStore } from '@reduxjs/toolkit';
import commonDataReducer from './commonDataSlice';

const store = configureStore({
  reducer: {
    commonData: commonDataReducer,
  },
});

export default store;
