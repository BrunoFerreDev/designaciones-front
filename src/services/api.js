import axios from "axios";
import { state } from "../store/state";

import { mockDatabaseAdapter } from "./mockDatabase";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  adapter: mockDatabaseAdapter
});

let activeGlobalRequests = 0;
let activeTopBarRequests = 0;
const pendingGetRequests = new Map();

const getLoaderType = (config) => {
  if (config.showLoader === false || config.loaderType === "silent") {
    return "silent";
  }
  if (config.showLoader === true || config.loaderType === "global") {
    return "global";
  }
  if (config.loaderType === "topbar") {
    return "topbar";
  }
  return "topbar";
};

const startLoading = (type) => {
  if (type === "global") {
    if (activeGlobalRequests === 0) {
      state.loading = true;
    }
    activeGlobalRequests++;
  } else if (type === "topbar") {
    if (activeTopBarRequests === 0) {
      state.loadingTopBar = true;
    }
    activeTopBarRequests++;
  }
};

const stopLoading = (type) => {
  if (type === "global") {
    activeGlobalRequests--;
    if (activeGlobalRequests <= 0) {
      activeGlobalRequests = 0;
      state.loading = false;
    }
  } else if (type === "topbar") {
    activeTopBarRequests--;
    if (activeTopBarRequests <= 0) {
      activeTopBarRequests = 0;
      state.loadingTopBar = false;
    }
  }
};

api.interceptors.request.use(
  (config) => {
    const loaderType = getLoaderType(config);
    config._loaderType = loaderType;
    startLoading(loaderType);

    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const loaderType = error.config ? getLoaderType(error.config) : "global";
    stopLoading(loaderType);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const loaderType = response.config ? response.config._loaderType || getLoaderType(response.config) : "topbar";
    stopLoading(loaderType);
    return response;
  },
  (error) => {
    const loaderType = error.config ? error.config._loaderType || getLoaderType(error.config) : "topbar";
    stopLoading(loaderType);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Helper para realizar GET con deduplicación de peticiones idénticas en vuelo.
 */
export const getDeduplicated = (url, config = {}) => {
  const requestKey = `${url}?${JSON.stringify(config.params || {})}`;
  if (pendingGetRequests.has(requestKey)) {
    return pendingGetRequests.get(requestKey);
  }

  const promise = api.get(url, config).finally(() => {
    pendingGetRequests.delete(requestKey);
  });

  pendingGetRequests.set(requestKey, promise);
  return promise;
};

export default api;
