// src/components/Dashboard/TransactionFiltersModal.tsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Filters } from "../../pages/hook/useTransactions";

interface TransactionFiltersModalProps {
  isOpen: boolean;
  currentFilters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

const TransactionFiltersModal: React.FC<TransactionFiltersModalProps> = ({
  isOpen,
  currentFilters,
  onApply,
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState<Filters>(currentFilters);

  // --- Bloquear scroll del body cuando el modal está abierto ---
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // --- Sincronizar filtros cuando el modal abre ---
  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
    }
  }, [currentFilters, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue: string | number | boolean | "" = value;

    if (name === "scoreMin" || name === "scoreMax") {
      newValue = parseFloat(value);
    }

    setTempFilters({
      ...tempFilters,
      [name]: newValue,
    });
  };

  const handleApply = () => {
    onApply(tempFilters);
  };

  // --- Si no está abierto, no renderizar nada ---
  if (!isOpen) return null;

  // --- Contenido del modal ---
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // cerrar al hacer clic fuera
    >
      <div
        className="bg-white text-gray-800 border border-gray-200 rounded-2xl shadow-2xl transform transition-all duration-200 w-full max-w-lg scale-100 opacity-100 relative"
        style={{ boxShadow: "0 10px 35px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3
            id="modal-title"
            className="text-lg font-semibold text-gray-900 flex items-center gap-2"
          >
             Filtros Avanzados (Score, Cuenta y Fechas)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Ajusta rangos de Score, busca por Cuenta y define el periodo.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cliente/Cuenta */}
          <div className="sm:col-span-2">
            <label
              htmlFor="cuenta"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cliente / Cuenta (Búsqueda por coincidencia)
            </label>
            <input
              name="cuenta"
              type="text"
              placeholder="Ej: Maria Gonzalez"
              value={tempFilters.cuenta}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Score Min */}
          <div>
            <label
              htmlFor="scoreMin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Score de Riesgo (Mín)
            </label>
            <input
              name="scoreMin"
              type="number"
              min="0"
              max="100"
              value={tempFilters.scoreMin}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Score Max */}
          <div>
            <label
              htmlFor="scoreMax"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Score de Riesgo (Máx)
            </label>
            <input
              name="scoreMax"
              type="number"
              min="0"
              max="100"
              value={tempFilters.scoreMax}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Fecha Inicio */}
          <div>
            <label
              htmlFor="fechaInicio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Inicio
            </label>
            <input
              name="fechaInicio"
              type="date"
              value={tempFilters.fechaInicio}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label
              htmlFor="fechaFin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Fin
            </label>
            <input
              name="fechaFin"
              type="date"
              value={tempFilters.fechaFin}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleApply}
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );

  // --- Portal para aislar del DOM ---
  return createPortal(modalContent, document.body);
};

export default TransactionFiltersModal;
