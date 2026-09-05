export interface UsuarioLogueado {
  id: string;
  nombre: string;
  rol: string;
  mustChangePassword?: boolean;
}

const STORAGE_KEY = 'nexo_rrhh_usuario';

// El token vive SOLO en memoria (en la cookie HttpOnly es donde se guarda la
// sesión real). No se persiste en localStorage: así un XSS no puede robarlo.
let tokenMemoria: string | null = null;

export function setToken(token: string | null): void {
  tokenMemoria = token;
}

export function getToken(): string | null {
  return tokenMemoria;
}

export function guardarSesion(token: string, user: UsuarioLogueado): void {
  tokenMemoria = token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function actualizarUsuario(user: UsuarioLogueado): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function leerUsuario(): UsuarioLogueado | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    limpiarSesion();
    return null;
  }
}

export function limpiarSesion(): void {
  tokenMemoria = null;
  localStorage.removeItem(STORAGE_KEY);
}