import { createSlice } from '@reduxjs/toolkit';
import { ACCESS_TOKEN } from '@app/core/constants';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem('user'); // Also remove user profile if it exists
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
