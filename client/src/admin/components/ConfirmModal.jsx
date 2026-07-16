import React, { useState, useCallback, useContext } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Confirmation modal — rendered via the <ConfirmProvider> context.
 * Usage:
 *   const { confirm } = useConfirm();
 *   const ok = await confirm({ title, message });
 */
const ConfirmContext = React.createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    resolve: null
  });

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: opts.title || 'Are you sure?',
        message: opts.message || 'This action cannot be undone.',
        resolve
      });
    });
  }, []);

  const handleClose = useCallback((result) => {
    if (state.resolve) state.resolve(result);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.resolve]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/50 p-4"
          onClick={() => handleClose(false)}
        >
          <div
            className="w-full max-w-md rounded-card border border-line bg-base p-8 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                <AlertTriangle size={24} className="text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-xl font-600 text-primary">
                  {state.title}
                </h3>
                <p className="mt-2 font-body text-base text-secondary">
                  {state.message}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => handleClose(false)}
                className="btn-secondary !px-6 !py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClose(true)}
                className="btn-primary !px-6 !py-3 text-sm"
                style={{ background: '#C53030' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
