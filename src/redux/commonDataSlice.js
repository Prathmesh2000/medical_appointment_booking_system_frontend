import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    seletedBookingDate: '',
    userName: ''
};

const commonDataSlice = createSlice({
  name: 'commonData',
  initialState: initialState, 

  reducers: {
    setCommonData: (state, action) => {
        const { key, value } = action.payload; // Destructure to get key and value
        state[key] = value; // Update the state dynamically based on key-value pair
    },
  },
});

export const { setCommonData } = commonDataSlice.actions;
export default commonDataSlice.reducer;
