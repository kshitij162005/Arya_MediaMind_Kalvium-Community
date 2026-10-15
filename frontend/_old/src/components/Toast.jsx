import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' && <CheckCircle2 size={16} className="text-cyan" />}
        {type === 'warning' && <AlertTriangle size={16} className="text-amber" />}
        {type === 'info' && <Info size={16} className="text-cyan" />}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
