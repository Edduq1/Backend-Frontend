import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDoubleUpIcon,
  TrashIcon,
  ClockIcon,
  XMarkIcon, // Importar icono para cerrar el modal
} from "@heroicons/react/24/solid";

// =============================================================
// 1. Tipos de Datos (Sin Cambios)
// =============================================================
interface Pendiente {
  id: number;
  titulo: string;
  descripcion: string;
  color: string;
  importancia: "Crítico" | "Importante" | "Normal" | "Informativo";
  completado: boolean;
  fechaInicio: string;
  fechaLimite: string;
}

interface PendientesProps {
  selectedDate?: Date | null;
  mostrarTodos?: boolean;
  onMostrarTodos?: () => void;
  onTareasChange?: (fechas: string[]) => void;
}

// =============================================================
// 2. Constantes y Utilidades (Sin Cambios)
// =============================================================
const colorOptions = [
  { label: "Crítico", color: "bg-red-200 border-red-600" },
  { label: "Importante", color: "bg-yellow-200 border-yellow-500" },
  { label: "Normal", color: "bg-green-200 border-green-500" },
  { label: "Informativo", color: "bg-blue-200 border-blue-500" },
  { label: "Personalizado", color: "bg-purple-200 border-purple-500" },
  { label: "Neutro", color: "bg-gray-200 border-gray-400" },
];

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn("Error al guardar en localStorage");
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// =============================================================
// 🆕 3. Componente de Modal Simple (usando Tailwind)
// =============================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // 🔒 Bloquea scroll
    } else {
      document.body.style.overflow = ""; // 🔓 Restaura scroll
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg 
                   max-h-[90vh] overflow-y-auto transform transition-all 
                   duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // evita que se cierre al hacer clic dentro
      >
        {/* Header del modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// =============================================================
// 4. Componente Principal Pendientes
// =============================================================
const Pendientes: React.FC<PendientesProps> = ({
  selectedDate = null,
  mostrarTodos = false,
  onMostrarTodos,
  onTareasChange,
}) => {
  const [pendientes, setPendientes] = useLocalStorage<Pendiente[]>(
    "pendientes_v4",
    []
  );

  const [nuevo, setNuevo] = useState({
    titulo: "",
    descripcion: "",
    color: colorOptions[2].color,
    importancia: "Normal" as Pendiente["importancia"],
    fechaInicio: "",
    fechaLimite: "",
  });

  const [showForm, setShowForm] = useState(false); // Sigue controlando la visibilidad del modal
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  // Mantenemos los useEffects de limpieza/validación
  useEffect(() => {
    if (!showForm) {
      setErrorMensaje(null);
    }
  }, [showForm]);

  useEffect(() => {
    setErrorMensaje(null);
  }, [nuevo.titulo, nuevo.descripcion, nuevo.fechaInicio, nuevo.fechaLimite]);

  // ... (Efectos y Filtrado: sin cambios) ...

  useEffect(() => {
    if (onTareasChange) {
      const fechasConTareas = new Set<string>();
      pendientes.forEach((p) => {
        if (p.fechaInicio) {
          fechasConTareas.add(new Date(p.fechaInicio).toISOString().split("T")[0]);
        }
        if (p.fechaLimite) {
          fechasConTareas.add(new Date(p.fechaLimite).toISOString().split("T")[0]);
        }
      });
      onTareasChange(Array.from(fechasConTareas));
    }
  }, [pendientes, onTareasChange]);


  const pendientesFiltrados = useMemo(() => {
    let listaFiltrada = pendientes;

    if (!mostrarTodos && selectedDate) {
      const diaSeleccionado = selectedDate.toISOString().split("T")[0];
      listaFiltrada = pendientes.filter((p) => {
        const matchInicio = p.fechaInicio
          ? new Date(p.fechaInicio).toISOString().split("T")[0] === diaSeleccionado
          : false;

        const matchLimite = p.fechaLimite
          ? new Date(p.fechaLimite).toISOString().split("T")[0] === diaSeleccionado
          : false;

        return matchInicio || matchLimite;
      });
    }

    return listaFiltrada.sort((a, b) => {
      const fa = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const fb = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return fb - fa;
    });
  }, [pendientes, selectedDate, mostrarTodos]);

  // === FUNCIONES DE CRUD ===
  const agregarPendiente = useCallback(() => {
    setErrorMensaje(null);

    // VALIDACIÓN: Todos los campos son obligatorios
    if (!nuevo.titulo.trim() || !nuevo.descripcion.trim() || !nuevo.fechaInicio.trim() || !nuevo.fechaLimite.trim()) {
      setErrorMensaje("Todos los campos (Título, Descripción, Fecha de Inicio y Fecha Límite) son obligatorios.");
      return;
    }

    const ahora = new Date();
    const inicio = new Date(nuevo.fechaInicio);
    const limite = new Date(nuevo.fechaLimite);

    // Validación de fechas
    if (limite.getTime() < ahora.getTime()) {
      setErrorMensaje(" La fecha/hora límite no puede ser anterior a este momento.");
      return;
    }
    if (inicio > limite) {
      setErrorMensaje("La fecha de inicio no puede ser posterior a la fecha límite.");
      return;
    }

    const nuevaTarea: Pendiente = {
      id: Date.now(),
      titulo: nuevo.titulo,
      descripcion: nuevo.descripcion,
      color: nuevo.color,
      importancia: nuevo.importancia,
      completado: false,
      fechaInicio: nuevo.fechaInicio,
      fechaLimite: nuevo.fechaLimite,
    };

    setPendientes((prev) => [nuevaTarea, ...prev]);

    // Resetear formulario y cerrar modal
    setNuevo({
      titulo: "",
      descripcion: "",
      color: colorOptions[2].color,
      importancia: "Normal",
      fechaInicio: "",
      fechaLimite: "",
    });
    setShowForm(false); // Cierra el modal
    setErrorMensaje(null);
  }, [nuevo, setPendientes]);

  const toggleCompletado = useCallback((id: number) => {
    setPendientes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completado: !p.completado } : p))
    );
  }, [setPendientes]);

  const eliminarPendiente = useCallback((id: number) => {
    setPendientes((prev) => prev.filter((p) => p.id !== id));
  }, [setPendientes]);

  // === RENDERING DATA ===
  const tareasActivas = pendientesFiltrados.filter((p) => !p.completado);
  const tareasCompletadas = pendientesFiltrados.filter((p) => p.completado);

  const iconoPorImportancia = (nivel: string) => {
    switch (nivel) {
      case "Crítico":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case "Importante":
        return <FireIcon className="h-5 w-5 text-yellow-600" />;
      case "Informativo":
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ChevronDoubleUpIcon className="h-5 w-5 text-green-600" />;
    }
  };

  const hoyISO = new Date().toISOString().slice(0, 16);

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
          Lista de Tareas
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(true); // Abre el modal
              setErrorMensaje(null);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
          >
            <PlusIcon className="h-5 w-5" /> Nuevo
          </button>

          {/* Botón "Mostrar todo" */}
          {pendientes.length > 0 && selectedDate && !mostrarTodos && (
            <button
              onClick={onMostrarTodos}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Mostrar Todo ({pendientes.length})
            </button>
          )}
        </div>
      </div>

      {/* MODAL DEL FORMULARIO DE NUEVO PENDIENTE */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Crear Nueva Tarea Pendiente"
      >
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          {/* MENSAJE DE ERROR CON ESTILO */}
          {errorMensaje && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2 font-medium">
              <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: errorMensaje }} />
            </div>
          )}

          <input
            type="text"
            placeholder="Título (Obligatorio)..."
            value={nuevo.titulo}
            onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
            className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Descripción (Obligatorio)..."
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* FECHAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Fecha y hora de inicio (Obligatorio):
              </label>
              <input
                type="datetime-local"
                min={hoyISO}
                value={nuevo.fechaInicio}
                onChange={(e) =>
                  setNuevo({ ...nuevo, fechaInicio: e.target.value })
                }
                className="w-full border rounded-md px-2 py-1 mt-1 focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Fecha y hora límite (Obligatorio):
              </label>
              <input
                type="datetime-local"
                min={hoyISO}
                value={nuevo.fechaLimite}
                onChange={(e) =>
                  setNuevo({ ...nuevo, fechaLimite: e.target.value })
                }
                className="w-full border rounded-md px-2 py-1 mt-1 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* COLORES */}
          <div className="flex items-center gap-3 mb-3">
            <label className="font-semibold text-gray-700 text-sm">Color:</label>
            {colorOptions.map((c) => (
              <button
                key={c.color}
                onClick={() => setNuevo({ ...nuevo, color: c.color })}
                className={`w-6 h-6 rounded-full ${c.color.split(" ")[0]} ${
                  nuevo.color === c.color ? "ring-2 ring-purple-600 ring-offset-2" : ""
                } transition`}
                title={c.label}
              />
            ))}
          </div>

          {/* IMPORTANCIA */}
          <div className="flex items-center gap-3 mb-3">
            <label className="font-semibold text-gray-700 text-sm">
              Nivel de Importancia:
            </label>
            <select
              value={nuevo.importancia}
              onChange={(e) =>
                setNuevo({
                  ...nuevo,
                  importancia: e.target.value as Pendiente["importancia"],
                })
              }
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="Crítico">Crítico</option>
              <option value="Importante">Importante</option>
              <option value="Normal">Normal</option>
              <option value="Informativo">Informativo</option>
            </select>
          </div>

          <button
            onClick={agregarPendiente}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition mt-4"
          >
            Guardar Tarea
          </button>
        </div>
      </Modal>

      {/* LISTADO DE ACTIVAS (Sin cambios estructurales mayores) */}
      <h4 className="text-gray-700 font-semibold mb-2">Pendientes</h4>
      {tareasActivas.length === 0 ? (
        <p className="text-gray-500 text-sm mb-4">
          {selectedDate && !mostrarTodos
            ? `No hay pendientes para el ${selectedDate.toLocaleDateString("es-ES", { day: 'numeric', month: 'long' })}.`
            : "No hay tareas pendientes en general."}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-4 mb-6">
          {/* ... (Mapeo de tareas activas) ... */}
          {tareasActivas.map((p) => {
            const vencida =
              new Date(p.fechaLimite) < new Date();

            return (
              <li
              key={p.id}
              className={`
                border rounded-lg p-3 flex flex-col justify-between gap-3 
                ${p.color} bg-opacity-50 transition-all 
                shadow-md hover:shadow-lg relative 
                w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)] 
                ${
                  vencida 
                    ? "border-red-500 bg-red-100/70 scale-100" 
                    : "border-opacity-40"
                }
              `}
            >
              {/* Contenido de la tarea */}
              <div className="flex-1 flex items-start gap-2">
                {iconoPorImportancia(p.importancia)}
                <div>
                  <h4
                    className={`font-extrabold text-base ${
                      vencida ? "text-red-700" : "text-gray-800"
                    }`}
                  >
                    {p.titulo}
                  </h4>
                  <p className="text-gray-700 text-sm">{p.descripcion}</p>

                  {(p.fechaInicio || p.fechaLimite) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-600">
                      <ClockIcon className="h-4 w-4 text-purple-600" />
                      {p.fechaInicio && (
                        <span>
                          Inicio: {new Date(p.fechaInicio).toLocaleString()}
                        </span>
                      )}
                      {p.fechaLimite && (
                        <span className={`${vencida ? "text-red-600 font-bold" : ""}`}>
                          Límite:{" "}
                          {new Date(p.fechaLimite).toLocaleString()}
                          {vencida && (
                            <span className="ml-1">
                              ⚠ VENCIDO
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <CheckCircleIcon
                  onClick={() => toggleCompletado(p.id)}
                  className="h-6 w-6 cursor-pointer text-gray-400 hover:text-green-500 transition"
                />
                <TrashIcon
                  onClick={() => eliminarPendiente(p.id)}
                  className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer"
                />
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {/* COMPLETADAS */}
      {tareasCompletadas.length > 0 && (
        <div>
          <h4 className="text-gray-700 font-semibold mb-2">
            Tareas Completadas
          </h4>
          <ul className="flex flex-wrap gap-4">
            {tareasCompletadas.map((p) => (
              <li
                key={p.id}
                className={`
                  border rounded-lg p-3 flex items-start justify-between bg-gray-100 border-gray-300 opacity-70 line-through
                  w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)]
                `}
              >
                <div className="flex items-start gap-2">
                  {iconoPorImportancia(p.importancia)}
                  <div>
                    <h4 className="font-semibold text-gray-600">{p.titulo}</h4>
                    <p className="text-gray-500 text-sm">{p.descripcion}</p>
                  </div>
                </div>
                <TrashIcon
                  onClick={() => eliminarPendiente(p.id)}
                  className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Pendientes;