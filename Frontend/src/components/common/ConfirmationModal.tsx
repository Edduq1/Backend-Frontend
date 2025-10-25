import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ConfirmationModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: "blue" | "red";
};

const fontStyle: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonColor = "blue",
}) => {
  const [visible, setVisible] = useState(open);

  // 🔹 Controla animación de salida
  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onCancel, 200); // coincide con la duración de la animación
  };

  if (!open && !visible) return null;

  const confirmButtonClasses =
    confirmButtonColor === "red"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  const modal = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0"
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={fontStyle}
    >
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Contenedor del modal */}
      <div
        className={`relative z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-200 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              setVisible(false);
              setTimeout(onConfirm, 200);
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${confirmButtonClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ConfirmationModal;
