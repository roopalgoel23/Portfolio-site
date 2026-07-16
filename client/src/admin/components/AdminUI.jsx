import React, { forwardRef } from 'react';

/* ── Admin Label ────────────────────────────────────────── */
export function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block font-body text-xs font-500 tracking-[0.08em] text-secondary uppercase">
      {children}
    </label>
  );
}

/* ── Admin Input ────────────────────────────────────────── */
export const AdminInput = forwardRef(function AdminInput(
  { className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-btn border border-line bg-white px-4 py-3 font-body text-base text-primary outline-none transition-colors duration-300 placeholder:text-secondary/50 focus:border-accentHover ${className}`}
      {...props}
    />
  );
});

/* ── Admin Textarea ─────────────────────────────────────── */
export const AdminTextarea = forwardRef(function AdminTextarea(
  { className = '', ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-btn border border-line bg-white px-4 py-3 font-body text-base text-primary outline-none transition-colors duration-300 placeholder:text-secondary/50 focus:border-accentHover ${className}`}
      {...props}
    />
  );
});

/* ── Admin Select ───────────────────────────────────────── */
export const AdminSelect = forwardRef(function AdminSelect(
  { className = '', children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`w-full cursor-pointer rounded-btn border border-line bg-white px-4 py-3 font-body text-base text-primary outline-none transition-colors duration-300 focus:border-accentHover ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

/* ── Admin Card ─────────────────────────────────────────── */
export function AdminCard({ className = '', children }) {
  return (
    <div className={`rounded-card border border-line bg-card p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ── Page Header ────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-3xl font-600 text-primary">{title}</h1>
        {subtitle && (
          <p className="mt-1 font-body text-sm text-secondary">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── Admin Button ───────────────────────────────────────── */
export function AdminButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary:   'bg-primary text-white hover:bg-accentHover hover:text-primary',
    secondary: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white',
    danger:    'bg-transparent border border-red-400 text-red-500 hover:bg-red-500 hover:text-white',
    ghost:     'bg-transparent text-secondary hover:bg-card'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3 font-body text-sm font-500 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Icon Button (small square) ─────────────────────────── */
export function IconButton({ children, variant = 'ghost', className = '', ...props }) {
  const variants = {
    ghost: 'text-secondary hover:bg-card hover:text-primary',
    danger: 'text-red-400 hover:bg-red-50'
  };

  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
