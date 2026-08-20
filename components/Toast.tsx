import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration, isPaused]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] animate-slide-in-down max-w-sm w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3 relative overflow-hidden backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-check text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-gray-200 leading-snug line-clamp-2">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>

        {/* Subtle timer progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/70 transition-all"
          style={{
            animation: `marquee ${duration}ms linear forwards`,
            width: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default Toast;
