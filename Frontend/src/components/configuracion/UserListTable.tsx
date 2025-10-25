import React, { useMemo } from 'react';
import type { Usuario } from '../../pages/hook/useConfiguracion';
import { Shield, CalendarClock, BadgeCheck, Users, Hash } from 'lucide-react';

interface Props {
  users: Usuario[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const UserListTable: React.FC<Props> = ({ users, page, pageSize, total, onPageChange }) => {
  const pageCount = Math.ceil(total / pageSize);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const pageInfo = useMemo(() => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return { start, end };
  }, [page, pageSize, total]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          {/* Encabezado */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 tracking-wider">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-500" /> DNI
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" /> Nombre completo
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 tracking-wider">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" /> Rol
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 tracking-wider">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-orange-500" /> Estado
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-800 tracking-wider">
                <div className="flex items-center justify-end gap-2">
                  <CalendarClock className="w-4 h-4 text-orange-500" /> Registrado
                </div>
              </th>
            </tr>
          </thead>

          {/* Cuerpo */}
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-4 py-3 text-sm text-gray-700">{u.dni}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {u.nombres} {u.apellidos}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.rol === 'Administrador'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.estado === 'Activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {u.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {new Date(u.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-gray-600">
          Mostrando {pageInfo.start}-{pageInfo.end} de {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!canPrev}
            onClick={() => canPrev && onPageChange(page - 1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              canPrev
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Anterior
          </button>
          <div className="text-xs text-gray-700">
            Página {page} de {pageCount}
          </div>
          <button
            disabled={!canNext}
            onClick={() => canNext && onPageChange(page + 1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              canNext
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserListTable;
