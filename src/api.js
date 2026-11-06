const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res.json();
}

export const api = {
  getState: () => request('/state'),
  putState: (data) => request('/state', { method: 'PUT', body: data }),
  patchDevice: (id, changes) => request(`/devices/${id}`, { method: 'PATCH', body: changes }),
  addDevice: (device) => request('/devices', { method: 'POST', body: device }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
  addGroup: (group) => request('/groups', { method: 'POST', body: group }),
  patchGroup: (id, changes) => request(`/groups/${id}`, { method: 'PATCH', body: changes }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
};
