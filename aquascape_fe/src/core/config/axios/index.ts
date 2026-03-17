import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

import { getStorageData, removeStorageData } from "../storage";
import { ACCESS_TOKEN, USER_PROFILE } from "@app/core/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL_API || "http://35.238.139.81:8080/api/v1";
axios.defaults.baseURL = BASE_URL;

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Note: getStorageData retrieves the token from localStorage
    const accessToken = getStorageData(ACCESS_TOKEN);
    
    if (accessToken) {
      // Handle if accessToken is an object (common if stored via JSON.stringify incorrectly)
      const token = typeof accessToken === "string" ? accessToken : accessToken?.token || accessToken?.accessToken;
      
      if (token && config.headers) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const { response } = error;

    if (
      response?.status === 401 ||
      response?.status === 403 ||
      (response?.data as any)?.message === "Unauthorized" ||
      (response?.data as any)?.message === "TOKEN_EXPIRED"
    ) {
      removeToken();
      // Only redirect if not already on the login page or register page to avoid redirect loops
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

function removeToken() {
  removeStorageData(USER_PROFILE);
  removeStorageData(ACCESS_TOKEN);
}
