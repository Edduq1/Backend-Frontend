import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAlerts } from "../hook/useAlerts";
import { AlertFilters } from "../../components/alertas/AlertFilters";
import { AlertCard } from "../../components/alertas/AlertCard";
import AlertDetalle from "../../components/alertas/AlertDetalle";
import {
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";

const AlertaDashboard: React.FC = () => {
  const {
    alerts,
    loading,
    filters,
    setFilters,
    HIGH_SCORE_THRESHOLD,
  } = useAlerts();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

useEffect(() => {
  if (selectedAlert) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto"; 
  }

  return () => {
    document.body.style.overflow = "auto"; 
  };
}, [selectedAlert]);

  return (
    <motion.div
      className="min-h-screen bg-white-50 p-6 sm:p-10 font-sans"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Toaster />

      {/* ENCABEZADO */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mb-10 bg-gradient-to-r from-red-800 via-red-700 to-red-600 text-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
            <ExclamationTriangleIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
              Bandeja de Alertas de Fraude
            </h1>
            <p className="text-red-100 font-medium mt-1">
              Monitorea y gestiona las alertas de fraude detectadas.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CONTROLES */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap justify-between items-center mb-6 gap-4 p-4 bg-white rounded-xl shadow-md border border-red-100"
      >
        <p className="text-gray-700 font-medium flex items-center gap-2">
          <ShieldExclamationIcon className="w-5 h-5 text-red-600" />
          Mostrando alertas activas de riesgo bancario
        </p>

        <button
          onClick={toggleViewMode}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition font-medium"
        >
          {viewMode === "grid" ? (
            <>
              <ListBulletIcon className="w-5 h-5" />
            </>
          ) : (
            <>
              <Squares2X2Icon className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>

      {/* FILTROS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-8"
      >
        <AlertFilters
          currentFilters={filters}
          onFilterChange={setFilters}
          highScore={HIGH_SCORE_THRESHOLD}
        />
      </motion.div>

      {/* LISTA / GRID DE ALERTAS */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10 text-gray-500"
          >
            Cargando alertas...
          </motion.div>
        ) : (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Alertas Encontradas:{" "}
              <span className="text-red-700">{alerts.length}</span>
            </h2>

            {alerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-lg border border-gray-100"
              >
                <ShieldExclamationIcon className="w-10 h-10 mx-auto text-red-400 mb-2" />
                No hay alertas que cumplan los criterios de filtro.
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-4"
                }
              >
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onShowDetail={() => setSelectedAlert(alert)}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETALLE DE ALERTA */}
      <AnimatePresence>
        {selectedAlert && (
          <AlertDetalle
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlertaDashboard;
