import { useState, useEffect, type FormEvent } from 'react';
import { apiFetch } from '../utils/api';
import PageToolbar from './PageToolbar';
import FilterBar from './FilterBar';

const HIRING_MANAGER_OPTIONS = ['PABLO', 'JOSE'];

interface Candidato {
  id: string;
  name: string;
}

interface Test {
  id: string;
  candidateId: string | null;
  candidate: Candidato | null;
  nombre: string;
  codingTest: string | null;
  score: string | null;
  hiringManager: string | null;
  interviewIgal: string | null;
  igalFeedback: string | null;
  recommendation: string | null;
}

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400';

const testVacio = {
  nombre: '',
  codingTest: '',
  score: '',
  hiringManager: '',
  interviewIgal: '',
  igalFeedback: '',
  recommendation: '',
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterManager, setFilterManager] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevo, setNuevo] = useState(testVacio);
  const [guardando, setGuardando] = useState(false);

  const [editando, setEditando] = useState<Test | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const hasActiveFilters = !!filterManager;

  const testsFiltrados = tests.filter((t) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const valores = [t.nombre, t.codingTest, t.score, t.hiringManager, t.interviewIgal, t.igalFeedback, t.recommendation];
      if (!valores.some((v) => v && String(v).toLowerCase().includes(texto))) return false;
    }
    if (filterManager && t.hiringManager !== filterManager) return false;
    return true;
  });

  async function cargar() {
    setCargando(true);
    const data = await apiFetch('/tests');
    setTests(data);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirModal() {
    setNuevo(testVacio);
    setModalAbierto(true);
  }

  async function handleGuardar(e: FormEvent) {
    e.preventDefault();
    if (!nuevo.nombre) return;
    setGuardando(true);
    try {
      await apiFetch('/tests', { method: 'POST', body: JSON.stringify(nuevo) });
      setModalAbierto(false);
      await cargar();
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setGuardandoEdicion(true);
    try {
      await apiFetch(`/tests/${editando.id}`, { method: 'PUT', body: JSON.stringify(editando) });
      setEditando(null);
      await cargar();
    } finally {
      setGuardandoEdicion(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">TESTs</h1>

      <PageToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        primaryLabel="Add test"
        onPrimaryClick={abrirModal}
        onFilterClick={() => setFilterOpen((v) => !v)}
        filterOpen={filterOpen}
        onEditModeClick={() => setEditMode((v) => !v)}
        editModeActive={editMode}
      />

      <FilterBar
        open={filterOpen}
        statusOptions={HIRING_MANAGER_OPTIONS}
        statusValue={filterManager}
        onStatusChange={setFilterManager}
        statusLabel="Hiring Manager"
        hasActiveFilters={hasActiveFilters}
        onClear={() => setFilterManager('')}
      />

      {cargando ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="max-h-[65vh] overflow-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="sticky top-0 bg-stone-50 dark:bg-zinc-900">
              <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                {editMode && <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Action</th>}
                <th className="whitespace-nowrap px-4 py-3 font-medium">Name</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Coding Test</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Score</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Hiring Manager</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Interview Igal</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Igal Feedback</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {testsFiltrados.map((t) => (
                <tr key={t.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-100/60 dark:border-zinc-800 dark:hover:bg-white/5">
                  {editMode && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button onClick={() => setEditando(t)} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-teal-400">
                        Editar
                      </button>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-800 dark:text-zinc-100">{t.nombre}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{t.codingTest || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{t.score || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{t.hiringManager || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{t.interviewIgal || '—'}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-400 dark:text-zinc-500" title={t.igalFeedback ?? ''}>{t.igalFeedback || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{t.recommendation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">New test</h2>
            <form onSubmit={handleGuardar} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Coding Test</label>
                <input type="text" value={nuevo.codingTest} onChange={(e) => setNuevo({ ...nuevo, codingTest: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Score</label>
                <input type="text" value={nuevo.score} onChange={(e) => setNuevo({ ...nuevo, score: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hiring Manager</label>
                <input type="text" value={nuevo.hiringManager} onChange={(e) => setNuevo({ ...nuevo, hiringManager: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Interview Igal</label>
                <input type="text" value={nuevo.interviewIgal} onChange={(e) => setNuevo({ ...nuevo, interviewIgal: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Igal Feedback</label>
                <textarea value={nuevo.igalFeedback} onChange={(e) => setNuevo({ ...nuevo, igalFeedback: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Recommendation</label>
                <input type="text" value={nuevo.recommendation} onChange={(e) => setNuevo({ ...nuevo, recommendation: e.target.value })} className={inputClass} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={guardando} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 disabled:opacity-60">
                  {guardando ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{editando.nombre}</h2>
            <form onSubmit={handleGuardarEdicion} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Coding Test</label>
                <input type="text" value={editando.codingTest ?? ''} onChange={(e) => setEditando({ ...editando, codingTest: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Score</label>
                <input type="text" value={editando.score ?? ''} onChange={(e) => setEditando({ ...editando, score: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hiring Manager</label>
                <input type="text" value={editando.hiringManager ?? ''} onChange={(e) => setEditando({ ...editando, hiringManager: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Interview Igal</label>
                <input type="text" value={editando.interviewIgal ?? ''} onChange={(e) => setEditando({ ...editando, interviewIgal: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Igal Feedback</label>
                <textarea value={editando.igalFeedback ?? ''} onChange={(e) => setEditando({ ...editando, igalFeedback: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Recommendation</label>
                <input type="text" value={editando.recommendation ?? ''} onChange={(e) => setEditando({ ...editando, recommendation: e.target.value })} className={inputClass} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditando(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={guardandoEdicion} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 disabled:opacity-60">
                  {guardandoEdicion ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}