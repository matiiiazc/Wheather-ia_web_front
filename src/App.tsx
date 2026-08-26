import { useState, useEffect } from 'react';
import {
  Users,
  Wallet,
  CalendarOff,
  FileText,
  ClipboardCheck,
  UserCheck,
  UserX,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import Login from './components/login';
import ContractorsPage from './components/ContractorsPage';
import PaymentsPage from './components/PaymentsPage';
import AbsencePage from './components/AbsencePage';
import CandidatesPage from './components/CandidatesPage';
import TestsPage from './components/TestsPage';
import HiredPage from './components/HiredPage';
import OffboardedPage from './components/OffboardedPage';
import { guardarSesion, leerSesion, limpiarSesion } from './utils/session';
import type { UsuarioLogueado } from './utils/session';

type Vista = 'contractors' | 'payments' | 'absences' | 'candidates' | 'tests' | 'hired' | 'offboarded';

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('tema') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('tema', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

function App() {
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<Vista>('contractors');
  const { dark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    const sesion = leerSesion();
    if (sesion) {
      setUsuario(sesion.user);
    }
    setCargando(false);
  }, []);

  const handleLoginSuccess = (data: { token: string; user: UsuarioLogueado }) => {
    guardarSesion(data.token, data.user);
    setUsuario(data.user);
  };

  const handleLogout = () => {
    limpiarSesion();
    setUsuario(null);
  };

  if (cargando) return null;

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const iniciales = usuario.nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const itemsNav: { key: Vista; label: string; icon: typeof Users }[] = [
    { key: 'contractors', label: 'Contractors', icon: Users },
    { key: 'payments', label: 'Payments', icon: Wallet },
    { key: 'absences', label: 'Absences', icon: CalendarOff },
    { key: 'candidates', label: 'Candidates', icon: FileText },
    { key: 'tests', label: 'Tests', icon: ClipboardCheck },
    { key: 'hired', label: 'Hired', icon: UserCheck },
    { key: 'offboarded', label: 'Offboarded', icon: UserX },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-stone-100 p-3 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col rounded-2xl border border-stone-200 bg-stone-50 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between px-5 pb-6">
          {/* Logo - Replace '/logo.png' with your actual logo file path */}
          <img 
            src="/logo_full_watar-ai.png" 
            alt="Watar-ai" 
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={toggleDark}
            title={dark ? 'Light mode' : 'Dark mode'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {itemsNav.map((item) => {
            const Icon = item.icon;
            const activo = vista === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setVista(item.key)}
                className={`flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                  activo
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-teal-500 dark:text-zinc-950'
                    : 'text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100'
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-3">
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-teal-500 dark:text-zinc-950">
              {iniciales}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{usuario.nombre}</p>
              <p className="text-xs capitalize text-zinc-400 dark:text-zinc-500">{usuario.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <LogOut size={13} />
            Log out
          </button>
        </div>
      </aside> 

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto pl-3">
        {vista === 'contractors' && <ContractorsPage />}
        {vista === 'payments' && <PaymentsPage />}
        {vista === 'absences' && <AbsencePage />}
        {vista === 'candidates' && <CandidatesPage />}
        {vista === 'tests' && <TestsPage />}
        {vista === 'hired' && <HiredPage />}
        {vista === 'offboarded' && <OffboardedPage />}
      </main>
    </div>
  );
}

export default App;