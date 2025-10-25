// src/components/Dashboard/common/DniInput.tsx
import React from 'react';

interface DniInputProps {
  dni: string;
  setDni: (dni: string) => void;
  // Puedes agregar disabled, onEnter, etc., aquí
}

const DniInput: React.FC<DniInputProps> = ({ dni, setDni }) => {
  const DNI_LENGTH = 8;
  const isComplete = dni.length === DNI_LENGTH;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    if (onlyNumbers.length <= DNI_LENGTH) {
      setDni(onlyNumbers);
    }
  };

  return (
    <div className="relative mb-6">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="..."
        value={dni}
        onChange={handleChange}
        maxLength={DNI_LENGTH}
        className={`w-full bg-gray-700 text-white py-4 px-4 rounded-xl text-2xl text-center transition-all duration-300
                    font-mono tracking-[0.25em] placeholder-gray-500 border-2
                    ${isComplete ? 'border-green-500 focus:ring-green-500' : 'border-gray-700 focus:ring-blue-500'}`}
        style={{ letterSpacing: '0.25em' }}
      />
      <div className="absolute -bottom-5 right-0 text-xs font-medium"
           style={{ color: isComplete ? '#10B981' : (dni.length > 0 ? '#F59E0B' : '#6B7280') }}>
        {dni.length}/{DNI_LENGTH}
      </div>
    </div>
  );
};

export default DniInput;