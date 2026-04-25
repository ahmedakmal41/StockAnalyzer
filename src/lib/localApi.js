const TOKEN_KEY = 'psx_atlas_token';

export const getToken = () => window.localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};
