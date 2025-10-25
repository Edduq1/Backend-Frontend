// src/components/Dashboard/ManualDniView.tsx
import React from 'react';
import DniInput from './DniInput';

interface ManualDniViewProps {
  dni: string;
  setDni: (dni: string) => void;
  onSubmit: () => void;
  onGoBack: () => void;
}

const ManualDniView: React.FC<ManualDniViewProps> = ({ dni, setDni, onSubmit, onGoBack }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-4">Verificación Manual</h2>
    <p className="text-gray-400 text-sm mb-6">Ingrese DNI</p>
    <DniInput dni={dni} setDni={setDni} />
    <button
      onClick={onSubmit}
      disabled={dni.length !== 8}
      className={`w-full font-semibold py-3 rounded-lg transition ${
          dni.length === 8 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
      }`}
    >
      Continuar
    </button>
    <button
      onClick={onGoBack}
      className="mt-3 w-full text-gray-400 hover:text-white text-sm"
    >
      Volver
    </button>
  </div>
);

export default ManualDniView;