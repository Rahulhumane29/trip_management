import React from 'react';

export default function Toast({ show, message, type = 'success' }) {
  if (!show) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold text-white transition-all transform translate-y-0 duration-300 ${
      type === 'success'
        ? 'bg-emerald-600 border-emerald-500 shadow-emerald-600/10'
        : type === 'error'
        ? 'bg-rose-600 border-rose-500 shadow-rose-600/10'
        : 'bg-blue-600 border-blue-500 shadow-blue-600/10'
    }`}>
      {type === 'success' ? (
        <svg className="w-4 h-4 shrink-0 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
}
