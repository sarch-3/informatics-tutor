import axios from 'axios';
import { setTokens, getRefreshToken, getAccessToken, clearTokens } from './jwt';

const api = axios.create({
  baseURL: "/api"
  // baseURL: 'http://localhost:8000/api', // Замените на ваш URL API
});

let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/user/refresh/')) {
      if (config.headers) {
        delete config.headers['Authorization'];
      }
      return config;
    }
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;
    // Проверяем, что это 401 и ошибка именно по токену
    if (
      response &&
      response.status === 401 &&
      !originalRequest._retry &&
      response.data &&
      response.data.code === 'token_not_valid'
    ) {
      originalRequest._retry = true;
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        window.location.assign("/auth");
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        const res = await api.post('/user/refresh/', { refresh });
        setTokens({ access: res.data.access, refresh: getRefreshToken() || "" }); // Перезаписываем только access
        processQueue(null, res.data.access);
        originalRequest.headers['Authorization'] = 'Bearer ' + res.data.access;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens(); // refresh удаляется при неудаче
        window.location.assign("/auth");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
