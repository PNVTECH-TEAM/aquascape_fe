import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import triggleReducer from './features/triggle/triggleSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  triggle: triggleReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
