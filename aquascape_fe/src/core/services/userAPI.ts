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

export const loginApi = (payload: {
  email: string;
  password: string;
}) => {
  return axios.post(`${API_BASE_URL}/auth/login`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};