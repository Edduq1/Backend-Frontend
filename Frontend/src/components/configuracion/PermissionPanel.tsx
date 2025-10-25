import React from 'react';
import type { Rol, PermisosPorRol, VistaKey } from '../../pages/hook/useConfiguracion';
import { Gauge, FileSearch, Brain, Settings, Lock } from 'lucide-react';
import RestrictedViewNotice from './RestrictedViewNotice';

interface Props {
  rol: Rol;
  permisosPorRol: PermisosPorRol;
}

const items: { key: VistaKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard principal', icon: <Gauge className="w-5 h-5" /> },
  { key: 'transacciones', label: 'Transacciones', icon: <FileSearch className="w-5 h-5" /> },
  { key: 'modelos', label: 'Modelos / Retraining', icon: <Brain className="w-5 h-5" /> },
  { key: 'configuracion', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
];

const PermissionPanel: React.FC<Props> = ({ rol, permisosPorRol }) => {
  const perms = permisosPorRol[rol];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Settings className="w-5 h-5 text-[#FD993B]" />
        <h3 className="text-sm font-semibold text-gray-800">Permisos por rol</h3>
        <span className="ml-auto text-xs text-gray-500">Rol seleccionado: {rol}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {items.map(({ key, label, icon }) => {
          const allowed = perms[key];
          return (
            <div key={key} className={`relative rounded-lg border shadow-sm p-4 flex items-center gap-3 ${allowed ? 'bg-white border-green-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`p-2 rounded-lg ${allowed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">{label}</div>
                <div className={`text-xs ${allowed ? 'text-green-700' : 'text-gray-600'} mt-0.5`}>
                  {allowed ? 'Acceso total' : 'Bloqueado (deshabilitado)'}
                </div>
              </div>
              {!allowed && (
                <div className="absolute inset-0 pointer-events-none">
                  <RestrictedViewNotice />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-600 flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Las vistas bloqueadas se muestran con candado y opacidad.
      </div>
    </div>
  );
};

export default PermissionPanel;