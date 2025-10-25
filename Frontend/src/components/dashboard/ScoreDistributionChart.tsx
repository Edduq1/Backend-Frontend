import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import type { ScoreDistribution } from '../../pages/hook/useDashboard';
import { PRIMARY_COLOR } from '../../pages/hook/useDashboard';

interface ScoreDistributionChartProps {
  data: ScoreDistribution[];
  isLoading: boolean;
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 h-80 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4">Distribución de Score de Fraude</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }} 
            />
            <Legend />
            <ReferenceLine 
              y={0} 
              stroke="#000" 
            />
            <ReferenceLine 
              y={700} 
              label={{ 
                value: 'Umbral de Corte', 
                position: 'top', 
                fill: '#FF8C00',
                fontSize: 12
              }} 
              stroke="#FF8C00" 
              strokeDasharray="3 3" 
            />
            <Bar 
              dataKey="count" 
              name="Frecuencia" 
              fill={PRIMARY_COLOR} 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreDistributionChart;