import React from 'react';
import type { Rol } from '../../pages/hook/useConfiguracion';
import { Shield } from 'lucide-react';

interface Props {
  value: Rol;
  onChange: (rol: Rol) => void;
}

const RoleSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-[#FD993B]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Rol)}
        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
      >
        <option value="Analista">Analista</option>
        <option value="Administrador">Administrador</option>
      </select>
    </div>
  );
};

export default RoleSelector;