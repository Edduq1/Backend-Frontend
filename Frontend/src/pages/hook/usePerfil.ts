// src/auth/hook/usePerfil.ts

export interface UserProfile {
    // Campos que coinciden con la tabla (adaptados a camelCase para JS/TS)
    id: string; // ID interno de la BD (int4)
    nombre: string;
    email: string;
    telefono: string | null;
    direccion: string | null;
    fechaRegistro: string; // timestamptz
    activo: boolean; // bool
    
    // Campos específicos de la aplicación/frontend
    idUsuario: string; // ID visible de negocio
    rol: string;
    alertsReviewed: number;
    openAssignments: number;
    tasaError: number; 
    defaultAlertFilter: string;
    profileImageUrl?: string;
}
// DATOS SIMULADOS
export const dummyUser: UserProfile = {
    // Campos que replican la estructura de la base de datos
    id: '1', 
    nombre: 'Laura González',
    email: 'laura.gonzalez@empresa.com',
    telefono: '+34 654 123 789',
    direccion: 'Calle Ficticia 123, Ciudad, País',
    fechaRegistro: '2020-01-18T10:00:00Z', // Formato de fecha consistente con timestamptz
    activo: true, 
    idUsuario: 'A001-XYZ', 
    rol: 'Analista',
    alertsReviewed: 452,
    openAssignments: 12,
    tasaError: 0.5,
    defaultAlertFilter: 'OPEN',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};
