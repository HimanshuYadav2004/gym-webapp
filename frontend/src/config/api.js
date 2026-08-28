import axios from 'axios';

// Set base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// A 402 means the gym's license has expired — bounce to the renewal page
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 402 && !window.location.pathname.startsWith('/renew')) {
      window.location.href = '/renew';
    }
    return Promise.reject(error);
  }
);

export default axios;
