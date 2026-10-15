const TOKEN_KEY = 'mm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

async function request(path, { method = 'GET', body, form, raw } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401 && token) {
    setToken(null);
    onUnauthorized();
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data.detail === 'string') message = data.detail;
      else if (Array.isArray(data.detail)) message = data.detail.map((d) => d.msg).join(', ');
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
  return raw ? res : res.json();
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  me: () => request('/auth/me'),

  search: (query, filters) => request('/search', { method: 'POST', body: { query, filters } }),
  searchWeb: (query) => request('/search/web', { method: 'POST', body: { query } }),
  facets: () => request('/facets'),
  history: () => request('/searches'),
  clearHistory: () => request('/searches', { method: 'DELETE' }),

  documents: (params = {}) => request(`/documents?${new URLSearchParams(params)}`),
  document: (id) => request(`/documents/${id}`),
  passage: (id, start, end) => request(`/documents/${id}/passage?start=${start}&end=${end}`),
  upload: (formData) => request('/documents', { method: 'POST', form: formData }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

  async openOriginal(id) {
    const res = await request(`/documents/${id}/file`, { raw: true });
    const url = URL.createObjectURL(await res.blob());
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};

export const CONTENT_TYPE_LABELS = {
  article: 'Article',
  interview: 'Interview',
  footage_notes: 'Footage notes',
  document: 'Document',
  web: 'Web',
};

export function formatDate(iso) {
  if (!iso) return 'Undated';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
