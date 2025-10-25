import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import type { KPIData } from '../../pages/hook/useDashboard';
import { SUCCESS_COLOR, WARNING_COLOR } from '../../pages/hook/useDashboard';

interface KPISectionProps {
  data: KPIData;
  isLoading: boolean;
}

const KPISection: React.FC<KPISectionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    return score > 80 ? SUCCESS_COLOR : WARNING_COLOR;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de transacciones */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total de Transacciones</p>
            <h3 className="text-2xl font-bold">{data.totalTransactions.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-full">
            <ArrowUpIcon className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* % de fraudes detectados */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Fraudes Detectados</p>
            <h3 className="text-2xl font-bold">{data.fraudRate}%</h3>
          </div>
          <div className="p-2 bg-red-50 rounded-full">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Tasa de falsos positivos */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Falsos Positivos</p>
            <h3 className="text-2xl font-bold">{data.falsePositiveRate}%</h3>
          </div>
          <div className="p-2 bg-yellow-50 rounded-full">
            <ArrowDownIcon className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Score promedio del modelo */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Score Promedio</p>
            <h3 className="text-2xl font-bold" style={{ color: getScoreColor(data.averageModelScore) }}>
              {data.averageModelScore}
            </h3>
          </div>
          <div className="p-2 rounded-full" style={{ backgroundColor: `${getScoreColor(data.averageModelScore)}20` }}>
            {data.averageModelScore > 80 ? (
              <CheckCircleIcon className="h-5 w-5" style={{ color: getScoreColor(data.averageModelScore) }} />
            ) : (
              <AlertTriangleIcon className="h-5 w-5" style={{ color: getScoreColor(data.averageModelScore) }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPISection;