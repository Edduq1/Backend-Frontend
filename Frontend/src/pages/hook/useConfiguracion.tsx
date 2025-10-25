import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/hooks/useToast';

export type Rol = 'Administrador' | 'Analista';

export interface Usuario {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
  email?: string;
}

export type VistaKey = 'dashboard' | 'transacciones' | 'modelos' | 'configuracion';

export interface PermisosPorRol {
  [key: string]: {
    [vista in VistaKey]: boolean; // true = acceso, false = bloqueado
  };
}

export interface DBStatus {
  connected: boolean;
  dbName: string;
  userName: string;
  lastModelExportSync: string | null;
  recentLogs: string[];
}

export interface AuditEvent {
  usuario: string;
  rol: Rol;
  accion: string;
  fecha: string; // ISO
  ip: string;
  estado: 'Éxito' | 'Error';
}

export interface AuditFilters {
  usuario?: string;
  rol?: Rol | 'Todos';
  accion?: string;
  desde?: string; // ISO date
  hasta?: string; // ISO date
}

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  acciones: number;
}

const ORANGE_COLOR = '#FD993B';

function simulateIdentityLookup(dni: string): { nombres: string; apellidos: string } | null {
  // Simulación simple: mapear algunos DNIs conocidos o construir nombres por patrón.
  if (!/^\d{8}$/.test(dni)) return null;
  const seed = Number(dni.slice(-2));
  const nombresPool = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Lucía', 'Pedro', 'Valeria'];
  const apellidosPool = ['García', 'Pérez', 'Rodríguez', 'López', 'Martínez', 'Sánchez'];
  const nombres = nombresPool[seed % nombresPool.length];
  const apellidos = `${apellidosPool[seed % apellidosPool.length]} ${apellidosPool[(seed + 3) % apellidosPool.length]}`;
  return { nombres, apellidos };
}

export const useConfiguracion = () => {
  // Toast notifications
  const toast = useToast();
  
  // Usuarios y roles
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 'u-001',
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Pérez Gómez',
      rol: 'Administrador',
      estado: 'Activo',
      createdAt: '2025-10-01T10:30:00Z',
      email: 'juan.perez@example.com',
    },
    {
      id: 'u-002',
      dni: '87654321',
      nombres: 'Elena',
      apellidos: 'Martínez Díaz',
      rol: 'Analista',
      estado: 'Activo',
      createdAt: '2025-10-05T09:20:00Z',
      email: 'elena.martinez@example.com',
    },
    {
      id: 'u-003',
      dni: '10293847',
      nombres: 'Carlos',
      apellidos: 'García López',
      rol: 'Analista',
      estado: 'Activo',
      createdAt: '2025-10-06T12:10:00Z',
    },
    {
      id: 'u-004',
      dni: '56473829',
      nombres: 'María',
      apellidos: 'Rodríguez Ruiz',
      rol: 'Administrador',
      estado: 'Inactivo',
      createdAt: '2025-10-07T14:25:00Z',
    },
    {
      id: 'u-005',
      dni: '29384756',
      nombres: 'José',
      apellidos: 'López Fernández',
      rol: 'Analista',
      estado: 'Activo',
      createdAt: '2025-10-08T08:40:00Z',
    },
    {
      id: 'u-006',
      dni: '91827364',
      nombres: 'Ana',
      apellidos: 'Martínez Sánchez',
      rol: 'Administrador',
      estado: 'Activo',
      createdAt: '2025-10-08T16:05:00Z',
    },
    {
      id: 'u-007',
      dni: '56483920',
      nombres: 'Luis',
      apellidos: 'Sánchez García',
      rol: 'Analista',
      estado: 'Inactivo',
      createdAt: '2025-10-09T07:15:00Z',
    },
    {
      id: 'u-008',
      dni: '84736291',
      nombres: 'Lucía',
      apellidos: 'Pérez Martínez',
      rol: 'Analista',
      estado: 'Activo',
      createdAt: '2025-10-10T11:00:00Z',
    },
    {
      id: 'u-009',
      dni: '74629183',
      nombres: 'Pedro',
      apellidos: 'Gómez Rodríguez',
      rol: 'Administrador',
      estado: 'Activo',
      createdAt: '2025-10-11T09:50:00Z',
    },
    {
      id: 'u-010',
      dni: '56473821',
      nombres: 'Valeria',
      apellidos: 'López García',
      rol: 'Analista',
      estado: 'Activo',
      createdAt: '2025-10-12T13:30:00Z',
    },
  ]);

  const permisosPorRol: PermisosPorRol = {
    Administrador: {
      dashboard: true,
      transacciones: true,
      modelos: true,
      configuracion: true,
    },
    Analista: {
      dashboard: true,
      transacciones: true,
      modelos: false,
      configuracion: false,
    },
  };

  const [nuevoModalAbierto, setNuevoModalAbierto] = useState(false);
  const [form, setForm] = useState<{ dni: string; nombres: string; apellidos: string; rol: Rol; email: string }>(
    { dni: '', nombres: '', apellidos: '', rol: 'Analista', email: '' }
  );
  const [autoCompleto, setAutoCompleto] = useState(false);
  const [errorDni, setErrorDni] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);

  const [modalSection, setModalSection] = useState<'form' | 'face'>('form');
  const [faceRegStatus, setFaceRegStatus] = useState<'idle' | 'ready' | 'capturing' | 'done'>('idle');
  const [ultimoUsuarioId, setUltimoUsuarioId] = useState<string | null>(null);

  const onChangeDni = (dni: string) => {
    setForm((f) => ({ ...f, dni }));
    setErrorDni(null);
    const res = simulateIdentityLookup(dni);
    if (res) {
      setForm((f) => ({ ...f, nombres: res.nombres, apellidos: res.apellidos }));
      setAutoCompleto(true);
    } else {
      setForm((f) => ({ ...f, nombres: '', apellidos: '' }));
      setAutoCompleto(false);
    }
  };

  const onChangeEmail = (email: string) => {
    setForm((f) => ({ ...f, email }));
    setErrorEmail(null);
  };

  const setRol = (rol: Rol) => setForm((f) => ({ ...f, rol }));

  const abrirNuevoUsuario = () => {
    setNuevoModalAbierto(true);
    setModalSection('form');
    setFaceRegStatus('idle');
  };
  const cerrarNuevoUsuario = () => {
    setNuevoModalAbierto(false);
    setModalSection('form');
    setFaceRegStatus('idle');
    setUltimoUsuarioId(null);
  };

  const guardarUsuario = () => {
    // Validaciones
    if (!/^\d{8}$/.test(form.dni)) {
      setErrorDni('DNI inválido. Debe tener 8 dígitos.');
      return false;
    }
    if (!form.nombres || !form.apellidos) {
      setErrorDni('Debe autocompletar nombres y apellidos con un DNI válido.');
      return false;
    }
    const emailOk = /.+@.+\..+/.test(form.email);
    if (!emailOk) {
      setErrorEmail('Correo electrónico inválido.');
      return false;
    }

    const nuevo: Usuario = {
      id: `u-${Math.random().toString(36).slice(2, 8)}`,
      dni: form.dni,
      nombres: form.nombres,
      apellidos: form.apellidos,
      rol: form.rol,
      estado: 'Activo',
      createdAt: new Date().toISOString(),
      email: form.email,
    };
    setUsuarios((prev) => [nuevo, ...prev]);
    setUltimoUsuarioId(nuevo.id);
    // Paso siguiente: registro facial dentro del mismo modal
    setModalSection('face');
    setFaceRegStatus('ready');
    // Limpiar campos del formulario (no cerramos modal)
    setForm({ dni: '', nombres: '', apellidos: '', rol: 'Analista', email: '' });
    setAutoCompleto(false);
    setErrorDni(null);
    setErrorEmail(null);
    return true;
  };

  const simularRegistroFacial = async () => {
    // Simulación: transición de estados con pequeña espera
    setFaceRegStatus('capturing');
    await new Promise((r) => setTimeout(r, 1200));
    setFaceRegStatus('done');
  };

  const finalizarRegistroFacial = () => {
    // Obtener datos del último usuario registrado
    const ultimoUsuario = usuarios.find(u => u.id === ultimoUsuarioId);
    const nombreCompleto = ultimoUsuario ? `${ultimoUsuario.nombres} ${ultimoUsuario.apellidos}` : 'Usuario';
    
    // Mostrar notificación de éxito
    toast.success(
      'Registro facial completado',
      `El usuario ${nombreCompleto} ha sido registrado exitosamente con reconocimiento facial.`,
      5000
    );
    
    // Cierra flujo y modal
    setNuevoModalAbierto(false);
    setModalSection('form');
    setFaceRegStatus('idle');
    setUltimoUsuarioId(null);
  };

  // Base de datos (simulación)
  const [dbStatus, setDbStatus] = useState<DBStatus>({
    connected: true,
    dbName: 'brp_db',
    userName: 'brp_admin',
    lastModelExportSync: '2025-10-17T08:45:00Z',
    recentLogs: [
      '2025-10-17 08:45:05 - Exportación de modelos sincronizada (12 archivos) - OK',
      '2025-10-17 08:30:02 - Integridad tablas detalle_transacciones y productos - OK',
      '2025-10-17 08:28:41 - Reindexación de claves foráneas (detalle_transacciones) - OK',
      '2025-10-17 08:25:12 - Conexión a PostgreSQL establecida - OK',
      '2025-10-17 08:24:58 - Intento de conexión - OK',
    ],
  });

  const probarConexion = async () => {
    // Simular un ping a la DB
    setDbStatus((s) => ({ ...s, recentLogs: [`${new Date().toISOString()} - Probar conexión...`, ...s.recentLogs] }));
    await new Promise((r) => setTimeout(r, 700));
    const ok = Math.random() > 0.1;
    setDbStatus((s) => ({
      ...s,
      connected: ok,
      recentLogs: [`${new Date().toISOString()} - Resultado ping: ${ok ? 'OK' : 'ERROR'}`, ...s.recentLogs].slice(0, 10),
    }));
  };

  const refrescarEstructura = async () => {
    setDbStatus((s) => ({ ...s, recentLogs: [`${new Date().toISOString()} - Refrescar estructura...`, ...s.recentLogs] }));
    await new Promise((r) => setTimeout(r, 800));
    setDbStatus((s) => ({
      ...s,
      lastModelExportSync: new Date().toISOString(),
      recentLogs: [`${new Date().toISOString()} - Estructura actualizada y sincronización de exportación`, ...s.recentLogs].slice(0, 10),
    }));
  };

  // Auditoría
  const [auditLogs] = useState<AuditEvent[]>([
    { usuario: 'Juan Pérez', rol: 'Administrador', accion: 'Creó usuario', fecha: '2025-10-17T09:00:00Z', ip: '192.168.1.10', estado: 'Éxito' },
    { usuario: 'Elena Martínez', rol: 'Analista', accion: 'Exportó datos', fecha: '2025-10-17T08:50:00Z', ip: '192.168.1.12', estado: 'Éxito' },
    { usuario: 'Juan Pérez', rol: 'Administrador', accion: 'Entrenó modelo', fecha: '2025-10-16T17:25:00Z', ip: '192.168.1.10', estado: 'Éxito' },
    { usuario: 'Elena Martínez', rol: 'Analista', accion: 'Accedió a Configuración', fecha: '2025-10-16T16:00:00Z', ip: '192.168.1.12', estado: 'Error' },
    { usuario: 'Sistema', rol: 'Administrador', accion: 'Sincronizó exportación', fecha: '2025-10-16T15:45:00Z', ip: '127.0.0.1', estado: 'Éxito' },
  ]);
  const [filters, setFilters] = useState<AuditFilters>({ rol: 'Todos' });

  const filteredAudit = useMemo(() => {
    return auditLogs.filter((e) => {
      const byUsuario = filters.usuario ? e.usuario.toLowerCase().includes(filters.usuario.toLowerCase()) : true;
      const byRol = filters.rol && filters.rol !== 'Todos' ? e.rol === filters.rol : true;
      const byAccion = filters.accion ? e.accion.toLowerCase().includes(filters.accion.toLowerCase()) : true;
      const byFecha = (() => {
        if (!filters.desde && !filters.hasta) return true;
        const t = new Date(e.fecha).getTime();
        const d = filters.desde ? new Date(filters.desde).getTime() : -Infinity;
        const h = filters.hasta ? new Date(filters.hasta).getTime() : Infinity;
        return t >= d && t <= h;
      })();
      return byUsuario && byRol && byAccion && byFecha;
    });
  }, [auditLogs, filters]);

  const exportLogsCSV = () => {
    const headers = ['Usuario','Rol','Acción','Fecha','IP','Estado'];
    const rows = filteredAudit.map(e => [e.usuario, e.rol, e.accion, e.fecha, e.ip, e.estado]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionTrend: TrendPoint[] = useMemo(() => {
    // Conteo diario de acciones (últimos 10 días)
    const counts: Record<string, number> = {};
    for (const e of auditLogs) {
      const day = e.fecha.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    }
    const keys = Object.keys(counts).sort();
    const lastTen = keys.slice(-10);
    return lastTen.map(k => ({ date: k, acciones: counts[k] }));
  }, [auditLogs]);

  // Color dispuesto para esta vista
  const colors = { primary: ORANGE_COLOR };

  // Para mostrar tooltip de permisos por rol actual del formulario
  const rolActual = form.rol;

  useEffect(() => {
    // Ejemplo: agregar a auditoría cada vez que se crea un usuario
    // (Se podría mover a guardarUsuario si queremos una sola entrada)
  }, []);

  return {
    // usuarios y roles
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

    // toast notifications
    toast,

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

    // estilos
    colors,
    rolActual,
  };
};