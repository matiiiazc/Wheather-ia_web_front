export interface UsuarioLogueado {
  id: string;
  nombre: string;
  rol: 'admin' | 'rrhh' | 'empleado';
}

interface SesionGuardada {
  token: string;
  user: UsuarioLogueado;
  expiraEn: number; // timestamp en milisegundos
}

const STORAGE_KEY = 'nexo_rrhh_sesion';
const DURACION_MS = 12 * 60 * 60 * 1000; // 12 horas

/**
 * Guarda la sesión en localStorage junto con el momento en que
 * debe considerarse vencida (ahora + 12h), independientemente
 * de si el navegador se cierra o no en el medio.
 */
export function guardarSesion(token: string, user: UsuarioLogueado): void {
  const sesion: SesionGuardada = {
    token,
    user,
    expiraEn: Date.now() + DURACION_MS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
}

/**
 * Lee la sesión guardada. Si no existe, está corrupta, o ya pasó
 * la fecha de expiración, la borra y devuelve null.
 */
export function leerSesion(): { token: string; user: UsuarioLogueado } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const sesion: SesionGuardada = JSON.parse(raw);

    if (Date.now() > sesion.expiraEn) {
      limpiarSesion();
      return null;
    }

    return { token: sesion.token, user: sesion.user };
  } catch {
    limpiarSesion();
    return null;
  }
}

export function limpiarSesion(): void {
  localStorage.removeItem(STORAGE_KEY);
}
