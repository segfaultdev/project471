import { Loader2 } from "lucide-react";

const DEFAULT_MESSAGE =
  "Are you sure you want to delete your review? This action cannot be undone.";

const ConfirmModal = ({
  isOpen,
  message = DEFAULT_MESSAGE,
  onConfirm,
  onCancel,
  title = "Delete review?",
  confirmLabel = "Delete",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/55 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md rounded-[2rem] border border-emerald-950/10 bg-white p-6 text-emerald-950 shadow-[0_30px_90px_rgba(8,28,21,0.28)]"
      >
        <h2 id="confirm-modal-title" className="text-2xl font-black tracking-tight">
          {title}
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-emerald-950/65">
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-emerald-950/10 bg-white px-5 py-3 text-sm font-black text-emerald-950 transition hover:bg-[#f6f1e7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
