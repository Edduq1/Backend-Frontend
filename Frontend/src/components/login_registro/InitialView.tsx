// src/components/Dashboard/InitialView.tsx
import React from 'react';

interface InitialViewProps {
  onStartFacialRecognition: () => void;
  onNavigateToManualDNI: () => void;
}

const InitialView: React.FC<InitialViewProps> = ({ onStartFacialRecognition, onNavigateToManualDNI }) => (
  <>
    <h2 className="text-2xl font-bold text-white mb-3">Método de Acceso</h2>
    <p className="text-gray-400 text-sm mb-6">Seleccione cómo desea verificar su identidad.</p>

    <button
      onClick={onStartFacialRecognition}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
    >
      Empezar Reconocimiento Facial
    </button>

    <div className="relative my-6 flex items-center justify-center">
      <div className="absolute w-full border-t border-gray-700" />
      <span className="bg-[#1e293b] px-3 text-gray-400 text-sm z-10">O acceder de forma manual</span>
    </div>
    <button
      onClick={onNavigateToManualDNI}
      className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 rounded-lg transition"
    >
      Ingresar con DNI
    </button>
  </>
);

export default InitialView;