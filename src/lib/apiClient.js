/**
 * src/lib/apiClient.js
 *
 * WHY THIS FILE EXISTS:
 * This is a lightweight wrapper around the native `fetch` API. It handles:
 * 1. Prepending the `BASE_URL` so we don't repeat the backend URL everywhere.
 * 2. Automatically attaching the `Authorization: Bearer <token>` header from localStorage.
 * 3. Standard JSON parsing and error handling.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nestroom-hostels-backend.vercel.app/api';

/**
 * CORE FETCH WRAPPER
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('nestroom_jwt');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // If token is expired or invalid, we might want to logout automatically
    if (response.status === 401) {
      console.warn('⚠️ Session expired. Logging out.');
      localStorage.removeItem('nestroom_jwt');
      // window.location.href = '/login'; // Optional: Redirect to login
    }
    
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const apiClient = {
  get: (url, opts) => apiRequest(url, { ...opts, method: 'GET' }),
  post: (url, body, opts) => apiRequest(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, opts) => apiRequest(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: (url, opts) => apiRequest(url, { ...opts, method: 'DELETE' }),
};

export default apiClient;
