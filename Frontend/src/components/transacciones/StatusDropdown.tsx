// src/components/Dashboard/common/StatusDropdown.tsx
import React from 'react';
import type { Transaction } from '../../pages/hook/useTransactions';

type Status = Transaction['estado'] | '';

interface StatusDropdownProps {
    currentStatus: Status;
    onChange: (status: Status) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, onChange }) => {
    return (
        <div className="relative inline-block text-left">
            <select
                value={currentStatus}
                onChange={(e) => onChange(e.target.value as Status)}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Estado: Todos</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="COMPLETADA">COMPLETADA</option>
                <option value="CANCELADA">CANCELADA</option>
                <option value="RECHAZADA">RECHAZADA</option>
            </select>
        </div>
    );
};

export default StatusDropdown;