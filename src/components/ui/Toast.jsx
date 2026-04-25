import { useSelector } from 'react-redux';
import React from 'react';
export function Toasts() {
  const toasts = useSelector((s) => s.board.toasts);
  return (
    <div className="toasts" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}
    </div>
  );
}
