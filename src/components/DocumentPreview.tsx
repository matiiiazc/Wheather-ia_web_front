import { X, Download } from 'lucide-react';

interface DocumentPreviewProps {
  url: string;
  filename?: string;
  onClose: () => void;
}

export default function DocumentPreview({ url, filename, onClose }: DocumentPreviewProps) {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';

  function handleDownload() {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document';
    a.click();
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="modal-content flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {filename || 'Document Preview'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Download"
            >
              <Download size={14} />
              Download
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-white/5"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 scroll-smooth overflow-auto bg-stone-50 p-4 dark:bg-zinc-950">
          {isImage && (
            <div className="flex h-full items-center justify-center">
              <img
                src={url}
                alt={filename || 'Preview'}
                className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          )}

          {isPdf && (
            <iframe
              src={url}
              className="h-full w-full rounded-lg border border-stone-200 bg-white dark:border-zinc-800"
              title="PDF Preview"
            />
          )}

          {!isImage && !isPdf && (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Preview not available for this file type (.{ext})
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
              >
                <Download size={16} />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
