import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import { Eye, Trash2, Rocket, X } from "lucide-react";
import type { HistoryModel } from "../../pages/hook/useModelos";
import { createPortal } from "react-dom";

export const DeployModelButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => (
  <Button variant="primary" onClick={onClick} disabled={disabled} className="w-full">
    <Rocket className="w-4 h-4" />
    Desplegar modelo
  </Button>
);

export const ModelDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  model: HistoryModel | null;
}> = ({ open, onClose, model }) => {
  const mount = typeof document !== "undefined" ? document.body : null;
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!mount) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, mount]);

  // Cerrar con Escape y poner foco en el dialog cuando abra
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // fallback simple: mantener tab dentro del modal
        const el = dialogRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          e.preventDefault();
          (el as HTMLElement).focus();
          return;
        }
        // simple trap: if focus moves out, bring it back (lightweight)
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    // poner foco
    setTimeout(() => dialogRef.current?.focus(), 50);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mount) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay: ocupa todo, incluyendo sidebar */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal container: ocupa todo y centra el dialog */}
          <motion.div
            key="container"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            aria-modal="true"
            role="dialog"
          >
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="bg-white rounded-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] p-6 relative shadow-xl overflow-auto focus:outline-none"
              onClick={(e) => e.stopPropagation()} // evitar que click interno cierre
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900">Detalles del modelo</h3>

              {model ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versión</span>
                    <span className="font-semibold">{model.version ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha</span>
                    <span className="font-semibold">{model.fecha ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Framework</span>
                    <span className="font-semibold">{model.framework ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precisión</span>
                    <span className="font-semibold">
                      {typeof model.precision === "number"
                        ? `${(model.precision * 100).toFixed(2)}%`
                        : "—"}
                    </span>
                  </div>
                  {model.notes && (
                    <div className="text-gray-600">
                      <strong>Notas:</strong>
                      <div className="mt-1 whitespace-pre-wrap">{model.notes}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 mt-3">Sin datos</div>
              )}

              <div className="mt-6 flex items-center gap-3">
                {/* Conservé tu botón de deploy; asume que existe */}
                <DeployModelButton onClick={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    mount
  );
};

export const ModelHistoryTable: React.FC<{
  data: HistoryModel[];
  onView: (m: HistoryModel) => void;
  onDelete: (version: string) => void;
}> = ({ data, onView, onDelete }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-white">
        <tr>
          {['Versión','Fecha','Framework','Precision','Acciones'].map((h) => (
            <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {data.length === 0 ? (
          <tr><td colSpan={5} className="px-3 py-3 text-center text-gray-500">No hay modelos en historial</td></tr>
        ) : data.map((m) => (
          <tr key={m.version} className="text-sm hover:bg-gray-50 transition">
            <td className="px-3 py-2 font-semibold text-blue-600">{m.version}</td>
            <td className="px-3 py-2 text-gray-600">{m.fecha}</td>
            <td className="px-3 py-2 text-gray-600">{m.framework}</td>
            <td className="px-3 py-2 font-semibold text-gray-800">{(m.precision*100).toFixed(2)}%</td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                <button onClick={() => onView(m)} className="text-gray-500 hover:text-blue-600 p-1 rounded transition" title="Ver detalles"><Eye className="w-4 h-4"/></button>
                <button onClick={() => onDelete(m.version)} className="text-gray-500 hover:text-red-600 p-1 rounded transition" title="Eliminar versión"><Trash2 className="w-4 h-4"/></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ModelHistoryTable;