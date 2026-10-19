const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('token');

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      //Only attach the Authorization header if we actually have a token
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    //fetch() needs the request body as a JSON string, not a plain object
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
// the backend always responds with JSON even for errors,so we can parser it up front and use it eitherway//

  const data = await response.json().catch(() => ({}));

  if(!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');

  }
  return data;
}