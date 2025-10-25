import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { TrendPoint } from '../../pages/hook/useConfiguracion';
import { BarChart3 } from 'lucide-react';

interface Props {
  data: TrendPoint[];
}

const ActionTrendChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#FD993B]" />
        <h3 className="text-sm font-semibold text-gray-800">Acciones por día</h3>
      </div>
      <div className="p-3" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#fef3c7' }} />
            <Bar dataKey="acciones" fill="#FD993B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActionTrendChart;