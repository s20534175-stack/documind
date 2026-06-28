const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function upload(path, formData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  getWorkspaces: () => request('/api/workspaces'),
  createWorkspace: (name) => request('/api/workspaces', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteWorkspace: (id) => request(`/api/workspaces/${id}`, { method: 'DELETE' }),
  getDashboard: (workspaceId) => request(`/api/workspaces/${workspaceId}/dashboard`),
  getDocuments: (workspaceId) => request(`/api/workspaces/${workspaceId}/documents`),
  uploadDocument: (workspaceId, file) => { const form = new FormData(); form.append('file', file); return upload(`/api/workspaces/${workspaceId}/documents/upload`, form); },
  deleteDocument: (workspaceId, documentId) => request(`/api/workspaces/${workspaceId}/documents/${documentId}`, { method: 'DELETE' }),
  chat: (workspaceId, message) => request(`/api/workspaces/${workspaceId}/chat`, { method: 'POST', body: JSON.stringify({ message }) }),
  getChatHistory: (workspaceId) => request(`/api/workspaces/${workspaceId}/chat/history`),
};