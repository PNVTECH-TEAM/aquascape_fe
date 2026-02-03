import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URL_API;

export const registerApi = (payload: {
  fullName: string;
  email: string;
  password: string;
}) => {
  return axios.post(`${API_BASE_URL}/auth/register`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// ✅ VERIFY OTP
export const verifyOtpApi = (payload: { email: string; otp: string }) => {
  return axios.post(`${API_BASE_URL}/auth/verify-otp`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// ✅ RESEND OTP
export const resendOtpApi = (payload: { email: string }) => {
  return axios.post(`${API_BASE_URL}/auth/resend-otp`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
