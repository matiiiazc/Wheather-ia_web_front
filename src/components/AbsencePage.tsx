import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { apiFetch } from '../utils/api';
import PageToolbar from './PageToolbar';
import FilterBar from './FilterBar';
import { useToast } from './Toast';

interface Contractor {
  id: string;
  nombreCompleto: string;
}

interface Ausencia {
  id: string;
  contractorId: string;
  contractor: Contractor;
  contractorName: string;
  startDate: string;
  endDate: string;
  reason: string;
  daysAbsent: number;
  monthlySalary: number;
  feeAdjustment: number;
  netPayment: number;
  notesComments: string | null;
}

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400';

const ausenciaVacia = {
  contractorId: '',
  contractorName: '',
  startDate: '',
  endDate: '',
  reason: '',
  daysAbsent: '',
  monthlySalary: '',
  feeAdjustment: '',
  netPayment: '',
  notesComments: '',
};

export default function AbsencePage() {
  const { toast } = useToast();
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const hasActiveFilters = !!filterDateFrom || !!filterDateTo;

  const ausenciasFiltradas = useMemo(() => ausencias.filter((a) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const valores = [a.contractor?.nombreCompleto, a.contractorName, a.reason, a.notesComments];
      if (!valores.some((v) => v && String(v).toLowerCase().includes(texto))) return false;
    }
    if (filterDateFrom || filterDateTo) {
      const d = a.startDate ? a.startDate.slice(0, 10) : null;
      if (!d) return false;
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo && d > filterDateTo) return false;
    }
    return true;
  }), [ausencias, busqueda, filterDateFrom, filterDateTo]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevo, setNuevo] = useState(ausenciaVacia);
  const [guardando, setGuardando] = useState(false);

  const [editando, setEditando] = useState<Ausencia | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    const [ausenciasData, contractorsData] = await Promise.all([
      apiFetch('/absences'),
      apiFetch('/contractors'),
    ]);
    setAusencias(ausenciasData);
    setContractors(contractorsData);
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  function abrirModal() {
    setNuevo(ausenciaVacia);
    setModalAbierto(true);
  }

  async function handleGuardar(e: FormEvent) {
    e.preventDefault();
    if (!nuevo.contractorId || !nuevo.startDate || !nuevo.endDate) return;
    setGuardando(true);
    try {
      await apiFetch('/absences', {
        method: 'POST',
        body: JSON.stringify(nuevo),
      });
      setModalAbierto(false);
      toast('Absence created successfully');
      await cargarTodo();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error creating absence', 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setGuardandoEdicion(true);
    try {
      await apiFetch(`/absences/${editando.id}`, {
        method: 'PUT',
        body: JSON.stringify(editando),
      });
      setEditando(null);
      toast('Absence updated successfully');
      await cargarTodo();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error updating absence', 'error');
    } finally {
      setGuardandoEdicion(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Absence &amp; Fee Tracker</h1>

      <PageToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        primaryLabel="Add"
        onPrimaryClick={abrirModal}
        onFilterClick={() => setFilterOpen((v) => !v)}
        filterOpen={filterOpen}
        onEditModeClick={() => setEditMode((v) => !v)}
        editModeActive={editMode}
      />

      <FilterBar
        open={filterOpen}
        dateFromValue={filterDateFrom}
        dateToValue={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        dateLabel="Start Date"
        hasActiveFilters={hasActiveFilters}
        onClear={() => { setFilterDateFrom(''); setFilterDateTo(''); }}
      />

      {cargando ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="max-h-[65vh] scroll-smooth overflow-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="sticky top-0 bg-stone-50 dark:bg-zinc-900">
              <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">

                {editMode && <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Action</th>}
                <th className="whitespace-nowrap px-4 py-3 font-medium">Contractor Name</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Start Date</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">End Date</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Reason</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Days Absent</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Monthly Salary</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Fee Adjustment</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Net Payment</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Notes / Comments</th>              </tr>
            </thead>
            <tbody>
              {ausenciasFiltradas.map((a) => (
                <tr key={a.id} className="border-b border-stone-100 last:border-0 transition-colors duration-100 hover:bg-stone-100/80 dark:border-zinc-800 dark:hover:bg-white/[0.07]">

                  {editMode && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => setEditando(a)}
                        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-teal-400"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-800 dark:text-zinc-100">
                    {a.contractor?.nombreCompleto || a.contractorName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{a.startDate?.slice(0, 10)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{a.endDate?.slice(0, 10)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{a.reason || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{a.daysAbsent}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">${a.monthlySalary}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">${a.feeAdjustment}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">${a.netPayment}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-400 dark:text-zinc-500" title={a.notesComments ?? ''}>
                    {a.notesComments || '—'}
                  </td>                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-content max-h-[85vh] w-full max-w-md scroll-smooth overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">New absence</h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Contractor</label>
                <select
                  value={nuevo.contractorId}
                  onChange={(e) => {
                    const c = contractors.find((x) => x.id === e.target.value);
                    setNuevo({ ...nuevo, contractorId: e.target.value, contractorName: c?.nombreCompleto || '' });
                  }}
                  required
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombreCompleto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={nuevo.startDate} onChange={(e) => setNuevo({ ...nuevo, startDate: e.target.value })} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={nuevo.endDate} onChange={(e) => setNuevo({ ...nuevo, endDate: e.target.value })} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Reason</label>
                <input type="text" value={nuevo.reason} onChange={(e) => setNuevo({ ...nuevo, reason: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Days Absent</label>
                <input type="number" value={nuevo.daysAbsent} onChange={(e) => setNuevo({ ...nuevo, daysAbsent: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Monthly Salary</label>
                <input type="number" value={nuevo.monthlySalary} onChange={(e) => setNuevo({ ...nuevo, monthlySalary: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Fee Adjustment</label>
                <input type="number" value={nuevo.feeAdjustment} onChange={(e) => setNuevo({ ...nuevo, feeAdjustment: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Net Payment</label>
                <input type="number" value={nuevo.netPayment} onChange={(e) => setNuevo({ ...nuevo, netPayment: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Notes / Comments</label>
                <textarea value={nuevo.notesComments} onChange={(e) => setNuevo({ ...nuevo, notesComments: e.target.value })} rows={2} className={inputClass} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 disabled:opacity-60">
                  {guardando ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editando && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-content max-h-[85vh] w-full max-w-md scroll-smooth overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {editando.contractor?.nombreCompleto || editando.contractorName}
            </h2>

            <form onSubmit={handleGuardarEdicion} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={editando.startDate?.slice(0, 10)} onChange={(e) => setEditando({ ...editando, startDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={editando.endDate?.slice(0, 10)} onChange={(e) => setEditando({ ...editando, endDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reason</label>
                <input type="text" value={editando.reason ?? ''} onChange={(e) => setEditando({ ...editando, reason: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Days Absent</label>
                <input type="number" value={editando.daysAbsent} onChange={(e) => setEditando({ ...editando, daysAbsent: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Monthly Salary</label>
                <input type="number" value={editando.monthlySalary} onChange={(e) => setEditando({ ...editando, monthlySalary: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fee Adjustment</label>
                <input type="number" value={editando.feeAdjustment} onChange={(e) => setEditando({ ...editando, feeAdjustment: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Net Payment</label>
                <input type="number" value={editando.netPayment} onChange={(e) => setEditando({ ...editando, netPayment: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Notes / Comments</label>
                <textarea value={editando.notesComments ?? ''} onChange={(e) => setEditando({ ...editando, notesComments: e.target.value })} rows={2} className={inputClass} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditando(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5">
                  Cancelar
                </button>
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