// src/components/Dashboard/common/EtiquetaDropdown.tsx
import React from 'react';

interface EtiquetaDropdownProps {
    currentEtiqueta: string;
    onChange: (etiqueta: string) => void;
}

// Opciones simuladas de tipo de comercio
const possibleEtiquetas = [
    { label: 'Todos los Comercios', value: '' },
    { label: 'Banca', value: 'Banca' },
    { label: 'Electronica', value: 'Electronica' },
    { label: 'Servicios', value: 'Servicios' },
    { label: 'Moda', value: 'Moda' },
];

const EtiquetaDropdown: React.FC<EtiquetaDropdownProps> = ({ currentEtiqueta, onChange }) => {
    return (
        <div className="relative inline-block text-left">
            <select
                value={currentEtiqueta}
                onChange={(e) => onChange(e.target.value)}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {possibleEtiquetas.map(option => (
                    <option key={option.value} value={option.value}>
                        Tipo Comercio: {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default EtiquetaDropdown;