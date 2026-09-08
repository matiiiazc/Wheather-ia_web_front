import { apiFetch } from './api';
import { getToken } from './session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
const EXTENSIONES_PREVISUALIZABLES = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];

function conToken(url: string): string {
  const token = getToken();
  if (!token || url.includes('?')) return url;
  return `${url}?token=${encodeURIComponent(token)}`;
}

/**
 * Los campos de archivo en la base vienen de un Excel donde a veces
 * solo hay un nombre de archivo suelto (ej. "CV_Juan.pdf") y no un
 * archivo real. Cuando parece un archivo, lo resolvemos siempre contra
 * el backend para evitar que el preview cargue la app de React.
 *
 * Las URLs locales se firman con ?token= porque /uploads ya no es público.
 */
export function urlDeArchivo(valor: string | null | undefined): string | null {
  const limpio = valor?.trim();
  if (!limpio) return null;

  if (limpio.startsWith('http://') || limpio.startsWith('https://')) return limpio;

  const normalizado = limpio.replace(/\\/g, '/').replace(/^\.?\//, '');

  if (normalizado.startsWith('api/uploads/')) {
    return conToken(`${API_ORIGIN}/${normalizado}`);
  }

  if (normalizado.startsWith('uploads/')) {
    return conToken(`${API_ORIGIN}/api/${normalizado}`);
  }

  const nombreArchivo = normalizado.split('/').pop() || '';
  const extension = nombreArchivo.split('.').pop()?.toLowerCase();
  if (extension && EXTENSIONES_PREVISUALIZABLES.includes(extension)) {
    return conToken(`${API_ORIGIN}/api/uploads/${encodeURIComponent(nombreArchivo)}`);
  }

  return null;
}

export function nombreDeArchivo(valor: string | null | undefined): string | undefined {
  return valor?.trim().replace(/\\/g, '/').split('/').pop() || undefined;
}

function leerComoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Sube un archivo (PDF/imagen) al backend y devuelve la URL
 * (ej. /api/uploads/xxxx.pdf) para guardarla en el campo correspondiente.
 */
export async function subirArchivo(file: File): Promise<string> {
  const fileBase64 = await leerComoBase64(file);
  const data = await apiFetch('/uploads', {
    method: 'POST',
    body: JSON.stringify({ fileBase64, filename: file.name }),
  });
  return data.url as string;
}