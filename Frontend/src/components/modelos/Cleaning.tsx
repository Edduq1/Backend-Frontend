import React, { useMemo, useState } from "react";
import Button from "../common/Button";
import {
  CheckCircleIcon,
  CircleStackIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HashtagIcon,
  ShoppingCartIcon,
  CubeIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import type {
  DetalleTransaccion,
  DetalleTransaccionRaw,
} from "../../pages/hook/useModelos";

// ==================== CONSOLA ====================
export const CleaningLogsViewer: React.FC<{ logs: string[] }> = ({ logs }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3 h-full min-h-40 font-mono text-xs text-gray-700">
    <div className="flex items-center gap-2 mb-2 text-green-600 font-semibold">
      <CommandLineIcon className="w-4 h-4" />
      <span>Consola</span>
    </div>
    <div
      className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      style={{ maxHeight: "25em", lineHeight: "1.1em" }}
    >
      {logs.length === 0 ? (
        <div className="text-gray-500">Sin registros</div>
      ) : (
        logs.map((l, i) => (
          <div key={i} className="py-0.5 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                l.includes("⚠️")
                  ? "bg-yellow-400"
                  : l.includes("❌")
                  ? "bg-red-400"
                  : "bg-green-500"
              }`}
            />
            <span className="text-gray-800">{l}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

// ==================== BOTÓN PRINCIPAL ====================
export const ExecuteCleaningButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
}> = ({ onClick, loading }) => (
  <Button
    onClick={onClick}
    loading={!!loading}
    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-semibold rounded-lg transition flex items-center justify-center gap-2"
  >
    <WrenchScrewdriverIcon className="w-4 h-4 text-green-600" />
    Ejecutar limpieza de datos
  </Button>
);

// ==================== TABLA LIMPIA ====================
export const DataPreviewTable: React.FC<{
  data: (DetalleTransaccionRaw | DetalleTransaccion)[];
  cleaned?: boolean;
}> = ({ data, cleaned = false }) => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(true);
  const rowsPerPage = 5;
  const limited = useMemo(() => data.slice(0, 10), [data]);
  const totalPages = Math.max(1, Math.ceil(limited.length / rowsPerPage));
  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return limited.slice(start, start + rowsPerPage);
  }, [page, limited]);

  const iconFor = (h: string) => {
    const iconProps = "w-3.5 h-3.5 text-green-600";
    switch (h) {
      case "ID":
        return <HashtagIcon className={iconProps} />;
      case "TRANSACCION_ID":
        return <ShoppingCartIcon className={iconProps} />;
      case "PRODUCTO_ID":
        return <CubeIcon className={iconProps} />;
      case "CANTIDAD":
        return <ChartBarIcon className={iconProps} />;
      case "PRECIO_UNITARIO":
        return <CurrencyDollarIcon className={iconProps} />;
      case "SUBTOTAL":
        return <CalculatorIcon className={iconProps} />;
      case "CREATED_AT":
        return <ClockIcon className={iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            <ChartBarIcon className="w-4 h-4 text-green-600" />
            {cleaned ? "Datos limpios" : "Datos con nulos"}
          </h4>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-600"
            aria-label={open ? "Colapsar" : "Expandir"}
          >
            {open ? (
              <ChevronUpIcon className="w-4 h-4 text-green-600" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-green-600" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Página {page} de {totalPages}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "ID",
                      "TRANSACCION_ID",
                      "PRODUCTO_ID",
                      "CANTIDAD",
                      "PRECIO_UNITARIO",
                      "SUBTOTAL",
                      "CREATED_AT",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          {iconFor(h)} <span>{h}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-3 text-center text-gray-500">
                        Sin datos
                      </td>
                    </tr>
                  ) : (
                    pageData.map((r: any) => (
                      <tr key={r.id} className="text-sm hover:bg-gray-50 transition">
                        <td className="px-3 py-2 font-semibold text-gray-700">{r.id}</td>
                        <td
                          className={`px-3 py-2 ${
                            r.transaccion_id == null
                              ? "text-red-700 bg-red-50"
                              : "text-gray-700"
                          }`}
                        >
                          {r.transaccion_id ?? "NULL"}
                        </td>
                        <td
                          className={`px-3 py-2 ${
                            r.producto_id == null
                              ? "text-red-700 bg-red-50"
                              : "text-gray-700"
                          }`}
                        >
                          {r.producto_id ?? "NULL"}
                        </td>
                        <td
                          className={`px-3 py-2 ${
                            r.cantidad == null
                              ? "text-red-700 bg-red-50"
                              : "text-gray-700"
                          }`}
                        >
                          {r.cantidad ?? "NULL"}
                        </td>
                        <td
                          className={`px-3 py-2 ${
                            r.precio_unitario == null
                              ? "text-red-700 bg-red-50"
                              : "text-gray-700"
                          }`}
                        >
                          {r.precio_unitario ?? "NULL"}
                        </td>
                        <td className="px-3 py-2 text-gray-800 font-medium">
                          {r.subtotal ??
                            (cleaned &&
                            r.cantidad != null &&
                            r.precio_unitario != null ? (
                              parseFloat((r.cantidad * r.precio_unitario).toFixed(2))
                            ) : (
                              <span className="text-red-700">NULL</span>
                            ))}
                        </td>
                        <td
                          className={`px-3 py-2 ${
                            r.created_at == null
                              ? "text-red-700 bg-red-50"
                              : "text-gray-700"
                          }`}
                        >
                          {r.created_at ?? "NULL"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 flex items-center justify-end gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 text-xs rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 text-xs rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== PANEL GENERAL ====================
export const DataCleaningPanel: React.FC<{
  steps: { label: string; done: boolean }[];
  onExecute: () => void;
  logs: string[];
  raw: DetalleTransaccionRaw[];
  clean: DetalleTransaccion[];
  running?: boolean;
  completed?: boolean;
}> = ({
  steps,
  onExecute,
  logs,
  raw,
  clean,
  running = false,
  completed = false,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Checklist de limpieza
          </h3>
        </div>

        <ul className="space-y-2">
          {steps.map((s, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {s.done ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              ) : (
                <CircleStackIcon className="w-4 h-4 text-gray-400" />
              )}
              <span
                className={`text-sm ${
                  s.done ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <ExecuteCleaningButton onClick={onExecute} loading={running} />
          {!completed && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-green-600" />
              Ejecuta la limpieza para continuar al entrenamiento.
            </div>
          )}
        </div>

        <div className="mt-4 flex-1 min-h-0">
          <CleaningLogsViewer logs={logs} />
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <DataPreviewTable data={raw} cleaned={false} />
        <DataPreviewTable data={clean} cleaned={true} />
      </div>
    </div>
  );
};

export default DataCleaningPanel;
