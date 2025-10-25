import React, { useState, useEffect } from "react";
import { useDashboard } from "../hook/useDashboard";
import KPISection from "../../components/dashboard/KPISection";
import FraudRateChart from "../../components/dashboard/FraudRateChart";
import ScoreDistributionChart from "../../components/dashboard/ScoreDistributionChart";
import FraudAlert from "../../components/dashboard/FraudAlert";
import TimeRangeSelector from "../../components/dashboard/TimeRangeSelector";
import { BarChart3, PieChart, AlertTriangle } from "lucide-react";

// Página principal del Dashboard
const Dashboard: React.FC = () => {
  const [alertVisible, setAlertVisible] = useState(true);
  
  const {
    timeRange,
    setTimeRange,
    kpiData,
    chartData,
    scoreDistribution,
    isLoading,
  } = useDashboard();

  // Mostrar alerta cuando la tasa de fraude es alta
  useEffect(() => {
    if (kpiData?.isFraudRateHigh) {
      setAlertVisible(true);
    }
  }, [kpiData]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alerta de fraude */}
      {kpiData?.isFraudRateHigh && (
        <FraudAlert isVisible={alertVisible} onClose={() => setAlertVisible(false)} />
      )}

      {/* Selector de rango de tiempo */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Resumen de Fraude</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Sección de KPIs */}
      <div className="mb-6">
        <KPISection data={kpiData || {
          totalTransactions: 0,
          fraudRate: 0,
          falsePositiveRate: 0,
          averageModelScore: 0,
          isFraudRateHigh: false
        }} isLoading={isLoading} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FraudRateChart data={chartData} isLoading={isLoading} />
        <ScoreDistributionChart data={scoreDistribution} isLoading={isLoading} />
      </div>

      {/* Sección de información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-50 rounded-full mr-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">Análisis Detallado</h3>
          </div>
          <p className="text-sm text-gray-600">
            Accede a análisis detallados de patrones de fraude y comportamiento de usuarios.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-green-50 rounded-full mr-3">
              <PieChart className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">Reportes</h3>
          </div>
          <p className="text-sm text-gray-600">
            Genera reportes personalizados para diferentes períodos y métricas de fraude.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-red-50 rounded-full mr-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-lg font-medium">Alertas</h3>
          </div>
          <p className="text-sm text-gray-600">
            Configura alertas personalizadas para recibir notificaciones sobre actividades sospechosas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
