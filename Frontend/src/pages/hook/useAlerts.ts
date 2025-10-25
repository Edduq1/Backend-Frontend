// src/auth/hook/useAlerts.ts

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast'; 
export const HIGH_SCORE_THRESHOLD = 80; 

// TIPOS
export type AlertStatus = 'OPEN' | 'REVIEWED' | 'CLOSED'; 

interface Transaction {
    id: number;
    usuario_id: number;
    tarjeta_id: number;
    cuenta: string;
    monto_total: number;
    fecha_hora: string;
    estado: string; // Estado de la transacción
    es_fraude: boolean;
    score_fraude: number;
    pais: string;
    tipo_comercio: string;
}

// Interfaz de Alerta simplificada (extiende Transaction)
export interface Alert extends Transaction {
    alertScore: number; // Score real de la alerta (0-100)
    status: AlertStatus; // Estado de la gestión (OPEN, REVIEWED, CLOSED)
    factors: string[];
}

// Interfaz de Filtros simplificada
export interface AlertFilters {
  riskLevel?: "low" | "medium" | "high" | "";
}

// Interfaz para la actividad diaria (uso en useActivityData)
export interface DailyActivity {
    day: number;
    count: number;
    // Puedes añadir más información si es necesario
}

// Límite superior para la simulación de alertas por día
const MAX_ACTIVITY_PER_DAY = 15; 

// =================================================================
// DATOS SIMULADOS MASTER
// =================================================================

const dummyAlertsMaster: Alert[] = [
    { id: 1, usuario_id: 101, tarjeta_id: 10, cuenta: 'Maria Gonzalez', monto_total: 450.00, fecha_hora: '2024-03-14T16:30:00Z', estado: 'COMPLETADA', es_fraude: false, score_fraude: 85, pais: 'España', tipo_comercio: 'Electronica', alertScore: 85, status: 'OPEN', factors: ['Velocidad', 'Monto Inusual'] },
    { id: 2, usuario_id: 102, tarjeta_id: 20, cuenta: 'Pedro Martínez', monto_total: 200.00, fecha_hora: '2024-03-14T17:00:00Z', estado: 'COMPLETADA', es_fraude: true, score_fraude: 90, pais: 'Francia', tipo_comercio: 'Viajes', alertScore: 90, status: 'OPEN', factors: ['Monto Alto', 'Ubicación Inusual'] },
    { id: 3, usuario_id: 103, tarjeta_id: 30, cuenta: 'Inversiones del Sur', monto_total: 1200.00, fecha_hora: '2024-03-17T10:00:00Z', estado: 'PENDIENTE', es_fraude: false, score_fraude: 65, pais: 'México', tipo_comercio: 'Servicios', alertScore: 65, status: 'REVIEWED', factors: ['Hora Inusual'] },
    { id: 4, usuario_id: 104, tarjeta_id: 40, cuenta: 'Alan Garcia', monto_total: 320.00, fecha_hora: '2024-03-15T09:15:00Z', estado: 'COMPLETADA', es_fraude: false, score_fraude: 95, pais: 'Colombia', tipo_comercio: 'Banca', alertScore: 95, status: 'OPEN', factors: ['IP Inusual', 'Dispositivo Desconfiable'] },
    { id: 5, usuario_id: 105, tarjeta_id: 50, cuenta: 'Carlos Ruiz', monto_total: 150.00, fecha_hora: '2024-03-15T15:00:00Z', estado: 'RECHAZADA', es_fraude: false, score_fraude: 88, pais: 'España', tipo_comercio: 'Comida', alertScore: 88, status: 'REVIEWED', factors: ['Monto Bajo', 'Transacción Rápida'] },
    { id: 6, usuario_id: 106, tarjeta_id: 60, cuenta: 'Rosa Mendoza', monto_total: 580.00, fecha_hora: '2024-03-18T11:00:00Z', estado: 'PENDIENTE', es_fraude: false, score_fraude: 55, pais: 'Chile', tipo_comercio: 'Banca', alertScore: 55, status: 'CLOSED', factors: ['Patrón de Gasto'] },
    { id: 7, usuario_id: 107, tarjeta_id: 70, cuenta: 'Comercio Lito', monto_total: 2100.00, fecha_hora: '2024-03-18T11:30:00Z', estado: 'COMPLETADA', es_fraude: true, score_fraude: 91, pais: 'USA', tipo_comercio: 'Apuestas', alertScore: 91, status: 'OPEN', factors: ['Monto Alto', 'Geo-Inconsistencia'] },
    { id: 8, usuario_id: 108, tarjeta_id: 80, cuenta: 'Baja Prioridad', monto_total: 50.00, fecha_hora: '2024-03-18T12:00:00Z', estado: 'PENDIENTE', es_fraude: false, score_fraude: 30, pais: 'Perú', tipo_comercio: 'Varios', alertScore: 30, status: 'OPEN', factors: ['Sin Riesgo Evidente'] }, 
];

let nextDummyId = Math.max(...dummyAlertsMaster.map(a => a.id)) + 1; 

// =================================================================
// HOOK useAlerts
// =================================================================

export const useAlerts = () => {
    const [alertsMaster, setAlertsMaster] = useState<Alert[]>(dummyAlertsMaster);
    const [loading] = useState(false);
    // Filtro inicial simplificado: Solo por estado "OPEN"
const [filters, setFilters] = useState<AlertFilters>({ riskLevel: "" });

    // Lógica de Filtrado y Ordenamiento por prioridad (Score >= 80)
    const filteredAlerts = useMemo(() => {
  let filtered = alertsMaster;

  // 1️⃣ Filtro por nivel de riesgo
  if (filters.riskLevel === "low") {
    filtered = filtered.filter((a) => a.alertScore < 50);
  } else if (filters.riskLevel === "medium") {
    filtered = filtered.filter((a) => a.alertScore >= 50 && a.alertScore < 80);
  } else if (filters.riskLevel === "high") {
    filtered = filtered.filter((a) => a.alertScore >= 80);
  }

  // 2️⃣ Ordenar por score descendente
  filtered.sort((a, b) => b.alertScore - a.alertScore);
  return filtered;
}, [alertsMaster, filters]);
    // Simulación de WebSocket (Notificaciones en tiempo real de nuevas alertas)
    useEffect(() => {
        const wsSimulate = setInterval(() => {
            
            // Simular una nueva alerta CRÍTICA
            const newCriticalAlert: Alert = {
                id: nextDummyId++,
                usuario_id: 999,
                tarjeta_id: 99,
                cuenta: `Cliente Nuevo ${nextDummyId}`,
                monto_total: Math.floor(Math.random() * 5000) + 1000,
                fecha_hora: new Date().toISOString(),
                estado: 'PENDIENTE',
                es_fraude: true,
                score_fraude: 99,
                pais: 'Perú',
                tipo_comercio: 'Apuestas',
                alertScore: 99,
                status: 'OPEN',
                factors: ['Monto Alto', 'Ubicación Inusual', 'Transacción Rápida'],
            };
            
            toast.error(
                `🚨 NUEVA ALERTA CRÍTICA (#${newCriticalAlert.id}) - Score: ${newCriticalAlert.alertScore} - Cliente: ${newCriticalAlert.cuenta}`,
                { 
                    duration: 8000, 
                    position: 'top-right',
                    style: {
                        background: '#fee2e2', 
                        color: '#991b1b',
                        border: '1px solid #f87171',
                    }
                }
            );

            // Agregar la nueva alerta a la lista maestra
            setAlertsMaster(prev => [newCriticalAlert, ...prev]);

        }, 30000); // Cada 30 segundos

        return () => clearInterval(wsSimulate);
    }, []);

    // Acciones (Solo actualización de estado)
    const handleUpdateStatus = (alertId: number, newStatus: AlertStatus) => {
        setAlertsMaster(prev => prev.map(a => 
            a.id === alertId ? { ...a, status: newStatus } : a
        ));
    };

    return {
        alerts: filteredAlerts,
        alertsMaster, // Exportar la lista maestra completa para useActivityData
        loading,
        filters,
        setFilters,
        handleUpdateStatus,
        HIGH_SCORE_THRESHOLD,
    };
};

// Simula la obtención de datos de actividad (alertas de Score Alto) por día para un mes específico
export const useActivityData = (date: Date, alerts: Alert[]) => {
    return useMemo(() => {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

        if (isFutureMonth) {
            return {
                activity: [],
                maxActivity: MAX_ACTIVITY_PER_DAY, // Usar un valor fijo o el del pasado para escala
                status: 'FUTURE' as const,
            };
        }

        // 1. Filtrar las alertas por el mes y año seleccionados y por Score Alto
        const monthlyHighAlerts = alerts.filter(alert => {
            const alertDate = new Date(alert.fecha_hora);
            return alert.alertScore >= HIGH_SCORE_THRESHOLD && // Solo contar alertas de Score Alto
                   alertDate.getFullYear() === year && 
                   alertDate.getMonth() === month;
        });

        // 2. Contar alertas por día del mes
        const dailyCounts = new Map<number, number>(); // <Día del mes, Conteo>

        monthlyHighAlerts.forEach(alert => {
            const alertDate = new Date(alert.fecha_hora);
            const dayOfMonth = alertDate.getDate();

            // Solo contar hasta el día actual si es el mes actual
            if (year === today.getFullYear() && month === today.getMonth() && dayOfMonth > today.getDate()) {
                // Alerta en un día futuro del mes actual (debería ser raro si los datos son en tiempo real, pero es buena práctica)
                return;
            }

            dailyCounts.set(dayOfMonth, (dailyCounts.get(dayOfMonth) || 0) + 1);
        });

        // 3. Crear el array final para el gráfico
        const activity: DailyActivity[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            // Solo se muestran días hasta el actual si es el mes en curso
            const isFutureDayInCurrentMonth = year === today.getFullYear() && month === today.getMonth() && i > today.getDate();

            activity.push({
                day: i,
                count: isFutureDayInCurrentMonth ? 0 : dailyCounts.get(i) || 0,
            });
        }
        
        // 4. Determinar el estado
        const hasData = activity.some(a => a.count > 0);
        let status: 'DATA' | 'FUTURE' | 'EMPTY' = 'DATA';
        if (isFutureMonth) {
            status = 'FUTURE';
        } else if (!hasData) {
            status = 'EMPTY';
        }

        return {
            activity,
            maxActivity: MAX_ACTIVITY_PER_DAY,
            status,
        };
    }, [date, alerts]);
};