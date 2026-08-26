import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { apiFetch } from '../utils/api';
import PageToolbar from './PageToolbar';
import FilterBar from './FilterBar';
import { useToast } from './Toast';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'ARS', 'GBP', 'BRL'];

interface Contractor {
  id: string;
  nombreCompleto: string;
  email: string;
  cuil: string;
  nTelefono: string;
  domicilioDni: string;
  domicilioReal: string;
  salarioMensualUsd: number;
  beneficiaryName: string;
  bankName: string;
  bankAddress: string;
  accountType: string;
  currency: string;
  accountNumberIban: string;
  routingNumber: string;
  swift: string;
  w8W9Form: string;
}

const CAMPOS_FORM: { key: keyof Contractor; label: string }[] = [
  { key: 'nombreCompleto', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'cuil', label: 'Tax ID (CUIL)' },
  { key: 'nTelefono', label: 'Phone' },
  { key: 'domicilioDni', label: 'ID Address' },
  { key: 'domicilioReal', label: 'Current Address' },
  { key: 'salarioMensualUsd', label: 'Monthly Salary (USD)' },
  { key: 'beneficiaryName', label: 'Beneficiary Name' },
  { key: 'bankName', label: 'Bank Name' },
  { key: 'bankAddress', label: 'Bank Address' },
  { key: 'accountType', label: 'Account Type' },
  { key: 'currency', label: 'Currency' },
  { key: 'accountNumberIban', label: 'Account Number / IBAN' },
  { key: 'routingNumber', label: 'Routing Number' },
  { key: 'swift', label: 'SWIFT' },
  { key: 'w8W9Form', label: 'W8 / W9' },
];

export default function ContractorsPage() {
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const hasActiveFilters = !!filterCurrency;

  const contractorsFiltrados = useMemo(() => contractors.filter((c) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      if (!CAMPOS_FORM.some(({ key }) => String(c[key] ?? '').toLowerCase().includes(texto))) return false;
    }
    if (filterCurrency && c.currency !== filterCurrency) return false;
    return true;
  }), [contractors, busqueda, filterCurrency]);
  const [editando, setEditando] = useState<Contractor | null>(null); // null = modal cerrado
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarContractors() {
    setCargando(true);
    const data = await apiFetch('/contractors');
    setContractors(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarContractors();
  }, []);

  function abrirNuevo() {
    setEditando({
      id: '',
      nombreCompleto: '',
      email: '',
      cuil: '',
      nTelefono: '',
      domicilioDni: '',
      domicilioReal: '',
      salarioMensualUsd: 0,
      beneficiaryName: '',
      bankName: '',
      bankAddress: '',
      accountType: '',
      currency: '',
      accountNumberIban: '',
      routingNumber: '',
      swift: '',
      w8W9Form: '',
    });
    setCreandoNuevo(true);
  }

  function abrirEdit(contractor: Contractor) {
    setEditando(contractor);
    setCreandoNuevo(false);
  }

  async function handleGuardar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setGuardando(true);
    try {
      if (creandoNuevo) {
        await apiFetch('/contractors', {
          method: 'POST',
          body: JSON.stringify(editando),
        });
        toast('Contractor created successfully');
      } else {
        await apiFetch(`/contractors/${editando.id}`, {
          method: 'PUT',
          body: JSON.stringify(editando),
        });
        toast('Contractor updated successfully');
      }
      setEditando(null);
      await cargarContractors();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error saving contractor', 'error');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Contractors</h1>

      <PageToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        primaryLabel="Add contractor"
        onPrimaryClick={abrirNuevo}
        onFilterClick={() => setFilterOpen((v) => !v)}
        filterOpen={filterOpen}
        onEditModeClick={() => setEditMode((v) => !v)}
        editModeActive={editMode}
      />

      <FilterBar
        open={filterOpen}
        statusOptions={CURRENCY_OPTIONS}
        statusValue={filterCurrency}
        onStatusChange={setFilterCurrency}
        statusLabel="Currency"
        hasActiveFilters={hasActiveFilters}
        onClear={() => setFilterCurrency('')}
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
                {CAMPOS_FORM.map(({ key, label }) => (
                  <th key={key} className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>
                ))}              </tr>
            </thead>
            <tbody>
              {contractorsFiltrados.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 last:border-0 transition-colors duration-100 hover:bg-stone-100/80 dark:border-zinc-800 dark:hover:bg-white/[0.07]">

                  {editMode && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => abrirEdit(c)}
                        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-teal-400"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                  {CAMPOS_FORM.map(({ key }) => (
                    <td key={key} className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
                      {c[key] || c[key] === 0 ? String(c[key]) : '—'}
                    </td>
                  ))}                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Modal de alta/edición */}
      {editando && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-content max-h-[85vh] w-full max-w-lg scroll-smooth overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {creandoNuevo ? 'New contractor' : `Edit: ${editando.nombreCompleto}`}
            </h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-3">
              {CAMPOS_FORM.map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
                  <input
                    type={key === 'salarioMensualUsd' ? 'number' : 'text'}
                    value={editando[key] as string | number}
                    onChange={(e) =>
                      setEditando({
                        ...editando,
                        [key]: key === 'salarioMensualUsd' ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                  />
                </div>
              ))}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Cancel
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
