import axios from "axios";

// Helper to get the CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

const API_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrftoken, // Attach CSRF token to every request
  },
});

// Automatically attach JWT access token if user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always ensure CSRF token is updated before every request
  const csrf = getCookie('csrftoken');
  if (csrf) {
    config.headers["X-CSRFToken"] = csrf;
  }

  return config;
});

// Fetch user role utility
export const fetchUserRole = async () => {
  try {
    const response = await api.get("user/profile/");
    localStorage.setItem("user_role", response.data.role);
    return response.data.role;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export default api;
