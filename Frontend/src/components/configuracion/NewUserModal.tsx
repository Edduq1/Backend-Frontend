import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelector from './RoleSelector';
import PermissionPanel from './PermissionPanel';
import type { Rol, PermisosPorRol } from '../../pages/hook/useConfiguracion';
import { UserPlus, X, IdCard, Mail, Camera } from 'lucide-react';
import { createPortal } from "react-dom";
import FacialRegisterSection from '../../auth/ui/FacialRegisterSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dni: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
  autoCompleto: boolean;
  errorDni?: string | null;
  onChangeDni: (dni: string) => void;
  onChangeRol: (rol: Rol) => void;
  onSave: () => void;
  permisosPorRol: PermisosPorRol;
  // nuevos props
  email: string;
  errorEmail?: string | null;
  onChangeEmail: (email: string) => void;
  modalSection: 'form' | 'face';
  faceRegStatus: 'idle' | 'ready' | 'capturing' | 'done';
  onStartFacial: () => void;
  onFinishFacial: () => void;
}

const NewUserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  dni,
  nombres,
  apellidos,
  rol,
  autoCompleto,
  errorDni,
  onChangeDni,
  onChangeRol,
  onSave,
  permisosPorRol,
  email,
  errorEmail,
  onChangeEmail,
  modalSection,
  faceRegStatus,
  onStartFacial,
  onFinishFacial,
}) => {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-sm bg-black/40"
          onClick={onClose}
        >
          {/* Contenedor del modal */}
          <motion.div
            key="container"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="relative z-[9999] bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl w-[98%] max-w-6xl max-h-[92vh] overflow-auto flex flex-col border border-white/40"
            onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro
          >
            {/* Encabezado */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalSection === 'form' ? (
                  <UserPlus className="w-5 h-5 text-[#FD993B]" />
                ) : (
                  <Camera className="w-5 h-5 text-[#FD993B]" />
                )}
                <h3 className="text-base font-semibold text-gray-800">
                  {modalSection === 'form' ? 'Nuevo Usuario' : 'Registro Facial'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto space-y-8">
              {modalSection === 'form' && (
                <>
                  {/* Formulario */}
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-gray-600" /> DNI
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        value={dni}
                        onChange={(e) => {
                          // Filtra solo números
                          const value = e.target.value.replace(/\D/g, "");
                          // Limita a 8 caracteres
                          if (value.length <= 8) {
                            onChangeDni(value);
                          }
                        }}
                        placeholder="Ingrese DNI (8 dígitos)"
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
                      />

                      {errorDni && (
                        <p className="mt-1 text-xs text-red-600">{errorDni}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Nombres</label>
                        <input
                          type="text"
                          value={nombres}
                          readOnly
                          className={`mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 ${
                            autoCompleto
                              ? 'border-green-200 text-gray-800'
                              : 'border-gray-200 text-gray-500'
                          }`}
                          placeholder="Autocompletado"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Apellidos</label>
                        <input
                          type="text"
                          value={apellidos}
                          readOnly
                          className={`mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 ${
                            autoCompleto
                              ? 'border-green-200 text-gray-800'
                              : 'border-gray-200 text-gray-500'
                          }`}
                          placeholder="Autocompletado"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" /> Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => onChangeEmail(e.target.value)}
                        placeholder="usuario@dominio.com"
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
                      />
                      {errorEmail && (
                        <p className="mt-1 text-xs text-red-600">{errorEmail}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <RoleSelector value={rol} onChange={onChangeRol} />
                      <button
                        onClick={onSave}
                        className="px-4 py-2 rounded-lg bg-[#FD993B] text-white text-sm font-medium hover:brightness-110 transition"
                      >
                        Guardar Usuario
                      </button>
                    </div>
                  </div>

                  {/* Permisos */}
                  <div className="pt-4 border-t border-gray-200">
                    <PermissionPanel rol={rol} permisosPorRol={permisosPorRol} />
                  </div>
                </>
              )}

              {modalSection === 'face' && (
                <FacialRegisterSection
                  status={faceRegStatus}
                  onStart={onStartFacial}
                  onFinish={onFinishFacial}
                  displayName={`${nombres} ${apellidos}`.trim() || undefined}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body 
  );
};

export default NewUserModal;
