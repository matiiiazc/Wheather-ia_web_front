import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { apiFetch } from '../utils/api';
import FileField from './FileField';
import PageToolbar from './PageToolbar';
import FilterBar from './FilterBar';
import InlineStatusSelect from './InlineStatusSelect';
import DocumentLink from './DocumentLink';
import { useToast } from './Toast';

interface Contractor {
  id: string;
  nombreCompleto: string;
}

interface DatosBancarios {
  id: string;
  nombreCompleto: string;
  beneficiaryName: string;
  bankName: string;
  bankAddress: string;
  accountType: string;
  currency: string;
  accountNumberIban: string;
  routingNumber: string;
  swift: string;
}

interface Payment {
  id: string;
  contractorId: string;
  contractor: Contractor;
  dateOfPayment: string;
  contractorNombre: string;
  service: string;
  billingPeriod: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoice: string;
  invoiceAmount: number;
  paymentConfirmation: string | null;
  status: string | null;
  receiptSent: boolean | null;
  sentDate: string | null;
}

const ESTADOS = ['Pendiente', 'Procesando', 'Pagado', 'Rechazado'];

function aInputDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

const pagoVacio = {
  contractorId: '',
  dateOfPayment: '',
  contractorNombre: '',
  service: '',
  billingPeriod: '',
  invoiceNumber: '',
  invoiceDate: '',
  invoice: '',
  invoiceAmount: '',
  paymentConfirmation: '',
  status: 'Pendiente',
  receiptSent: false,
  sentDate: '',
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const hasActiveFilters = !!filterStatus || !!filterDateFrom || !!filterDateTo;

  const pagosFiltrados = useMemo(() => pagos.filter((p) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const valores = [
        p.contractor?.nombreCompleto, p.service, p.billingPeriod, p.invoiceNumber,
        p.invoice, p.status, p.paymentConfirmation, String(p.invoiceAmount),
      ];
      if (!valores.some((v) => v && String(v).toLowerCase().includes(texto))) return false;
    }
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterDateFrom || filterDateTo) {
      const d = p.dateOfPayment ? p.dateOfPayment.slice(0, 10) : null;
      if (!d) return false;
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo && d > filterDateTo) return false;
    }
    return true;
  }), [pagos, busqueda, filterStatus, filterDateFrom, filterDateTo]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [nuevo, setNuevo] = useState(pagoVacio);
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(null);
  const [cargandoBanco, setCargandoBanco] = useState(false);

  const [editandoPago, setEditandoPago] = useState<Payment | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    const [pagosData, contractorsData] = await Promise.all([
      apiFetch('/payments'),
      apiFetch('/contractors'),
    ]);
    setPagos(pagosData);
    setContractors(contractorsData);
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    if (!nuevo.contractorId) {
      setDatosBancarios(null);
      return;
    }
    setCargandoBanco(true);
    apiFetch(`/payments/datos-bancarios/${nuevo.contractorId}`)
      .then(setDatosBancarios)
      .finally(() => setCargandoBanco(false));
  }, [nuevo.contractorId]);

  function abrirModal() {
    setNuevo(pagoVacio);
    setDatosBancarios(null);
    setModalAbierto(true);
  }

  async function handleGuardar(e: FormEvent) {
    e.preventDefault();
    if (!nuevo.contractorId || !nuevo.invoiceAmount) return;
    setGuardando(true);
    try {
      const contractorElegido = contractors.find((c) => c.id === nuevo.contractorId);
      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          ...nuevo,
          contractorNombre: nuevo.contractorNombre || contractorElegido?.nombreCompleto || '',
          dateOfPayment: nuevo.dateOfPayment || new Date().toISOString(),
          invoiceDate: nuevo.invoiceDate || new Date().toISOString(),
          invoiceAmount: Number(nuevo.invoiceAmount),
          sentDate: nuevo.sentDate || null,
        }),
      });
      setModalAbierto(false);
      toast('Payment created successfully');
      await cargarTodo();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error creating payment', 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!editandoPago) return;
    setGuardandoEdicion(true);
    try {
      await apiFetch(`/payments/${editandoPago.id}`, {
        method: 'PUT',
        body: JSON.stringify(editandoPago),
      });
      setEditandoPago(null);
      toast('Payment updated successfully');
      await cargarTodo();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error updating payment', 'error');
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function handleStatusChange(paymentId: string, newStatus: string) {
    const payment = pagos.find(p => p.id === paymentId);
    const oldStatus = payment?.status || null;
    
    setPagos(prev => prev.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
    
    try {
      await apiFetch(`/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (newStatus === 'Pagado' && oldStatus !== 'Pagado') {
        await apiFetch(`/payments/${paymentId}/send-receipt`, {
          method: 'POST',
        });
      }
      toast('Status updated');
    } catch (error) {
      console.error('Error updating payment status:', error);
      setPagos(prev => prev.map(p => p.id === paymentId ? { ...p, status: oldStatus } : p));
      toast('Error updating status', 'error');
    }
  }

  const colorEstado: Record<string, string> = {
    Pendiente: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    Procesando: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    Pagado: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    Rechazado: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };

  const inputClass =
    'w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30';
  const labelClass = 'mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400';

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Payments</h1>

      <PageToolbar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        primaryLabel="New payment"
        onPrimaryClick={abrirModal}
        onFilterClick={() => setFilterOpen((v) => !v)}
        filterOpen={filterOpen}
        onEditModeClick={() => setEditMode((v) => !v)}
        editModeActive={editMode}
      />

      <FilterBar
        open={filterOpen}
        statusOptions={ESTADOS}
        statusValue={filterStatus}
        onStatusChange={setFilterStatus}
        statusLabel="Status"
        dateFromValue={filterDateFrom}
        dateToValue={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        dateLabel="Date of payment"
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
                <th className="whitespace-nowrap px-4 py-3 font-medium">Date of payment</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Contractor</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Service</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Billing Period</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Invoice #</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Invoice Date</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Invoice</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Invoice Amount</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Payment Confirmation</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Receipt Sent</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Sent Date</th>              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0 transition-colors duration-100 hover:bg-stone-100/80 dark:border-zinc-800 dark:hover:bg-white/[0.07]">

                  {editMode && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => setEditandoPago(p)}
                        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-teal-400"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
                    {p.dateOfPayment ? p.dateOfPayment.slice(0, 10) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-800 dark:text-zinc-100">{p.contractor?.nombreCompleto}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{p.service || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{p.billingPeriod || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">{p.invoiceNumber || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
                    {p.invoiceDate ? p.invoiceDate.slice(0, 10) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <DocumentLink url={p.invoice} label="Ver factura" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">${p.invoiceAmount}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <DocumentLink url={p.paymentConfirmation} label="Ver comprobante" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <InlineStatusSelect
                      value={p.status}
                      options={ESTADOS}
                      onChange={(newStatus) => handleStatusChange(p.id, newStatus)}
                      colorClass={colorEstado[p.status ?? '']}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
                    {p.receiptSent ? 'Sí' : 'No'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400 dark:text-zinc-500">
                    {p.sentDate ? p.sentDate.slice(0, 10) : '—'}
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
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Nuevo pago</h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Contractor</label>
                <select
                  value={nuevo.contractorId}
                  onChange={(e) => setNuevo({ ...nuevo, contractorId: e.target.value })}
                  required
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              {cargandoBanco && (
                <p className="text-xs text-gray-400 dark:text-gray-500">Looking up bank account...</p>
              )}
              {datosBancarios && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-gray-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-gray-300">
                  <p className="mb-1 font-medium text-blue-900 dark:text-blue-300">Paying to this account:</p>
                  <p>Banco: {datosBancarios.bankName || '—'}</p>
                  <p>Cuenta / IBAN: {datosBancarios.accountNumberIban || '—'}</p>
                  <p>SWIFT: {datosBancarios.swift || '—'}</p>
                  <p>Moneda: {datosBancarios.currency || '—'}</p>
                </div>
              )}

              <div>
                <label className={labelClass}>Date of payment</label>
                <input
                  type="date"
                  value={aInputDate(nuevo.dateOfPayment)}
                  onChange={(e) => setNuevo({ ...nuevo, dateOfPayment: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Service</label>
                <input
                  type="text"
                  value={nuevo.service}
                  onChange={(e) => setNuevo({ ...nuevo, service: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Billing Period</label>
                <input
                  type="text"
                  value={nuevo.billingPeriod}
                  onChange={(e) => setNuevo({ ...nuevo, billingPeriod: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Invoice #</label>
                <input
                  type="text"
                  value={nuevo.invoiceNumber}
                  onChange={(e) => setNuevo({ ...nuevo, invoiceNumber: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Invoice Date</label>
                <input
                  type="date"
                  value={aInputDate(nuevo.invoiceDate)}
                  onChange={(e) => setNuevo({ ...nuevo, invoiceDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <FileField
                label="Invoice (archivo)"
                value={nuevo.invoice}
                onChange={(url) => setNuevo({ ...nuevo, invoice: url })}
              />

              <div>
                <label className={labelClass}>Invoice Amount (USD)</label>
                <input
                  type="number"
                  value={nuevo.invoiceAmount}
                  onChange={(e) => setNuevo({ ...nuevo, invoiceAmount: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <FileField
                label="Payment Confirmation (comprobante)"
                value={nuevo.paymentConfirmation}
                onChange={(url) => setNuevo({ ...nuevo, paymentConfirmation: url })}
              />

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={nuevo.status}
                  onChange={(e) => setNuevo({ ...nuevo, status: e.target.value })}
                  className={inputClass}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={nuevo.receiptSent}
                  onChange={(e) => setNuevo({ ...nuevo, receiptSent: e.target.checked })}
                />
                Receipt Sent
              </label>

              <div>
                <label className={labelClass}>Sent Date</label>
                <input
                  type="date"
                  value={aInputDate(nuevo.sentDate)}
                  onChange={(e) => setNuevo({ ...nuevo, sentDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !nuevo.contractorId}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 disabled:opacity-60"
                >
                  {guardando ? 'Saving...' : 'Registrar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editandoPago && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="modal-content max-h-[85vh] w-full max-w-md scroll-smooth overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {editandoPago.contractor?.nombreCompleto}
            </h2>

            <form onSubmit={handleGuardarEdicion} className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Date of payment</label>
                <input
                  type="date"
                  value={aInputDate(editandoPago.dateOfPayment)}
                  onChange={(e) => setEditandoPago({ ...editandoPago, dateOfPayment: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Service</label>
                <input
                  type="text"
                  value={editandoPago.service ?? ''}
                  onChange={(e) => setEditandoPago({ ...editandoPago, service: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Billing Period</label>
                <input
                  type="text"
                  value={editandoPago.billingPeriod ?? ''}
                  onChange={(e) => setEditandoPago({ ...editandoPago, billingPeriod: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Invoice #</label>
                <input
                  type="text"
                  value={editandoPago.invoiceNumber ?? ''}
                  onChange={(e) => setEditandoPago({ ...editandoPago, invoiceNumber: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Invoice Date</label>
                <input
                  type="date"
                  value={aInputDate(editandoPago.invoiceDate)}
                  onChange={(e) => setEditandoPago({ ...editandoPago, invoiceDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <FileField
                label="Invoice (archivo)"
                value={editandoPago.invoice ?? ''}
                onChange={(url) => setEditandoPago({ ...editandoPago, invoice: url })}
              />

              <div>
                <label className={labelClass}>Invoice Amount (USD)</label>
                <input
                  type="number"
                  value={editandoPago.invoiceAmount}
                  onChange={(e) => setEditandoPago({ ...editandoPago, invoiceAmount: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>

              <FileField
                label="Payment Confirmation (comprobante)"
                value={editandoPago.paymentConfirmation ?? ''}
                onChange={(url) => setEditandoPago({ ...editandoPago, paymentConfirmation: url })}
              />

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={editandoPago.status ?? ''}
                  onChange={(e) => setEditandoPago({ ...editandoPago, status: e.target.value })}
                  className={inputClass}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={editandoPago.receiptSent ?? false}
                  onChange={(e) => setEditandoPago({ ...editandoPago, receiptSent: e.target.checked })}
                />
                Receipt Sent
              </label>

              <div>
                <label className={labelClass}>Sent Date</label>
                <input
                  type="date"
                  value={aInputDate(editandoPago.sentDate)}
                  onChange={(e) => setEditandoPago({ ...editandoPago, sentDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditandoPago(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400 disabled:opacity-60"
                >
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