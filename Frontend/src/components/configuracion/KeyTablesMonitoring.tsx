// src/components/Dashboard/configuracion/KeyTablesMonitoring.tsx
import React, { useMemo } from 'react';
import {
  Database,
  Table,
  HardDrive,
  Hash,
  Clock4,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface KeyTableInfo {
  tabla: string;
  registros: number;
  ultimaActualizacion: string; // ISO
  tamanoAprox: string; // e.g. "120 MB"
  estado: 'OK' | 'Atención';
}

const KeyTablesMonitoring: React.FC = () => {
  const data: KeyTableInfo[] = useMemo(
    () => [
      {
        tabla: 'transacciones',
        registros: 1254321,
        ultimaActualizacion: '2025-10-17T12:35:00Z',
        tamanoAprox: '1.2 GB',
        estado: 'OK',
      },
      {
        tabla: 'detalle_transacciones',
        registros: 5243890,
        ultimaActualizacion: '2025-10-17T12:30:00Z',
        tamanoAprox: '3.8 GB',
        estado: 'OK',
      },
      {
        tabla: 'analisis_fraude',
        registros: 89234,
        ultimaActualizacion: '2025-10-17T11:55:00Z',
        tamanoAprox: '240 MB',
        estado: 'Atención',
      },
      {
        tabla: 'productos',
        registros: 13452,
        ultimaActualizacion: '2025-10-16T18:10:00Z',
        tamanoAprox: '85 MB',
        estado: 'OK',
      },
      {
        tabla: 'categorias',
        registros: 42,
        ultimaActualizacion: '2025-10-15T09:20:00Z',
        tamanoAprox: '2 MB',
        estado: 'OK',
      },
      {
        tabla: 'tarjetas',
        registros: 284523,
        ultimaActualizacion: '2025-10-17T10:05:00Z',
        tamanoAprox: '650 MB',
        estado: 'Atención',
      },
    ],
    []
  );

  const formatDate = (iso: string) => new Date(iso).toLocaleString();
  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Database className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-800">
          Monitoreo de tablas clave
        </h3>
        <div className="ml-auto text-xs text-gray-500">Tablas: {data.length}</div>
      </div>

      {/* Contenedor con scroll controlado */}
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Table className="w-4 h-4 text-orange-500" />
                  Tabla
                </div>
              </th>

              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-orange-500" />
                  Registros
                </div>
              </th>

              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Clock4 className="w-4 h-4 text-orange-500" />
                  Última actualización
                </div>
              </th>

              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  Tamaño aproximado
                </div>
              </th>

              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Estado
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((t) => (
              <tr
                key={t.tabla}
                className="text-sm hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-3 py-2 font-medium text-gray-800">{t.tabla}</td>
                <td className="px-3 py-2 text-gray-700">{formatNumber(t.registros)}</td>
                <td className="px-3 py-2 text-gray-700">{formatDate(t.ultimaActualizacion)}</td>
                <td className="px-3 py-2 text-gray-700">{t.tamanoAprox}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      t.estado === 'OK'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {t.estado === 'OK' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {t.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeyTablesMonitoring;
