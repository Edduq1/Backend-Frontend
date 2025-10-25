// src/components/Dashboard/common/StatusTag.tsx

import React from 'react';

// Tipos de estado basados en la columna 'estado' de public.transacciones
type TransactionEstado = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'RECHAZADA';

interface StatusTagProps {
  estado: TransactionEstado;
}

// Componente para el estado de la transacción (etiqueta)
const StatusTag: React.FC<StatusTagProps> = ({ estado }) => {
  let colorClass = '';
  switch (estado) {
    case 'RECHAZADA':
      colorClass = 'bg-red-500 text-white'; 
      break;
    case 'COMPLETADA':
      colorClass = 'bg-green-500 text-white'; 
      break;
    case 'PENDIENTE':
      colorClass = 'bg-yellow-500 text-gray-900'; 
      break;
    case 'CANCELADA':
      colorClass = 'bg-gray-500 text-white'; 
      break;
    default:
      colorClass = 'bg-gray-200 text-gray-700';
      break;
  }
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded ${colorClass} min-w-[85px] justify-center`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1).replace('-', ' ')}
    </span>
  );
};

export default StatusTag;