import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from "axios";
import './index.css'
import App from './App.jsx'
import { API_BASE_URL } from "./apiConfig";

// 🔹 Global Axios Configuration
axios.defaults.baseURL = API_BASE_URL;
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Global Response Interceptor (Optional: Handle 401s)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login") && window.location.pathname !== "/") {
      console.warn("Session expired. Logging out...");
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
