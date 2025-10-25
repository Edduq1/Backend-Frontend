import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Users, Database as DatabaseIcon, Shield, List, Filter, TrashIcon, Inbox as InboxIcon, Search, User } from 'lucide-react';
import { useConfiguracion } from '../hook/useConfiguracion';
import type { Rol } from '../hook/useConfiguracion';

import NewUserModal from '../../components/configuracion/NewUserModal';
import UserListTable from '../../components/configuracion/UserListTable';
import DatabaseStatusCard from '../../components/configuracion/DatabaseStatusCard';
import ConnectionTestButton from '../../components/configuracion/ConnectionTestButton';
import DatabaseLogsViewer from '../../components/configuracion/DatabaseLogsViewer';
import AuditFilterBar from '../../components/configuracion/AuditFilterBar';
import AuditTable from '../../components/configuracion/AuditTable';
import ExportLogsButton from '../../components/configuracion/ExportLogsButton';
import ActionTrendChart from '../../components/configuracion/ActionTrendChart';
import KeyTablesMonitoring from '../../components/configuracion/KeyTablesMonitoring';
import ToastContainer from '../../components/configuracion/ToastContainer';

const Configuracion: React.FC = () => {
  const [view, setView] = useState<'usuarios' | 'db' | 'auditoria'>('usuarios');

  const {
    // usuarios y permisos
    usuarios,
    permisosPorRol,
    nuevoModalAbierto,
    form,
    autoCompleto,
    errorDni,
    errorEmail,
    onChangeDni,
    onChangeEmail,
    setRol,
    abrirNuevoUsuario,
    cerrarNuevoUsuario,
    guardarUsuario,
    modalSection,
    faceRegStatus,
    simularRegistroFacial,
    finalizarRegistroFacial,

    // base de datos
    dbStatus,
    probarConexion,
    refrescarEstructura,

    // auditoría
    filters,
    setFilters,
    filteredAudit,
    exportLogsCSV,
    actionTrend,

    // toast notifications
    toast,
  } = useConfiguracion();

  // Estado de filtros y paginación de usuarios
  const [userFiltersOpen, setUserFiltersOpen] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<Rol | 'Todos'>('Todos');
  const [userQuery, setUserQuery] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PAGE_SIZE = 5;

  const filteredUsers = useMemo(() => {
    const byRol = userRoleFilter === 'Todos' ? usuarios : usuarios.filter(u => u.rol === userRoleFilter);
    const q = userQuery.trim().toLowerCase();
    if (!q) return byRol;
    return byRol.filter(u => (
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(q) || u.dni.includes(q)
    ));
  }, [usuarios, userRoleFilter, userQuery]);

  const pagedUsers = useMemo(() => {
    const start = (usersPage - 1) * USERS_PAGE_SIZE;
    return filteredUsers.slice(start, start + USERS_PAGE_SIZE);
  }, [filteredUsers, usersPage]);

  const clearUserFilters = () => {
    setUserRoleFilter('Todos');
    setUserQuery('');
    setUsersPage(1);
  };

  // Estado para filtros de auditoría desplegables
  const [auditFiltersOpen, setAuditFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 font-sans animate-fadeIn">
      {/* Header */}
      <div className="mb-10 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 text-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-sm shadow-inner">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
              Configuración del Sistema
            </h1>
            <p className="text-orange-50 font-medium mt-1">
              Gestiona usuarios, permisos, base de datos y auditoría.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de vista */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setView('usuarios')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-base font-medium transition ${
            view === 'usuarios'
              ? 'bg-orange-50 border-orange-300 text-orange-700'
              : 'bg-white border-orange-100 text-gray-700 hover:bg-orange-50'
          }`}
        >
          <Users className="w-5 h-5" /> Gestión de usuarios
        </button>

        <button
          onClick={() => setView('db')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-base font-medium transition ${
            view === 'db'
              ? 'bg-orange-50 border-orange-300 text-orange-700'
              : 'bg-white border-orange-100 text-gray-700 hover:bg-orange-50'
          }`}
        >
          <DatabaseIcon className="w-5 h-5" /> Entorno de base de datos
        </button>

        <button
          onClick={() => setView('auditoria')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-base font-medium transition ${
            view === 'auditoria'
              ? 'bg-orange-50 border-orange-300 text-orange-700'
              : 'bg-white border-orange-100 text-gray-700 hover:bg-orange-50'
          }`}
        >
          <List className="w-5 h-5" /> Auditoría del sistema
        </button>
      </div>

      {/* Subvistas */}
      <AnimatePresence mode="wait">
        {/* Usuarios, roles y permisos */}
        {view === 'usuarios' && (
          <motion.div
            key="usuarios"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Acciones */}
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FD993B]" />
                <span className="text-sm font-semibold text-gray-800">Control de acceso y usuarios</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUserFiltersOpen(v => !v)}
                  className="px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" /> Filtros
                </button>
                
                <button
                  onClick={abrirNuevoUsuario}
                  className="px-4 py-2 rounded-lg bg-[#FD993B] text-white text-sm font-medium hover:brightness-110 transition"
                >
                  Nuevo Usuario
                </button>
              </div>
            </div>

            {/* Filtros de usuarios */}
            <AnimatePresence initial={false}>
              {userFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                >
                    {/* Encabezado de filtros */}
                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="w-5 h-5 text-[#FD993B]" />
                      <h3 className="text-sm font-semibold text-gray-800">Filtros de usuarios</h3>
                    </div>

                    {/* Contenedor de filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {/* Filtro de Rol */}
                      <div className="flex items-center gap-2 col-span-2 md:col-span-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <select
                          value={userRoleFilter}
                          onChange={(e) => {
                            setUserRoleFilter(e.target.value as Rol | "Todos");
                            setUsersPage(1);
                          }}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
                        >
                          <option value="Todos">Todos</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Analista">Analista</option>
                        </select>
                      </div>

                      {/* Filtro de búsqueda */}
                      <div className="flex items-center gap-2 col-span-3 md:col-span-3">
                        <Search className="w-4 h-4 text-gray-600" />
                        <input
                          value={userQuery}
                          onChange={(e) => {
                            setUserQuery(e.target.value);
                            setUsersPage(1);
                          }}
                          placeholder="Nombre y apellido o DNI"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FD993B]"
                        />
                      </div>
                    </div>
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      onClick={clearUserFilters}
                      className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 transition font-medium border border-orange-300"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Limpiar filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabla de usuarios full width */}
            <div className="space-y-4">
              <UserListTable
                users={pagedUsers}
                page={usersPage}
                pageSize={USERS_PAGE_SIZE}
                total={filteredUsers.length}
                onPageChange={(p) => setUsersPage(p)}
              />
            </div>

            {/* Modal */}
            <NewUserModal
              isOpen={nuevoModalAbierto}
              onClose={cerrarNuevoUsuario}
              dni={form.dni}
              nombres={form.nombres}
              apellidos={form.apellidos}
              rol={form.rol}
              autoCompleto={autoCompleto}
              errorDni={errorDni}
              onChangeDni={onChangeDni}
              onChangeRol={setRol}
              onSave={guardarUsuario}
              permisosPorRol={permisosPorRol}
              email={form.email}
              errorEmail={errorEmail}
              onChangeEmail={onChangeEmail}
              modalSection={modalSection}
              faceRegStatus={faceRegStatus}
              onStartFacial={simularRegistroFacial}
              onFinishFacial={finalizarRegistroFacial}
            />
          </motion.div>
        )}
          {view === 'db' && (
            <motion.div
              key="db"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* SECCIÓN SUPERIOR: Estado y Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                {/* Izquierda: Estado de base de datos */}
                <div className="lg:col-span-3 space-y-4 flex flex-col">
                  <DatabaseStatusCard status={dbStatus} onRefresh={refrescarEstructura} />

                  <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="text-sm text-gray-700">
                      Ejecuta una prueba de conexión con PostgreSQL para validar el entorno.
                    </div>
                    <ConnectionTestButton onTest={probarConexion} />
                  </div>
                </div>

                {/* Derecha: Logs recientes */}
                <div className="lg:col-span-2 flex flex-col">
              <div className="h-[246px]"> {/* Altura fija (puedes ajustar) */}
                <DatabaseLogsViewer logs={dbStatus.recentLogs} fullHeight={true} />
              </div>
            </div>
            </div>
              {/* SECCIÓN INFERIOR: Monitoreo de tablas clave */}
              <div className="w-full">
                <KeyTablesMonitoring />
              </div>
            </motion.div>
          )}
        {/* Auditoría del sistema */}
        {view === 'auditoria' && (
          <motion.div
            key="auditoria"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Acciones */}
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InboxIcon className="w-5 h-5 text-[#FD993B]" />
                <span className="text-sm font-semibold text-gray-800">Registro de actividades del sistema</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuditFiltersOpen(v => !v)}
                  className="px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" /> Filtros
                </button>
              <div className="ml-4">
                <ExportLogsButton onExport={exportLogsCSV} />
              </div>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {auditFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1"
                >
                  <AuditFilterBar filters={filters} onChange={setFilters} />
                </motion.div>
              )}
            </AnimatePresence>

            <AuditTable data={filteredAudit} />

            <ActionTrendChart data={actionTrend} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default Configuracion;