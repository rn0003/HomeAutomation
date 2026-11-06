const BASE = '/api';

let token = null;
let onAuthError = null;

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (res.status === 401 && onAuthError) {
    onAuthError();
    throw new Error('Session expired');
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  setToken: (t) => { token = t; },
  onAuthError: (fn) => { onAuthError = fn; },

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password } }),

  getState: () => request('/state'),
  putState: (data) => request('/state', { method: 'PUT', body: data }),
  patchDevice: (id, changes) => request(`/devices/${id}`, { method: 'PATCH', body: changes }),
  addDevice: (device) => request('/devices', { method: 'POST', body: device }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
  addGroup: (group) => request('/groups', { method: 'POST', body: group }),
  patchGroup: (id, changes) => request(`/groups/${id}`, { method: 'PATCH', body: changes }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
};
