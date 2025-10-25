import React from 'react';
import type { AuditEvent } from '../../pages/hook/useConfiguracion';
import {
  List,
  User,
  Shield,
  Activity,
  CalendarClock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  data: AuditEvent[];
}

const AuditTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <List className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-800">Auditoría del sistema</h3>
        <div className="ml-auto text-xs text-gray-500">Eventos: {data.length}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4 text-orange-500" />
                  Usuario
                </span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-orange-500" />
                  Rol
                </span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Acción
                </span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-4 h-4 text-orange-500" />
                  Fecha y hora
                </span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  IP
                </span>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  Estado
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Sin registros
                </td>
              </tr>
            ) : (
              data.map((e, idx) => (
                <tr
                  key={idx}
                  className="text-sm hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-3 py-2 font-medium text-gray-800">{e.usuario}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        e.rol === 'Administrador'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {e.rol}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{e.accion}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {new Date(e.fecha).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{e.ip}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        e.estado === 'Éxito'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTable;
