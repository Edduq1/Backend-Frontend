// src/components/Dashboard/common/RiskBadge.tsx

import React from 'react';

interface RiskBadgeProps {
  score: number;
}

// Componente para el indicador de riesgo (semáforo y score)
const RiskBadge: React.FC<RiskBadgeProps> = ({ score }) => {
  let colorClass = 'bg-green-100'; // Bajo riesgo (score alto)
  let dotColor = 'bg-green-500';
  let textColor = 'text-green-800';
  let riskLevel = 'Bajo';

  if (score < 30) {
    colorClass = 'bg-red-100'; // Alto riesgo
    dotColor = 'bg-red-500';
    textColor = 'text-red-800';
    riskLevel = 'Alto';
  } else if (score < 70) {
    colorClass = 'bg-yellow-100'; // Riesgo medio
    dotColor = 'bg-yellow-500';
    textColor = 'text-yellow-800';
    riskLevel = 'Medio';
  }

  return (
    <span
      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}
      title={`Nivel de Riesgo: ${riskLevel}`}
    >
      <span className={`w-2 h-2 rounded-full mr-1 my-auto ${dotColor}`}></span>
      <span className={textColor}>{score}</span>
    </span>
  );
};

export default RiskBadge;