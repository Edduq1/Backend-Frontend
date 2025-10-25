// src/components/Dashboard/configuracion/DatabaseLogsViewer.tsx
import React from 'react';

interface Props {
  logs: string[];
  fullHeight?: boolean;
}

const DatabaseLogsViewer: React.FC<Props> = ({ logs, fullHeight }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col ${
        fullHeight ? 'h-full' : 'max-h-72'
      }`}
    >
      {/* Título */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-800">
          Logs recientes de integridad
        </h3>
      </div>

      {/* Contenido scrollable */}
      <div className="p-3 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-xs text-gray-800 flex flex-col flex-1 overflow-hidden">
          <div className="text-gray-500 mb-2 flex-shrink-0">Consola</div>

          {/* Scroll solo dentro de este div */}
          <div
            className={`overflow-y-auto overflow-x-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white rounded flex-1`}
            style={{ lineHeight: '1.0em' }}
          >
            {logs.length === 0 ? (
              <div className="text-gray-500">Sin registros</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="py-0.5 whitespace-nowrap">
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseLogsViewer;
