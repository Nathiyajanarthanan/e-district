import axios from 'axios';

const getBaseURL = () => {
  let url = (import.meta as any).env.VITE_API_URL;
  if (!url) return '/api';
  
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }

  // Handle Render internal hostnames (e.g., "e-district-server" -> "e-district-server.onrender.com")
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost' && !urlObj.hostname.includes('onrender.com')) {
      urlObj.hostname = `${urlObj.hostname}.onrender.com`;
      url = urlObj.toString().replace(/\/$/, ''); // Remove trailing slash
    }
  } catch (e) {
    // Fallback if URL parsing fails
  }

  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
