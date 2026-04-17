import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional, for handling 401 globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
