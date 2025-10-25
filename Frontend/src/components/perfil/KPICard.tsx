// src/components/Dashboard/common/KPICard.tsx
import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    colorClass: string; 
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition duration-300">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
    </div>
);

export default KPICard;