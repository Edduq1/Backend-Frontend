// src/components/Dashboard/ManualCodeView.tsx
import React from 'react';

interface ManualCodeViewProps {
  code: string[];
  codeRefs: React.RefObject<Array<HTMLInputElement | null>>;
  handleCodeChange: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void;
  validateCode: () => void;
  isLoading: boolean;
  onGoBack: () => void;
}

const ManualCodeView: React.FC<ManualCodeViewProps> = ({
  code,
  codeRefs,
  handleCodeChange,
  validateCode,
  isLoading,
  onGoBack,
}) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-4">Código de Confirmación</h2>
    <div className="flex justify-between space-x-2 mb-6">
      {code.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            // Asegúrate de usar un RefObject o manejar correctamente la referencia
            if (el && codeRefs.current) codeRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleCodeChange(e, i)}
          onKeyDown={(e) => {
              if (e.key === 'Backspace' && digit === '' && i > 0 && codeRefs.current) {
                  codeRefs.current[i - 1]?.focus();
              }
          }}
          className="w-1/6 h-14 text-3xl text-center bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
          disabled={isLoading}
        />
      ))}
    </div>
    <button
      onClick={validateCode}
      disabled={code.some(d => d === '') || isLoading}
      className={`w-full font-semibold py-3 rounded-lg transition ${
          code.every(d => d !== '') && !isLoading ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
      }`}
    >
      {isLoading ? 'Validando...' : 'Validar Acceso'}
    </button>
    <button
      onClick={onGoBack}
      disabled={isLoading}
      className="mt-3 w-full text-gray-400 hover:text-white text-sm"
    >
      Regresar al DNI
    </button>
  </div>
);

export default ManualCodeView;