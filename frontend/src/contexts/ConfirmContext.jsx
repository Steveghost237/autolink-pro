import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const finish = useCallback((confirmed) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback((options = {}) => new Promise(resolve => {
    resolveRef.current?.(false);
    resolveRef.current = resolve;
    setDialog({
      title: options.title || 'Confirmer l’action',
      message: options.message || 'Souhaitez-vous continuer ?',
      confirmLabel: options.confirmLabel || 'Confirmer',
      cancelLabel: options.cancelLabel || 'Annuler',
      danger: Boolean(options.danger),
    });
  }), []);

  useEffect(() => {
    if (!dialog) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') finish(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialog, finish]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onMouseDown={event => {
            if (event.target === event.currentTarget) finish(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
          >
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {dialog.title}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {dialog.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => finish(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${dialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm doit être utilisé dans ConfirmProvider.');
  return confirm;
}
