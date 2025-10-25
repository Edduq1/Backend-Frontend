import React from 'react';
import type { AuditFilters, Rol } from '../../pages/hook/useConfiguracion';
import { Filter, User, CalendarRange, TrashIcon } from 'lucide-react';

interface Props {
  filters: AuditFilters;
  onChange: (next: AuditFilters) => void;
}

const AuditFilterBar: React.FC<Props> = ({ filters, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-[#FD993B]" />
        <h3 className="text-sm font-semibold text-gray-800">Filtros de auditoría</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <input
            value={filters.usuario ?? ''}
            onChange={(e) => onChange({ ...filters, usuario: e.target.value })}
            placeholder="Usuario"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
          />
        </div>
        {/* Eliminado filtro de tipo de acción */}
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-gray-600" />
          <input
            type="date"
            value={filters.desde ?? ''}
            onChange={(e) => onChange({ ...filters, desde: e.target.value })}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
          />
        </div>
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-gray-600" />
          <input
            type="date"
            value={filters.hasta ?? ''}
            onChange={(e) => onChange({ ...filters, hasta: e.target.value })}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
          />
        </div>
        <div>
          <select
            value={(filters.rol ?? '') as Rol | 'Todos'}
            onChange={(e) => onChange({ ...filters, rol: e.target.value as Rol | 'Todos' })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
          >
            <option value="" disabled>Selecciona un rol</option>
            <option value="Todos">Todos</option>
            <option value="Administrador">Administrador</option>
            <option value="Analista">Analista</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={() => onChange({ usuario: '', rol: 'Todos', desde: '', hasta: '' })}
          className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 transition font-medium border border-orange-300"
        >
          <TrashIcon className="w-5 h-5" /> 
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default AuditFilterBar;