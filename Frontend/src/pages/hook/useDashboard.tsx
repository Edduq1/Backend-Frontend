import { useState, useEffect } from 'react';

// Definición de tipos
export type TimeRange = '24h' | '7d' | '30d';

export interface KPIData {
  totalTransactions: number;
  fraudRate: number;
  falsePositiveRate: number;
  averageModelScore: number;
  isFraudRateHigh: boolean;
}

export interface ChartData {
  timestamp: string;
  fraudRate: number;
  totalVolume: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

// Constantes para colores
export const PRIMARY_COLOR = '#007BFF';
export const FRAUD_COLOR = '#FF3B30';
export const SUCCESS_COLOR = '#28A745';
export const WARNING_COLOR = '#FFC107';

// Hook personalizado para la lógica del Dashboard
export const useDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para generar datos simulados basados en el timeRange
  useEffect(() => {
    setIsLoading(true);
    
    // Simulamos una carga de datos
    setTimeout(() => {
      // Generamos datos KPI según el timeRange
      const generateKPIData = (): KPIData => {
        const fraudRateValue = timeRange === '24h' 
          ? 2.8 + Math.random() * 1.5 
          : timeRange === '7d' 
            ? 2.2 + Math.random() * 1.2 
            : 1.8 + Math.random();
        
        // Simulamos un pico de fraude para mostrar la alerta
        const isFraudHigh = fraudRateValue > 3.0;
        
        return {
          totalTransactions: timeRange === '24h' 
            ? Math.floor(5000 + Math.random() * 2000) 
            : timeRange === '7d' 
              ? Math.floor(35000 + Math.random() * 10000) 
              : Math.floor(150000 + Math.random() * 50000),
          fraudRate: parseFloat(fraudRateValue.toFixed(2)),
          falsePositiveRate: parseFloat((0.5 + Math.random() * 1.2).toFixed(2)),
          averageModelScore: parseFloat((75 + Math.random() * 15).toFixed(1)),
          isFraudRateHigh: isFraudHigh
        };
      };

      // Generamos datos para el gráfico de línea/barras
      const generateChartData = (): ChartData[] => {
        const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
        const data: ChartData[] = [];
        
        for (let i = 0; i < dataPoints; i++) {
          const baseVolume = timeRange === '24h' 
            ? 200 + Math.random() * 300 
            : timeRange === '7d' 
              ? 5000 + Math.random() * 2000 
              : 20000 + Math.random() * 5000;
          
          // Simulamos algunos picos de fraude
          const fraudSpike = Math.random() > 0.85;
          const fraudRate = fraudSpike 
            ? (3.0 + Math.random() * 2.0) 
            : (1.0 + Math.random() * 1.8);
          
          const label = timeRange === '24h' 
            ? `${i}:00` 
            : timeRange === '7d' 
              ? `Día ${i+1}` 
              : `Día ${i+1}`;
          
          data.push({
            timestamp: label,
            fraudRate: parseFloat(fraudRate.toFixed(2)),
            totalVolume: Math.floor(baseVolume)
          });
        }
        
        return data;
      };

      // Generamos datos para la distribución de score
      const generateScoreDistribution = (): ScoreDistribution[] => {
        const ranges = ['0-20', '21-40', '41-60', '61-80', '81-90', '91-95', '96-100'];
        return ranges.map(range => {
          // Simulamos una distribución donde los scores más altos son más frecuentes
          let count;
          if (range === '0-20') count = Math.floor(50 + Math.random() * 100);
          else if (range === '21-40') count = Math.floor(100 + Math.random() * 150);
          else if (range === '41-60') count = Math.floor(200 + Math.random() * 200);
          else if (range === '61-80') count = Math.floor(300 + Math.random() * 300);
          else if (range === '81-90') count = Math.floor(500 + Math.random() * 400);
          else if (range === '91-95') count = Math.floor(800 + Math.random() * 500); // Umbral de corte
          else count = Math.floor(400 + Math.random() * 300);
          
          return { range, count };
        });
      };

      // Actualizamos el estado con los datos generados
      setKpiData(generateKPIData());
      setChartData(generateChartData());
      setScoreDistribution(generateScoreDistribution());
      setIsLoading(false);
    }, 800); // Simulamos un tiempo de carga
  }, [timeRange]);

  return {
    timeRange,
    setTimeRange,
    kpiData,
    chartData,
    scoreDistribution,
    isLoading,
    colors: {
      primary: PRIMARY_COLOR,
      fraud: FRAUD_COLOR,
      success: SUCCESS_COLOR,
      warning: WARNING_COLOR
    }
  };
};