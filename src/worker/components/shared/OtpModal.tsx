// src/worker/components/shared/OtpModal.tsx
import React, { useState } from 'react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  title: string;
  message: string;
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, onClose, onVerify, title, message }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (otp.length === 4 && !isNaN(Number(otp))) {
        onVerify(otp);
        setOtp('');
        setError(false);
    } else {
        setError(true);
        setTimeout(() => setError(false), 1000);
    }
  }

  const handleClose = () => {
    setOtp('');
    setError(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <input
          type="tel"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleVerify()}
          className={`w-full text-center text-2xl tracking-widest font-bold border rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          maxLength={4}
          placeholder="----"
        />
        <div className="mt-6 flex gap-4">
          <button onClick={handleClose} className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
          <button onClick={handleVerify} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Verify</button>
        </div>
      </div>
    </div>
  );
};
