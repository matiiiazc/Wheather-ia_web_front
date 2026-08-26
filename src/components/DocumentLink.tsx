import { useState } from 'react';
import { Eye } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import { nombreDeArchivo, urlDeArchivo } from '../utils/files';

interface DocumentLinkProps {
  url: string | null;
  label?: string;
}

export default function DocumentLink({ url, label = 'Ver archivo' }: DocumentLinkProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!url) return <span className="text-zinc-400 dark:text-zinc-500">—</span>;

  const fullUrl = urlDeArchivo(url);
  const filename = nombreDeArchivo(url);

  if (!fullUrl) {
    return (
      <span className="text-zinc-400 dark:text-zinc-500" title={url}>
        {filename || '—'}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowPreview(true)}
        className="group flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <Eye size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="hover:underline">{label}</span>
      </button>

      {showPreview && (
        <DocumentPreview
          url={fullUrl}
          filename={filename}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
