import React, { useState } from "react";
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  BanknotesIcon,
  TrashIcon,
  HashtagIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactions } from "../hook/useTransactions";
import type { Transaction, Filters } from "../hook/useTransactions";
import RiskBadge from "../../components/transacciones/RiskBadge";
import StatusTag from "../../components/transacciones/StatusTag";
import TransactionDetailModal from "../../components/transacciones/TransactionDetailModal";
import TransactionFiltersModal from "../../components/transacciones/TransactionFiltersModal";
import StatusDropdown from "../../components/transacciones/StatusDropdown";
import EtiquetaDropdown from "../../components/transacciones/EtiquetaDropdown";

const TransactionRow: React.FC<{
  trx: Transaction;
  onViewDetails: (e: React.MouseEvent, trx: Transaction) => void;
}> = ({ trx, onViewDetails }) => {
  const saldo = (
    trx.estado === "PENDIENTE" || trx.es_fraude === true
      ? trx.monto_total
      : 0.0
  ).toFixed(2);

  const shortDate = trx.fecha_hora
    ? new Date(trx.fecha_hora).toLocaleDateString()
    : "N/A";

  return (
    <tr key={trx.id} className="text-sm hover:bg-gray-50 transition">
      <td className="px-3 py-2 font-semibold text-blue-600">{trx.id}</td>
      <td className="px-3 py-2 text-gray-600">{shortDate}</td>
      <td className="px-3 py-2 font-medium text-gray-900">{trx.cuenta}</td>
      <td className="px-3 py-2">
        <span
          className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center"
          title={trx.tipo_comercio}
        >
          {trx.tipo_comercio.charAt(0)}
        </span>
      </td>
      <td className="px-3 py-2">
        <StatusTag estado={trx.estado as any} />
      </td>
      <td className="px-3 py-2">
        <RiskBadge score={trx.score_fraude} />
      </td>
      <td className="px-3 py-2 font-bold text-gray-800">
        S/ {trx.monto_total.toFixed(2)}
      </td>
      <td className="px-3 py-2 font-bold text-red-500">S/ {saldo}</td>
      <td className="px-3 py-2 text-center">
        <button
          onClick={(e) => onViewDetails(e, trx)}
          className="text-gray-500 hover:text-blue-600 p-1 rounded transition"
          title="Ver detalles"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

const TransactionExplorer: React.FC = () => {
  const {
    transactions,
    loading,
    currentPage,
    totalPages,
    filters,
    searchTerm,
    selectedTransaction,
    isDetailModalOpen,
    isFiltersModalOpen,
    decisionHistory,
    totalMonto,
    totalSaldo,
    setCurrentPage,
    setSearchTerm,
    setFilters,
    setIsFiltersModalOpen,
    fetchTransactions,
    handleApplyFilters,
    handleViewDetails,
    handleCloseDetailModal,
    handleAction,
    clearAllFilters,
    showAllTransactions,
  } = useTransactions();

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [exporting] = useState(false);

  const handleSetFilter = (name: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const simulateExport = () => {
    window.print();
  };

  const handleRowViewDetails = (
    event: React.MouseEvent,
    transaction: Transaction
  ) => {
    event.stopPropagation();
    handleViewDetails(transaction);
  };

  return (
 <AnimatePresence mode="wait">
    <motion.div
      key="transaction-explorer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-white-50 p-6 sm:p-10 font-sans"
    >
    {/* ENCABEZADO */}
    <div className="relative mb-10 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
          <BanknotesIcon className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
            Explorador de Transacciones
          </h1>
          <p className="text-blue-100 font-medium mt-1">
            Visualiza, filtra y exporta operaciones de manera rápida y segura.
          </p>
        </div>
      </div>
    </div>

    {/* BARRA DE ACCIONES (Modificado) */}
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-lg shadow-md border border-blue-100">
      <input
        type="text"
        placeholder="Buscar por cuenta o ID..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && fetchTransactions()}
        className="flex-grow min-w-[200px] border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
      />

      <button
        onClick={() => setFiltersVisible((prev) => !prev)}
        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium"
      >
        <FunnelIcon className="w-5 h-5" />
        {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
      </button>

      <button
        onClick={showAllTransactions}
        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium"
        title="Quitar todos los filtros y mostrar el historial completo"
      >
        <EyeIcon className="w-5 h-5" />
        Mostrar Todo
      </button>
      {/* FIN de Botones Limpiar y Mostrar Todo */}


      <button
        onClick={simulateExport}
        disabled={exporting}
        className={`flex items-center gap-2 ${
          exporting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white px-4 py-2 rounded-lg transition font-medium shadow-sm`}
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        {exporting ? "Exportando..." : "Exportar CSV"}
      </button>
    </div>

    {/* FILTROS EXPANDIBLES (Añadido 'Tipo de Comercio' y botón de avanzada) */}
<div
  className={`transition-all duration-500 overflow-hidden ${
    filtersVisible ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
  }`}
>
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-md border border-blue-100">
    {/* === Sección Izquierda (estado, tipo, score/cuenta) === */}
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-col">
        <StatusDropdown
          currentStatus={filters.estado}
          onChange={(estado) => handleSetFilter("estado", estado)}
        />
      </div>

      <div className="flex flex-col">
        <EtiquetaDropdown
          currentEtiqueta={filters.etiqueta}
          onChange={(etiqueta) => handleSetFilter("etiqueta", etiqueta)}
        />
      </div>

      <button
        onClick={() => setIsFiltersModalOpen(true)}
        className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium border border-blue-200"
      >
        Score / Cuenta / Fechas
      </button>
    </div>

    {/* === Sección Derecha (limpiar filtros) === */}
    <button
      onClick={clearAllFilters}
      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium border border-blue-300"
      title="Limpiar todos los filtros y la búsqueda"
    >
      <TrashIcon className="w-5 h-5" />
      Limpiar filtros
    </button>
  </div>
</div>
{/* TABLA */}
    <div className="bg-white p-6 rounded-xl shadow-xl border border-blue-100">
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Cargando transacciones...
        </div>
      ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <HashtagIcon className="w-4 h-4 text-blue-500" />
                      Número
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                      Fecha
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      Cliente / Cuenta
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <TagIcon className="w-4 h-4 text-blue-500" />
                      Tipo
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Cog6ToothIcon className="w-4 h-4 text-blue-500" />
                      Estado
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4 text-blue-500" />
                      Riesgo
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <BanknotesIcon className="w-4 h-4 text-blue-500" />
                      Total (S/)
                    </span>
                  </th>

                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <WalletIcon className="w-4 h-4 text-blue-500" />
                      Saldo (S/)
                    </span>
                  </th>

                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1">
                      <EyeIcon className="w-4 h-4 text-blue-500" />
                      Acciones
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No se encontraron transacciones.
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <TransactionRow
                      key={trx.id}
                      trx={trx}
                      onViewDetails={handleRowViewDetails}
                    />
                  ))
                )}
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-3 text-right font-bold text-gray-800"
                  >
                    Totales:
                  </td>
                  <td className="px-3 py-3 font-bold text-gray-800 border-t-2 border-gray-300">
                    S/ {totalMonto.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 font-bold text-red-500 border-t-2 border-gray-300">
                    S/ {totalSaldo.toFixed(2)}
                  </td>
                  <td className="border-t-2 border-gray-300"></td>
                </tr>
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-700">
                Mostrando {transactions.length} transacciones
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODALES */}
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          transaction={selectedTransaction}
          decisionHistory={decisionHistory}
          onAction={handleAction}
        />
      )}

      <TransactionFiltersModal
        isOpen={isFiltersModalOpen}
        currentFilters={filters}
        onApply={handleApplyFilters}
        onClose={() => setIsFiltersModalOpen(false)}
      />
     </motion.div>
   </AnimatePresence>
  );
};

export default TransactionExplorer;
