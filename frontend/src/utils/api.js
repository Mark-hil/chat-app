import { API_BASE_URL } from '../config';

export const getCsrfToken = () => {
  return document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

export const fetchWithCsrf = async (endpoint, options = {}) => {
  const csrfToken = getCsrfToken();
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      ...(token ? { 'Authorization': `Token ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Clear token and redirect to login if unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
        return;
      }
      const error = await response.json();
      throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
