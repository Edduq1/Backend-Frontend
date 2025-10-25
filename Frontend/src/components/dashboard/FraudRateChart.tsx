import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { ChartData } from '../../pages/hook/useDashboard';
import { FRAUD_COLOR, PRIMARY_COLOR } from '../../pages/hook/useDashboard';

interface FraudRateChartProps {
  data: ChartData[];
  isLoading: boolean;
}

const FraudRateChart: React.FC<FraudRateChartProps> = ({ data, isLoading }) => {
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
      <h3 className="text-lg font-semibold mb-4">Tasa de Fraude vs Volumen Total</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="timestamp" />
            <YAxis yAxisId="left" orientation="left" stroke={FRAUD_COLOR} />
            <YAxis yAxisId="right" orientation="right" stroke={PRIMARY_COLOR} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }} 
            />
            <Legend />
            <Bar 
              yAxisId="right" 
              dataKey="totalVolume" 
              name="Volumen Total" 
              fill={PRIMARY_COLOR} 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="fraudRate"
              name="Tasa de Fraude (%)"
              stroke={FRAUD_COLOR}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FraudRateChart;