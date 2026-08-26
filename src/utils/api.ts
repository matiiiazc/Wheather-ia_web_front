import { leerSesion, limpiarSesion } from './session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Wrapper de fetch que agrega el header Authorization con el token
 * guardado, para no repetirlo a mano en cada llamada. Si el backend
 * responde 401 (token vencido/inválido), limpia la sesión local —
 * el próximo render de App.tsx va a mandar de vuelta al login.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const sesion = leerSesion();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    limpiarSesion();
    window.location.reload(); // fuerza volver a mostrar el login
    throw new Error('Sesión vencida');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error en la petición');
  }

  return response.json();
}

/**
 * Igual que apiFetch, pero sin forzar el header Content-Type: application/json
 * — necesario para subir archivos con FormData, donde el navegador debe
 * poner su propio Content-Type con el "boundary" del multipart.
 */
export async function apiFetchRaw(path: string, options: RequestInit = {}) {
  const sesion = leerSesion();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    limpiarSesion();
    window.location.reload();
    throw new Error('Sesión vencida');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error en la petición');
  }

  return response.json();
}
