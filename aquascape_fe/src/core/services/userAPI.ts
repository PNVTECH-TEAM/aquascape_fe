import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL_API;
console.log("API_URL =", API_URL);

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const userAPI = {
  login: (data: LoginPayload) => {
    console.log("LOGIN API DATA:", data);

    return axios.post<LoginResponse>(`${API_URL}/auth/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  logout: (token: string) =>
    axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ),

  tokenStatus: (token: string) =>
    axios.post(
      `${API_URL}/auth/token-status`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ),
};
