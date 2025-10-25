import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import RiskBadge from "./RiskBadge";
import type { ExtendedTransaction, Decision } from "../../pages/hook/useTransactions";

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ExtendedTransaction;
  decisionHistory: Decision[];
  onAction: (decision: "fraude" | "no-fraude") => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  decisionHistory,
  onAction,
}) => {
  const mount = typeof document !== "undefined" ? document.body : null;
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!mount) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, mount]);

  // Cerrar con ESC y manejar foco interno
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => dialogRef.current?.focus(), 50);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mount || !isOpen || !transaction) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay completo */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Contenedor del modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="dialog"
            aria-modal="true"
          >
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="bg-white rounded-2xl border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-auto shadow-xl relative p-6 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón de cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                aria-label="Cerrar"
              >
                <XIcon className="h-6 w-6" />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Detalle de Transacción:{" "}
                <span className="text-blue-600">ID {transaction.id}</span>
              </h3>

              {/* Información general */}
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <p className="font-medium text-gray-500">Monto Total:</p>
                <p className="font-bold text-gray-900">S/ {transaction.monto_total.toFixed(2)}</p>

                <p className="font-medium text-gray-500">Cuenta:</p>
                <p className="text-gray-900">{transaction.cuenta}</p>

                <p className="font-medium text-gray-500">ID Tarjeta:</p>
                <p className="text-gray-900">{transaction.tarjeta_id}</p>

                <p className="font-medium text-gray-500">Fecha/Hora:</p>
                <p className="text-gray-900">
                  {new Date(transaction.fecha_hora).toLocaleString()}
                </p>

                <p className="font-medium text-gray-500">Score de Fraude:</p>
                <div>
                  <RiskBadge score={transaction.score_fraude} />
                </div>
              </div>

              {/* Productos */}
              <h4 className="text-md font-semibold text-gray-800 mt-6 mb-2 border-t pt-4">
                Productos en la Transacción
              </h4>
              <div className="max-h-48 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                {transaction.detalle_productos?.length > 0 ? (
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="py-1 px-2 text-left font-semibold text-gray-600">Producto</th>
                        <th className="py-1 px-2 text-right font-semibold text-gray-600">Cant.</th>
                        <th className="py-1 px-2 text-right font-semibold text-gray-600">Precio U.</th>
                        <th className="py-1 px-2 text-right font-semibold text-gray-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.detalle_productos.map((item, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="py-1 px-2">{item.nombre_producto}</td>
                          <td className="py-1 px-2 text-right">{item.cantidad}</td>
                          <td className="py-1 px-2 text-right">S/ {item.precio_unitario.toFixed(2)}</td>
                          <td className="py-1 px-2 text-right">S/ {item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">No hay detalle de productos disponible.</p>
                )}
              </div>

              {/* Histórico de decisiones */}
              <h4 className="text-md font-semibold text-gray-800 mt-6 mb-2 border-t pt-4">
                Histórico de Decisiones
              </h4>
              <div className="max-h-32 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                {decisionHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hay decisiones previas registradas.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {decisionHistory.map((decision, index) => (
                      <li key={index} className="text-xs text-gray-700">
                        <span className="font-semibold">{decision.revisor}</span> ({decision.cuando}):{" "}
                        {decision.resultado}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Botones */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => onAction("no-fraude")}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-400"
                >
                  Marcar como Legítimo
                </button>
                <button
                  onClick={() => onAction("fraude")}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-400"
                >
                  Marcar como Fraude
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    mount
  );
};

export default TransactionDetailModal;
