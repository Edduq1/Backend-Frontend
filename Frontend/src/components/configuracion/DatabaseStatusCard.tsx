import React from 'react';
import type { DBStatus } from '../../pages/hook/useConfiguracion';
import { Database, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

interface Props {
  status: DBStatus;
  onRefresh?: () => void;
}

const DatabaseStatusCard: React.FC<Props> = ({ status, onRefresh }) => {
  const { connected, dbName, userName, lastModelExportSync } = status;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Database className="w-5 h-5 text-[#FD993B]" />
        <h3 className="text-sm font-semibold text-gray-800">Estado de base de datos</h3>
        {onRefresh && (
          <button onClick={onRefresh} className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded border bg-gray-50 hover:bg-gray-100">
            <RefreshCcw className="w-3.5 h-3.5" /> Refrescar estructura
          </button>
        )}
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <div className="text-sm font-semibold text-gray-800">Estado de conexión</div>
            <div className="text-xs text-gray-600">{connected ? 'Conectado' : 'Desconectado'}</div>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">Base de datos</div>
          <div className="text-xs text-gray-600">{dbName} / {userName}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">Última sincronización</div>
          <div className="text-xs text-gray-600">{lastModelExportSync ? new Date(lastModelExportSync).toLocaleString() : '—'}</div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatusCard;