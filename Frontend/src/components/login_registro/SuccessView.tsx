// src/components/Dashboard/SuccessView.tsx
import React from 'react';

const SuccessView: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <svg
      className="w-20 h-20 text-green-500 animate-bounce mb-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>

    <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in">
      ¡Acceso concedido!
    </h2>
    <p className="text-gray-400 text-sm mb-6 animate-fade-in-delay">
      Redirigiendo al portal principal...
    </p>

    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default SuccessView;