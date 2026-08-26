import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';
import FileField from './FileField';
import PageToolbar from './PageToolbar';
import FilterBar from './FilterBar';
import InlineStatusSelect from './InlineStatusSelect';
import DocumentLink from './DocumentLink';
import { useToast } from './Toast';

const STAGES_OPTIONS = [
  'Invite candidate to Interview',
  'Candidate review',
  'Tech Interview scheduled',
  'Tech interview failed',
  'Waiting to send coding test',
  'Coding test sent',
  'Coding test approved',
  'Coding test FAIL',
  'On hold',
  'Hired',
  'Rejected',
  'Withdrew',
];

interface Candidato {
  id: string;
  name: string;
  source: string | null;
  linkedin: string | null;
  profileVerified: string | null;
  resume: string | null;
  education: string | null;
  country: string | null;
  continente: string | null;
  salary: number | null;
  notes: string | null;
  stages: string | null;
  sendTest: string | null;
  results: string | null;
  clientFeedback: string | null;
  hiringManager: string | null;
  fechaContratacion: string | null;
  mail: string | null;
  emailSent: string | null;
}

const TODAS_LAS_COLUMNAS: { key: keyof Candidato; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'source', label: 'Source' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'profileVerified', label: 'Profile Verified' },
  { key: 'resume', label: 'Resume' },
  { key: 'education', label: 'Education' },
  { key: 'country', label: 'Country' },
  { key: 'continente', label: 'Continente' },
  { key: 'salary', label: 'Salary' },
  { key: 'notes', label: 'Notes' },
  { key: 'stages', label: 'Stages' },
  { key: 'sendTest', label: 'Send Test' },
  { key: 'results', label: 'Results' },
  { key: 'clientFeedback', label: 'Client Feedback' },
  { key: 'hiringManager', label: 'Hiring Manager' },
  { key: 'fechaContratacion', label: 'Fecha de contratacion' },
  { key: 'mail', label: 'Mail' },
  { key: 'emailSent', label: 'Email Sent' },
];

const CAMPOS_GENERALES: { key: keyof Candidato; label: string }[] = [
  { key: 'source', label: 'Source' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'profileVerified', label: 'Profile Verified' },
  { key: 'education', label: 'Education' },
  { key: 'country', label: 'Country' },
  { key: 'continente', label: 'Continente' },
];

const CAMPOS_PROCESO: { key: keyof Candidato; label: string }[] = [
  { key: 'stages', label: 'Stages' },
  { key: 'sendTest', label: 'Send Test' },
  { key: 'results', label: 'Results' },
  { key: 'hiringManager', label: 'Hiring Manager' },
  { key: 'mail', label: 'Mail' },
  { key: 'emailSent', label: 'Email Sent' },
];

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400';

const candidatoVacio: Candidato = {
  id: '', name: '', source: null, linkedin: null, profileVerified: null, resume: null,
  education: null, country: null, continente: null, salary: null, notes: null,
  stages: null, sendTest: null, results: null, clientFeedback: null, hiringManager: null,
  fechaContratacion: null, mail: null, emailSent: null,
};

export default function CandidatesPage() {
  const { toast } = useToast();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStage, setFilterStage] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editando, setEditando] = useState<Candidato | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [verificandoLinkedIn, setVerificandoLinkedIn] = useState<string | null>(null);

  const hasActiveFilters = !!filterStage || !!filterDateFrom || !!filterDateTo;

  const candidatosFiltrados = useMemo(() => candidatos.filter((c) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const matchText = TODAS_LAS_COLUMNAS.some(({ key }) =>
        String(c[key] ?? '').toLowerCase().includes(texto)
      );
      if (!matchText) return false;
    }
    if (filterStage && c.stages !== filterStage) return false;
    if (filterDateFrom || filterDateTo) {
      const d = c.fechaContratacion ? c.fechaContratacion.slice(0, 10) : null;
      if (!d) return false;
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo && d > filterDateTo) return false;
    }
    return true;
  }), [candidatos, busqueda, filterStage, filterDateFrom, filterDateTo]);

  async function cargar() {
    setCargando(true);
    const data = await apiFetch('/candidates');
    setCandidatos(data);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setEditando({ ...candidatoVacio });
    setCreandoNuevo(true);
  }

  function abrirEditar(c: Candidato) {
    setEditando(c);
    setCreandoNuevo(false);
  }

  async function handleGuardar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setGuardando(true);
    try {
      if (creandoNuevo) {
        await apiFetch('/candidates', {
          method: 'POST',
          body: JSON.stringify(editando),
        });
        toast('Candidate created successfully');
      } else {
        await apiFetch(`/candidates/${editando.id}`, {
          method: 'PUT',
          body: JSON.stringify(editando),
        });
        toast('Candidate updated successfully');
      }
      setEditando(null);
      await cargar();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error saving candidate', 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function verificarLinkedIn(candidatoId: string, linkedinUrl: string) {
    if (!linkedinUrl) return;
    setVerificandoLinkedIn(candidatoId);
    try {
      const result = await apiFetch(`/candidates/${candidatoId}/verify-linkedin`, {
        method: 'POST',
        body: JSON.stringify({ linkedinUrl }),
      });
      setCandidatos(prev => prev.map(c => 
        c.id === candidatoId ? { ...c, profileVerified: result.verified ? 'Yes' : 'No' } : c
      ));
      toast(result.verified ? 'LinkedIn verified' : 'LinkedIn not verified', result.verified ? 'success' : 'warning');
    } catch (error) {
      console.error('Error verificando LinkedIn:', error);
      toast('Error verifying LinkedIn', 'error');
    } finally {
      setVerificandoLinkedIn(null);
    }
  }

  async function handleStageChange(candidatoId: string, newStage: string) {
    try {
      await apiFetch(`/candidates/${candidatoId}`, {
        method: 'PUT',
        body: JSON.stringify({ stages: newStage }),
      });
      setCandidatos(prev => prev.map(c => c.id === candidatoId ? { ...c, stages: newStage } : c));
      toast('Stage updated');
    } catch {
      toast('Error updating stage', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Candidatos</h1>

      <PageToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        primaryLabel="Add candidate"
        onPrimaryClick={abrirNuevo}
        onFilterClick={() => setFilterOpen((v) => !v)}
        filterOpen={filterOpen}
        onEditModeClick={() => setEditMode((v) => !v)}
        editModeActive={editMode}
      />

      <FilterBar
        open={filterOpen}
        statusOptions={STAGES_OPTIONS}
        statusValue={filterStage}
        onStatusChange={setFilterStage}
        statusLabel="Stage"
        dateFromValue={filterDateFrom}
        dateToValue={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        dateLabel="Fecha contratación"
        hasActiveFilters={hasActiveFilters}
        onClear={() => { setFilterStage(''); setFilterDateFrom(''); setFilterDateTo(''); }}
      />

      {cargando ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="max-h-[65vh] scroll-smooth overflow-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="sticky top-0 bg-stone-50 dark:bg-zinc-900">
              <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">

                {editMode && <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Acción</th>}
                {TODAS_LAS_COLUMNAS.map(({ key, label }) => (
                  <th key={key} className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>
                ))}              </tr>
            </thead>
            <tbody>
              {candidatosFiltrados.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 last:border-0 transition-colors duration-100 hover:bg-stone-100/80 dark:border-zinc-800 dark:hover:bg-white/[0.07]">

                  {editMode && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-teal-400"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                  {TODAS_LAS_COLUMNAS.map(({ key }) => {
                    const valor = c[key];
                    if (key === 'stages') {
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3">
                          <InlineStatusSelect
                            value={valor as string}
                            options={STAGES_OPTIONS}
                            onChange={(newStage) => handleStageChange(c.id, newStage)}
                          />
                        </td>
                      );
                    }
                    if (key === 'fechaContratacion') {
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
                          {valor ? String(valor).slice(0, 10) : '—'}
                        </td>
                      );
                    }
                    if (key === 'linkedin') {
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3">
                          {valor ? (
                            <a href={String(valor)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                              Ver perfil
                            </a>
                          ) : '—'}
                        </td>
                      );
                    }
                    if (key === 'resume') {
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3">
                          <DocumentLink url={valor as string} />
                        </td>
                      );
                    }
                    if (key === 'profileVerified') {
                      const isVerifying = verificandoLinkedIn === c.id;
                      const isVerified = valor === 'Yes' || valor === 'yes';
                      const isFailed = valor === 'No' || valor === 'no';
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isVerified && (
                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <Check size={14} /> Verified
                              </span>
                            )}
                            {isFailed && (
                              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <X size={14} /> Not verified
                              </span>
                            )}
                            {!isVerified && !isFailed && !isVerifying && '—'}
                            {c.linkedin && (
                              <button
                                onClick={() => verificarLinkedIn(c.id, c.linkedin!)}
                                disabled={isVerifying}
                                className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-stone-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                title="Verify LinkedIn profile"
                              >
                                {isVerifying ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  'Verify'
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={key} className="max-w-[220px] truncate px-4 py-3 text-zinc-400 dark:text-zinc-500" title={valor ? String(valor) : ''}>
                        {valor || valor === 0 ? String(valor) : '—'}
                      </td>
                    );
                  })}                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {editando && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-content max-h-[85vh] w-full max-w-2xl scroll-smooth overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {creandoNuevo ? 'New candidate' : `Editar: ${editando.name}`}
            </h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Nombre completo</label>
                <input
                  type="text"
                  value={editando.name}
                  onChange={(e) => setEditando({ ...editando, name: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">General Info</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CAMPOS_GENERALES.map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <input
                        type="text"
                        value={(editando[key] as string) ?? ''}
                        onChange={(e) => setEditando({ ...editando, [key]: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  ))}
                  <div>
                    <label className={labelClass}>Salary</label>
                    <input
                      type="number"
                      value={editando.salary ?? ''}
                      onChange={(e) => setEditando({ ...editando, salary: e.target.value ? Number(e.target.value) : null })}
                      className={inputClass}
                    />
                  </div>
                  <FileField
                    label="Resume (CV)"
                    value={editando.resume ?? ''}
                    onChange={(url) => setEditando({ ...editando, resume: url })}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Selection Process</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CAMPOS_PROCESO.map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <input
                        type="text"
                        value={(editando[key] as string) ?? ''}
                        onChange={(e) => setEditando({ ...editando, [key]: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  ))}
                  <div>
                    <label className={labelClass}>Fecha de contratación</label>
                    <input
                      type="date"
                      value={editando.fechaContratacion?.slice(0, 10) ?? ''}
                      onChange={(e) => setEditando({ ...editando, fechaContratacion: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Client Feedback</label>
                <textarea
                  value={editando.clientFeedback ?? ''}
                  onChange={(e) => setEditando({ ...editando, clientFeedback: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  value={editando.notes ?? ''}
                  onChange={(e) => setEditando({ ...editando, notes: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-200 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 disabled:opacity-60"
                >
                  {guardando ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}