import { API_BASE_URL } from '../config';

export const getCsrfToken = () => {
  return document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

export const fetchWithCsrf = async (endpoint, options = {}) => {
  const csrfToken = getCsrfToken();
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  const defaultOptions = {
    credentials: 'include',
    headers,
    mode: 'cors',
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
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
        window.location.href = '/';
        return;
      }
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
