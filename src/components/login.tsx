import { useState, type FormEvent } from 'react';
import type { UsuarioLogueado } from '../utils/session';

interface LoginResponse {
  token: string;
  user: UsuarioLogueado;
}

interface LoginProps {
  onLoginSuccess: (data: LoginResponse) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Email o contraseña incorrectos');
      }

      const data: LoginResponse = await response.json();
      onLoginSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-1/3 flex-col items-center justify-center bg-zinc-900 md:flex dark:bg-zinc-950">
        <img src="/logo_full_watar-ai.png" alt="Watar-ai" className="mb-4 h-16 w-auto object-contain" />
        <p className="text-2xl font-semibold text-white">Nexo RRHH</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Internal console
        </p>
      </div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center bg-stone-100 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Mobile logo */}
          <div className="mb-6 text-center md:hidden">
            <img src="/logo_full_watar-ai.png" alt="Watar-ai" className="mx-auto mb-3 h-12 w-auto object-contain" />
          </div>

          <div className="mb-6 text-center">
            <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-white">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Ingresá con tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nombre@empresa.com"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-zinc-500 dark:text-zinc-400"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
