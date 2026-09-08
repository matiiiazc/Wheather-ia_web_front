import { getToken, limpiarSesion } from './session';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Wrapper de fetch que envía las credenciales (cookie HttpOnly) y agrega el
 * header Authorization con el token en memoria cuando está disponible. Si el
 * backend responde 401, limpia la sesión local — el próximo render de App.tsx
 * va a mandar de vuelta al login.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    limpiarSesion();
    window.location.reload(); // fuerza volver a mostrar el login
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Request error');
  }

  return response.json();
}

/**
 * Igual que apiFetch, pero sin forzar el header Content-Type: application/json
 * — necesario para subir archivos con FormData, donde el navegador debe
 * poner su propio Content-Type con el "boundary" del multipart.
 */
export async function apiFetchRaw(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    limpiarSesion();
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Request error');
  }

  return response.json();
}