import axios from "axios";
import { state } from "../store/state";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let activeRequests = 0;

const startLoading = () => {
  if (activeRequests === 0) {
    state.loading = true;
  }
  activeRequests++;
};

const stopLoading = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    state.loading = false;
  }
};

api.interceptors.request.use(
  (config) => {
    if (config.showLoader !== false) {
      startLoading();
    }
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (error.config && error.config.showLoader !== false) {
      stopLoading();
    }
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (response.config && response.config.showLoader !== false) {
      stopLoading();
    }
    return response;
  },
  (error) => {
    if (error.config && error.config.showLoader !== false) {
      stopLoading();
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
