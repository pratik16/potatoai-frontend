import { useRef } from 'react';
import { FileText, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import {
  useAddProjectFileMutation,
  useGetFileLimitsQuery,
  useRemoveProjectFileMutation,
} from '../projectsApi';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../app/uiSlice';
import type { Project, ProjectFile } from '../../../types/project.types';

const FALLBACK_LIMITS = {
  max_files: 3,
  max_file_size_mb: 5,
  allowed_mime_types: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

interface Props {
  project: Project;
  /** Form layout inside edit modal (default: sidebar strip). */
  variant?: 'sidebar' | 'inline';
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileRow({
  file,
  onRemove,
  removing,
}: {
  file: ProjectFile;
  onRemove: () => void;
  removing: boolean;
}) {
  const isImage = file.mime_type?.startsWith('image/');
  const isPdf   = file.mime_type === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf');

  return (
    <li className="flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-2 text-sm">
      {isImage ? (
        <ImageIcon className="h-4 w-4 shrink-0 text-potato-400" />
      ) : (
        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-gray-200">{file.filename}</p>
        {file.size_bytes != null && (
          <p className="text-xs text-gray-500">{formatSize(file.size_bytes)}</p>
        )}
        {isPdf && !file.text_information && (
          <p className="text-xs text-amber-600/90">PDF text could not be extracted</p>
        )}
      </div>
      {file.s3_url && isImage && (
        <a
          href={file.s3_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-potato-500 hover:text-potato-400"
        >
          View
        </a>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        className="shrink-0 rounded p-1 text-gray-500 hover:bg-surface-3 hover:text-red-400 disabled:opacity-50"
        aria-label={`Remove ${file.filename}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

export function ProjectAttachmentsPanel({ project, variant = 'sidebar' }: Props) {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const projectId = project.id ?? project._id;
  const files = project.files ?? [];

  const { data: limitsData } = useGetFileLimitsQuery();
  const limits = limitsData ?? FALLBACK_LIMITS;

  const [addFile, { isLoading: uploading }] = useAddProjectFileMutation();
  const [removeFile, { isLoading: removing }] = useRemoveProjectFileMutation();

  const maxFiles = limits.max_files;
  const maxMb    = limits.max_file_size_mb;
  const allowed  = limits.allowed_mime_types ?? FALLBACK_LIMITS.allowed_mime_types;
  const atLimit  = files.length >= maxFiles;

  const validate = (file: File): boolean => {
    if (files.length >= maxFiles) {
      dispatch(showToast({ message: `Maximum ${maxFiles} files per project`, type: 'error' }));
      return false;
    }
    if (file.size <= 0) {
      dispatch(showToast({ message: `${file.name} is empty`, type: 'error' }));
      return false;
    }
    if (file.size > maxMb * 1024 * 1024) {
      dispatch(showToast({ message: `${file.name} exceeds ${maxMb}MB limit`, type: 'error' }));
      return false;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const extOk = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    if (!allowed.includes(file.type) && !extOk) {
      dispatch(showToast({ message: `${file.name}: only PDF and images are allowed`, type: 'error' }));
      return false;
    }
    if (files.some((f) => f.filename === file.name)) {
      dispatch(showToast({ message: `${file.name} is already attached`, type: 'error' }));
      return false;
    }
    return true;
  };

  const handleSelect = async (selected: File[]) => {
    for (const file of selected) {
      if (!validate(file)) continue;
      try {
        await addFile({ projectId, file }).unwrap();
        dispatch(showToast({ message: `${file.name} attached`, type: 'success' }));
      } catch (err: unknown) {
        const msg = (err as { data?: { message?: string } })?.data?.message ?? `Could not upload ${file.name}`;
        dispatch(showToast({ message: msg, type: 'error' }));
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async (filename: string) => {
    try {
      await removeFile({ projectId, filename }).unwrap();
      dispatch(showToast({ message: 'Attachment removed', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Could not remove attachment', type: 'error' }));
    }
  };

  return (
    <div
      className={
        variant === 'inline'
          ? 'flex flex-col gap-1.5'
          : 'border-t border-surface-3 px-4 py-3'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Paperclip className="h-4 w-4 text-gray-400" />
            Attachments
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            PDF or images, up to {maxMb}MB each ({files.length}/{maxFiles})
          </p>
        </div>
        <button
          type="button"
          disabled={atLimit || uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-surface-3 px-2.5 py-1 text-xs text-gray-300 hover:bg-surface-2 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Add file'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={allowed.join(',')}
        className="hidden"
        multiple
        onChange={(e) => {
          void handleSelect(Array.from(e.target.files ?? []));
        }}
      />

      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <FileRow
              key={f.filename}
              file={f}
              removing={removing}
              onRemove={() => void handleRemove(f.filename)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-gray-600">
          Attach reference PDFs or images — content is included in every chat in this project.
        </p>
      )}
    </div>
  );
}
