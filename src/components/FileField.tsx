import { useState } from 'react';
import { Eye } from 'lucide-react';
import { apiFetchRaw } from '../utils/api';
import DocumentPreview from './DocumentPreview';
import { nombreDeArchivo, urlDeArchivo } from '../utils/files';

interface FileFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export default function FileField({ label, value, onChange }: FileFieldProps) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await apiFetchRaw('/archivos', { method: 'POST', body: formData });
      onChange(data.url);
    } catch {
      setError('Could not upload the file');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  }

  const fullUrl = urlDeArchivo(value);
  const filename = nombreDeArchivo(value);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>

      <div className="flex items-center gap-2">
        {fullUrl ? (
          <>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex flex-1 items-center gap-2 truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-blue-400 dark:hover:bg-zinc-700"
            >
              <Eye size={14} />
              View file
            </button>
          </>
        ) : value ? (
          <span
            className="flex-1 truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
            title={value}
          >
            {filename || value}
          </span>
        ) : (
          <span className="flex-1 truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
            No file
          </span>
        )}

        <label className="cursor-pointer rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-stone-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
          {subiendo ? 'Uploading...' : 'Upload'}
          <input type="file" onChange={handleFile} disabled={subiendo} className="hidden" />
        </label>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {showPreview && fullUrl && (
        <DocumentPreview
          url={fullUrl}
          filename={filename}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
