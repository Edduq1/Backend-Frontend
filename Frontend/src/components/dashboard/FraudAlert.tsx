import React from 'react';
import { AlertTriangleIcon, XIcon } from 'lucide-react';
import { FRAUD_COLOR } from '../../pages/hook/useDashboard';

interface FraudAlertProps {
  isVisible: boolean;
  onClose: () => void;
}

const FraudAlert: React.FC<FraudAlertProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="bg-red-50 border-l-4 p-4 mb-6 rounded-md shadow-sm animate-fadeIn"
      style={{ borderColor: FRAUD_COLOR }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangleIcon className="h-5 w-5" style={{ color: FRAUD_COLOR }} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium" style={{ color: FRAUD_COLOR }}>
            ¡Alerta Crítica!
          </p>
          <p className="mt-1 text-sm text-gray-700">
            La tasa de fraude ha superado el umbral crítico (3.0%). Se recomienda revisar las transacciones recientes.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-auto flex-shrink-0 rounded-full p-1 hover:bg-red-100 transition-colors"
        >
          <XIcon className="h-4 w-4" style={{ color: FRAUD_COLOR }} />
        </button>
      </div>
    </div>
  );
};

export default FraudAlert;