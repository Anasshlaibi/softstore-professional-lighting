import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in-down">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md">
                <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-check text-green-500 text-sm"></i>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="font-medium text-sm">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-white hover:text-green-100 transition"
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default Toast;
