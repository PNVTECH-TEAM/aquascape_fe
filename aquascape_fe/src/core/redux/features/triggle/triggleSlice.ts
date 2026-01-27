import { createSlice } from '@reduxjs/toolkit';

interface TriggleState {
  value: boolean;
}

const initialState: TriggleState = {
  value: false,
};

const triggleSlice = createSlice({
  name: 'triggle',
  initialState,
  reducers: {
    toggle: (state) => {
      state.value = !state.value;
    },
  },
});

export const { toggle } = triggleSlice.actions;
export default triggleSlice.reducer;
