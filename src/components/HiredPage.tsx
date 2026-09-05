import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { apiFetch } from '../utils/api';
import FileField from './FileField';
import PageToolbar from './PageToolbar';
import FilterBar from './FilterBar';
import InlineStatusSelect from './InlineStatusSelect';
import DocumentLink from './DocumentLink';
import { useToast } from './useToast';

const HIRED_STATUS_OPTIONS = ['Active', 'Contract Ended'];

interface Persona {
  id: string;
  name: string;
  country: string | null;
  resume: string | null;
  fechaIngreso: string | null;
  status: string | null;
  proyecto: string | null;
  monthlySalary: number | null;
  emailAddress: string | null;
  phone: string | null;
  mailAz: string | null;
  sso: string | null;
  prid: string | null;
  agreement: string | null;
  startingDate: string | null;
  computadoras: string | null;
  idAddress: string | null;
  currentAddress: string | null;
  confirmedAddress: string | null;
  utilityBill: string | null;
  taxResidency: string | null;
  documentationFolder: string | null;
  beneficiaryName: string | null;
  bankName: string | null;
  bankAddress: string | null;
  accountType: string | null;
  currency: string | null;
  accountNumberIban: string | null;
  routingNumber: string | null;
  swift: string | null;
  governmentId: string | null;
  photoIdVerification: string | null;
  passport: string | null;
  backgroundCheck: string | null;
  taxFormsSigned: string | null;
}

const TODAS_LAS_COLUMNAS: { key: keyof Persona; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'country', label: 'Country' },
  { key: 'resume', label: 'Resume' },
  { key: 'fechaIngreso', label: 'Fecha de ingreso' },
  { key: 'governmentId', label: 'Government ID' },
  { key: 'photoIdVerification', label: 'Photo ID Verification' },
  { key: 'passport', label: 'Passport' },
  { key: 'confirmedAddress', label: 'Confirmed Address' },
  { key: 'utilityBill', label: 'Utility Bill' },
  { key: 'phone', label: 'Phone' },
  { key: 'taxFormsSigned', label: 'Tax Forms Signed' },
  { key: 'backgroundCheck', label: 'Background Check' },
  { key: 'taxResidency', label: 'Tax Residency' },
  { key: 'emailAddress', label: 'Email Address' },
  { key: 'documentationFolder', label: 'Documentation Folder' },
  { key: 'monthlySalary', label: 'Monthly Salary' },
  { key: 'status', label: 'Status' },
  { key: 'agreement', label: 'Agreement' },
  { key: 'startingDate', label: 'Starting Date' },
  { key: 'prid', label: 'PRID' },
  { key: 'mailAz', label: 'Mail AZ' },
  { key: 'sso', label: 'SSO' },
  { key: 'proyecto', label: 'Proyecto' },
  { key: 'idAddress', label: 'ID Address' },
  { key: 'currentAddress', label: 'Current Address' },
  { key: 'beneficiaryName', label: 'Beneficiary Name' },
  { key: 'bankName', label: 'Bank Name' },
  { key: 'bankAddress', label: 'Bank Address' },
  { key: 'accountType', label: 'Account Type' },
  { key: 'currency', label: 'Currency' },
  { key: 'accountNumberIban', label: 'Account Number / IBAN' },
  { key: 'routingNumber', label: 'Routing Number' },
  { key: 'swift', label: 'SWIFT' },
  { key: 'computadoras', label: 'Computadoras' },
];

const CAMPOS_PERSONALES: { key: keyof Persona; label: string }[] = [
  { key: 'country', label: 'Country' },
  { key: 'idAddress', label: 'ID Address' },
  { key: 'currentAddress', label: 'Current Residential Address' },
  { key: 'confirmedAddress', label: 'Confirmed Residential Address' },
  { key: 'taxResidency', label: 'Tax Residency' },
];

const CAMPOS_ONBOARDING: { key: keyof Persona; label: string }[] = [
  { key: 'status', label: 'Status' },
  { key: 'proyecto', label: 'Proyecto' },
  { key: 'emailAddress', label: 'Email' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'mailAz', label: 'Mail AZ' },
  { key: 'sso', label: 'SSO' },
  { key: 'prid', label: 'PRID' },
  { key: 'computadoras', label: 'Computadoras' },
];

const CAMPOS_BANCO: { key: keyof Persona; label: string }[] = [
  { key: 'beneficiaryName', label: 'Beneficiary Name' },
  { key: 'bankName', label: 'Bank Name' },
  { key: 'bankAddress', label: 'Bank Address' },
  { key: 'accountType', label: 'Account Type' },
  { key: 'currency', label: 'Currency' },
  { key: 'accountNumberIban', label: 'Account Number / IBAN' },
  { key: 'routingNumber', label: 'Routing Number' },
  { key: 'swift', label: 'SWIFT' },
];

// Estos son todos documentos (PDF/imagen) — se muestran con FileField, no texto plano
const CAMPOS_ARCHIVOS: { key: keyof Persona; label: string }[] = [
  { key: 'resume', label: 'Resume (CV)' },
  { key: 'agreement', label: 'Agreement' },
  { key: 'governmentId', label: 'Government ID' },
  { key: 'photoIdVerification', label: 'Photo ID Verification' },
  { key: 'passport', label: 'Passport' },
  { key: 'backgroundCheck', label: 'Background Check' },
  { key: 'taxFormsSigned', label: 'Tax Forms Signed' },
  { key: 'utilityBill', label: 'Utility Bill' },
  { key: 'documentationFolder', label: 'Documentation Folder' },
];

export default function HiredPage() {
  const { toast } = useToast();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editando, setEditando] = useState<Persona | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const hasActiveFilters = !!filterStatus || !!filterDateFrom || !!filterDateTo;

  const personasFiltradas = useMemo(() => personas.filter((p) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const matchText = TODAS_LAS_COLUMNAS.some(({ key }) =>
        String(p[key] ?? '').toLowerCase().includes(texto)
      );
      if (!matchText) return false;
    }
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterDateFrom || filterDateTo) {
      const d = p.startingDate ? p.startingDate.slice(0, 10) : null;
      if (!d) return false;
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo && d > filterDateTo) return false;
    }
    return true;
  }), [personas, busqueda, filterStatus, filterDateFrom, filterDateTo]);

  const personaVacia: Persona = {
    id: '', name: '', country: null, resume: null, fechaIngreso: null, status: null,
    proyecto: null, monthlySalary: null, emailAddress: null, phone: null, mailAz: null,
    sso: null, prid: null, agreement: null, startingDate: null, computadoras: null,
    idAddress: null, currentAddress: null, confirmedAddress: null, utilityBill: null,
    taxResidency: null, documentationFolder: null, beneficiaryName: null, bankName: null,
    bankAddress: null, accountType: null, currency: null, accountNumberIban: null,
    routingNumber: null, swift: null, governmentId: null, photoIdVerification: null,
    passport: null, backgroundCheck: null, taxFormsSigned: null,
  };

  async function cargar() {
    const data = await apiFetch('/hired');
    setPersonas(data);
    setCargando(false);
  }

  useEffect(() => {
    void Promise.resolve().then(cargar);
  }, []);

  function abrirNuevo() {
    setEditando({ ...personaVacia });
    setCreandoNuevo(true);
  }

  function abrirEditar(persona: Persona) {
    setEditando(persona);
    setCreandoNuevo(false);
  }

  async function handleGuardar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setGuardando(true);
    try {
      if (creandoNuevo) {
        await apiFetch('/hired', {
          method: 'POST',
          body: JSON.stringify(editando),
        });
        toast('Hire created successfully');
      } else {
        await apiFetch(`/hired/${editando.id}`, {
          method: 'PUT',
          body: JSON.stringify(editando),
        });
        toast('Hire updated successfully');
      }
      setEditando(null);
      await cargar();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error saving hire', 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleStatusChange(personaId: string, newStatus: string) {
    try {
      await apiFetch(`/hired/${personaId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPersonas(prev => prev.map(p => p.id === personaId ? { ...p, status: newStatus } : p));
      toast('Status updated');
    } catch {
      toast('Error updating status', 'error');
    }
  }

  const DOCUMENT_FIELDS = ['resume', 'agreement', 'governmentId', 'photoIdVerification', 'passport', 'backgroundCheck', 'taxFormsSigned', 'utilityBill', 'documentationFolder'];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Hired</h1>

      <PageToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        primaryLabel="Add hired"
        onPrimaryClick={abrirNuevo}
        onFilterClick={() => setFilterOpen((v) => !v)}
        filterOpen={filterOpen}
        onEditModeClick={() => setEditMode((v) => !v)}
        editModeActive={editMode}
      />

      <FilterBar
        open={filterOpen}
        statusOptions={HIRED_STATUS_OPTIONS}
        statusValue={filterStatus}
        onStatusChange={setFilterStatus}
        statusLabel="Status"
        dateFromValue={filterDateFrom}
        dateToValue={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        dateLabel="Starting Date"
        hasActiveFilters={hasActiveFilters}
        onClear={() => { setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); }}
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
              {personasFiltradas.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0 transition-colors duration-100 hover:bg-stone-100/80 dark:border-zinc-800 dark:hover:bg-white/[0.07]">

                  {editMode && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-teal-400"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                  {TODAS_LAS_COLUMNAS.map(({ key }) => {
                    const valor = p[key];
                    if (key === 'status') {
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3">
                          <InlineStatusSelect
                            value={valor as string}
                            options={HIRED_STATUS_OPTIONS}
                            onChange={(newStatus) => handleStatusChange(p.id, newStatus)}
                            colorClass="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          />
                        </td>
                      );
                    }
                    if (DOCUMENT_FIELDS.includes(key)) {
                      return (
                        <td key={key} className="whitespace-nowrap px-4 py-3">
                          <DocumentLink url={valor as string} />
                        </td>
                      );
                    }
                    return (
                      <td key={key} className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
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
              {creandoNuevo ? 'New hire' : `Editar: ${editando.name}`}
            </h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Nombre completo</label>
                <input
                  type="text"
                  value={editando.name}
                  onChange={(e) => setEditando({ ...editando, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Personal Info</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Fecha de ingreso</label>
                    <input
                      type="date"
                      value={editando.fechaIngreso?.slice(0, 10) ?? ''}
                      onChange={(e) => setEditando({ ...editando, fechaIngreso: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Starting Date</label>
                    <input
                      type="date"
                      value={editando.startingDate?.slice(0, 10) ?? ''}
                      onChange={(e) => setEditando({ ...editando, startingDate: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Monthly Salary</label>
                    <input
                      type="number"
                      value={editando.monthlySalary ?? ''}
                      onChange={(e) => setEditando({ ...editando, monthlySalary: e.target.value ? Number(e.target.value) : null })}
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                    />
                  </div>
                  {CAMPOS_PERSONALES.map(({ key, label }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
                      <input
                        type="text"
                        value={(editando[key] as string) ?? ''}
                        onChange={(e) => setEditando({ ...editando, [key]: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Onboarding</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CAMPOS_ONBOARDING.map(({ key, label }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
                      <input
                        type="text"
                        value={(editando[key] as string) ?? ''}
                        onChange={(e) => setEditando({ ...editando, [key]: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Bank Details</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CAMPOS_BANCO.map(({ key, label }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
                      <input
                        type="text"
                        value={(editando[key] as string) ?? ''}
                        onChange={(e) => setEditando({ ...editando, [key]: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Documents</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CAMPOS_ARCHIVOS.map(({ key, label }) => (
                    <FileField
                      key={key}
                      label={label}
                      value={(editando[key] as string) ?? ''}
                      onChange={(url) => setEditando({ ...editando, [key]: url })}
                    />
                  ))}
                </div>
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