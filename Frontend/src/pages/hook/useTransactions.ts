import { useState, useEffect, useCallback } from 'react';

// Interfaces (Se mantienen igual)
export interface Transaction {
    id: number;
    usuario_id: number;
    tarjeta_id: number;
    cuenta: string;
    monto_total: number;
    fecha_hora: string;
    estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'RECHAZADA';
    es_fraude: boolean;
    score_fraude: number;
    pais: string;
    tipo_comercio: string;
}

export interface TransactionItem {
    producto_id: number;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface ExtendedTransaction extends Transaction {
    detalle_productos: TransactionItem[];
}

export interface Decision {
    revisor: string;
    cuando: string;
    resultado: string;
}

export interface Filters {
    fechaInicio: string;
    fechaFin: string;
    cuenta: string;
    scoreMin: number;
    scoreMax: number;
    etiqueta: string;
    estado: '' | Transaction['estado'];
}

// Constantes
const initialFilters: Filters = {
    fechaInicio: '',
    fechaFin: '',
    cuenta: '',
    scoreMin: 0,
    scoreMax: 100,
    etiqueta: '',
    estado: ''
};

const ITEMS_PER_PAGE = 12;
const TOTAL_TRANSACTIONS = 44;

// Listas de valores para generar más variación (Se mantienen igual)
const CUENTAS = [
    'Maria Gonzalez', 'LE. San Martin', 'Inversiones del Sur', 'Alan Garcia', 
    'LE. Bolognesi', 'Rosa Mendoza', 'Tecno Global S.A.', 'Ferreteria Central', 
    'Software y Servicios', 'Luis Ramirez', 'Claudia Torres', 'Consultora Beta'
];
const PAISES = [
    'España', 'México', 'Colombia', 'Argentina', 'Chile', 'Perú', 
    'Ecuador', 'Uruguay', 'Venezuela'
];
const COMERCIOS = [
    'Electronica', 'Banca', 'Servicios', 'Moda', 'Restaurante', 
    'Viajes', 'Educación', 'Salud', 'Hogar'
];
const ESTADOS: Transaction['estado'][] = [
    'COMPLETADA', 'RECHAZADA', 'PENDIENTE', 'CANCELADA'
];
const initialBaseData: Transaction[] = [
    { id: 1, usuario_id: 101, tarjeta_id: 10, cuenta: CUENTAS[0], monto_total: 450.00, fecha_hora: '2024-03-14T16:30:00Z', estado: 'COMPLETADA', es_fraude: false, score_fraude: 85, pais: PAISES[0], tipo_comercio: COMERCIOS[0] },
    { id: 2, usuario_id: 102, tarjeta_id: 20, cuenta: CUENTAS[1], monto_total: 3500.00, fecha_hora: '2024-03-09T16:35:00Z', estado: 'RECHAZADA', es_fraude: true, score_fraude: 20, pais: PAISES[0], tipo_comercio: COMERCIOS[1] },
    { id: 3, usuario_id: 103, tarjeta_id: 30, cuenta: CUENTAS[2], monto_total: 1200.00, fecha_hora: '2024-03-17T10:00:00Z', estado: 'PENDIENTE', es_fraude: false, score_fraude: 65, pais: PAISES[1], tipo_comercio: COMERCIOS[2] },
    { id: 4, usuario_id: 104, tarjeta_id: 40, cuenta: CUENTAS[3], monto_total: 320.00, fecha_hora: '2024-03-15T09:15:00Z', estado: 'COMPLETADA', es_fraude: false, score_fraude: 95, pais: PAISES[2], tipo_comercio: COMERCIOS[1] },
    { id: 5, usuario_id: 105, tarjeta_id: 50, cuenta: CUENTAS[4], monto_total: 4200.00, fecha_hora: '2024-03-11T14:22:00Z', estado: 'RECHAZADA', es_fraude: true, score_fraude: 35, pais: PAISES[3], tipo_comercio: COMERCIOS[3] },
    { id: 6, usuario_id: 106, tarjeta_id: 60, cuenta: CUENTAS[5], monto_total: 580.00, fecha_hora: '2024-03-18T11:00:00Z', estado: 'PENDIENTE', es_fraude: false, score_fraude: 55, pais: PAISES[4], tipo_comercio: COMERCIOS[1] },
];

// Función mejorada para generar transacciones (Se mantiene igual)
const generateMockTransaction = (index: number, baseData: Transaction[]): Transaction => {
    const cuentaIndex = (index - 1) % CUENTAS.length;
    const paisIndex = (index - 1) % PAISES.length;
    const comercioIndex = (index - 1) % COMERCIOS.length;
    const estadoIndex = (index - 1) % ESTADOS.length;
    const baseIndex = (index - 1) % baseData.length;
    const baseTrx = baseData[baseIndex];

    const date = new Date(baseTrx.fecha_hora);
    date.setDate(date.getDate() - Math.floor((index - 1) / 3)); 
    
    const randomMontoOffset = Math.random() * 500 - 250;
    const newMonto = parseFloat(Math.max(50, baseTrx.monto_total + randomMontoOffset).toFixed(2));
    const newScore = Math.min(100, Math.max(0, baseTrx.score_fraude + (Math.random() * 20 - 10)));
    const esFraude = (newScore <= 40) || (index % 10 === 0);

    return {
        id: index,
        usuario_id: baseTrx.usuario_id + Math.floor(index / 5),
        tarjeta_id: baseTrx.tarjeta_id + (index % 10),
        cuenta: CUENTAS[cuentaIndex],
        monto_total: newMonto,
        fecha_hora: date.toISOString(),
        estado: ESTADOS[estadoIndex],
        es_fraude: esFraude, 
        score_fraude: parseFloat(newScore.toFixed(0)),
        pais: PAISES[paisIndex],
        tipo_comercio: COMERCIOS[comercioIndex],
    };
};

// Generación de todos los datos (Se mantiene igual)
const additionalData: Transaction[] = [];
for (let i = initialBaseData.length + 1; i <= TOTAL_TRANSACTIONS; i++) {
    additionalData.push(generateMockTransaction(i, initialBaseData));
}
const dummyData: Transaction[] = [...initialBaseData, ...additionalData].sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());

// Datos de detalle y decisión (Se mantienen igual)
const dummyDetailData: TransactionItem[] = [
    { producto_id: 1, nombre_producto: 'Licencia Antivirus', cantidad: 1, precio_unitario: 100.00, subtotal: 100.00 },
    { producto_id: 2, nombre_producto: 'Servicio de VPN (1 año)', cantidad: 1, precio_unitario: 350.00, subtotal: 350.00 },
];
const decisionHistoryDummy: Decision[] = [
    { revisor: 'Analista A', cuando: '2025-10-10 17:00', resultado: 'Marcado como No-Fraude' },
    { revisor: 'Analista B', cuando: '2025-10-10 16:00', resultado: 'Revisión Pendiente' },
];

// HOOK PRINCIPAL: useTransactions
export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<ExtendedTransaction | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [decisionHistory, setDecisionHistory] = useState<Decision[]>([]);
    const [isShowingAll, setIsShowingAll] = useState(false); // <--- NUEVO ESTADO: Controla si se desactiva la paginación.

    // Función de búsqueda y paginación
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const lowerSearch = searchTerm.toLowerCase();

        // 1. Aplicar Búsqueda y Filtros
        const filteredData = dummyData.filter(trx => {
            const includes = (val: string | number | boolean) =>
                String(val).toLowerCase().includes(lowerSearch);
            
            // Lógica de Búsqueda (Search Term)
            const matchesSearch =
                lowerSearch === '' ||
                includes(trx.id) ||
                includes(new Date(trx.fecha_hora).toLocaleDateString()) ||
                includes(trx.cuenta) ||
                includes(trx.tipo_comercio) ||
                includes(trx.estado) ||
                includes(trx.score_fraude) ||
                includes(trx.monto_total);

            // Lógica de Filtros (Modal de Filtros)
            const matchesFilters =
                (filters.estado === '' || trx.estado === filters.estado) &&
                (filters.etiqueta === '' || trx.tipo_comercio.toLowerCase().includes(filters.etiqueta.toLowerCase())) &&
                (filters.cuenta === '' || trx.cuenta.toLowerCase().includes(filters.cuenta.toLowerCase())) &&
                (trx.score_fraude >= filters.scoreMin && trx.score_fraude <= filters.scoreMax) &&
                (filters.fechaInicio === '' || new Date(trx.fecha_hora) >= new Date(filters.fechaInicio)) &&
                (filters.fechaFin === '' || new Date(trx.fecha_hora) <= new Date(filters.fechaFin));
            
            return matchesSearch && matchesFilters;
        });

        // 2. Simulación de Paginación (Ajuste para "Mostrar Todo")
        let finalData = filteredData;

        if (!isShowingAll) { // <--- LÓGICA CLAVE: Paginar solo si no se está mostrando todo
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            finalData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
            setTotalPages(Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1);
        } else {
             // Si se está mostrando todo, 'finalData' es 'filteredData' (todos los resultados).
            setTotalPages(1); 
        }

        setTransactions(finalData);
        setLoading(false);
    }, [filters, searchTerm, currentPage, isShowingAll]); // <--- Añadir isShowingAll

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, fetchTransactions]);

    // EFECTO para recargar al cambiar filtros o búsqueda, reseteando la página
    useEffect(() => {
        setCurrentPage(1);
        fetchTransactions();
    }, [filters, searchTerm]); 
    
    // Función wrapper para manejar el searchTerm y re-activar la paginación
    const handleSetSearchTerm = (term: string) => {
        setSearchTerm(term);
        setIsShowingAll(false); // Si se busca algo, la paginación se re-activa
    };

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setIsShowingAll(false); // Si se aplica un filtro avanzado, la paginación se re-activa
        setCurrentPage(1);
        setIsFiltersModalOpen(false);
    };

    const handleViewDetails = (transaction: Transaction) => {
        const extendedTransaction: ExtendedTransaction = {
            ...transaction,
            detalle_productos: dummyDetailData,
        };
        setSelectedTransaction(extendedTransaction);
        setDecisionHistory(decisionHistoryDummy);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
        setDecisionHistory([]);
    };

    const handleAction = async (decision: 'fraude' | 'no-fraude') => {
        if (selectedTransaction) {
            console.log(`Decisión: ${decision}`);
            handleCloseDetailModal();
            await fetchTransactions();
        }
    };

    const handleExportCSV = () => {
        alert(' Iniciando exportación de transacciones a CSV...');
    };

    const clearAllFilters = () => {
        setFilters(initialFilters); 
        setSearchTerm('');
        setCurrentPage(1);
        setIsShowingAll(false); // Limpia los filtros y mantiene la paginación activa
    };

    const showAllTransactions = () => {
        const clearedFilters: Filters = { ...initialFilters, scoreMin: 0, scoreMax: 100 };
        setFilters(clearedFilters);
        setSearchTerm('');
        setCurrentPage(1);
        setIsShowingAll(true); // <--- LÓGICA CLAVE: Desactiva la paginación
    };
    
    // Cálculos de Totales
    const totalMonto = transactions.reduce((sum, t) => sum + t.monto_total, 0);
    const totalSaldo = transactions
        .filter(t => t.estado === 'PENDIENTE' || t.es_fraude)
        .reduce((sum, t) => sum + t.monto_total, 0);

    // Retorno del hook
    return {
        transactions,loading,currentPage,totalPages,filters,searchTerm,selectedTransaction,isDetailModalOpen,isFiltersModalOpen,decisionHistory,totalMonto,totalSaldo,isShowingAll, // <--- Exportado
        setCurrentPage,setSearchTerm: handleSetSearchTerm, // <--- Usar el wrapper
        setFilters, setIsFiltersModalOpen,fetchTransactions,handleApplyFilters,handleViewDetails,handleCloseDetailModal,handleAction,handleExportCSV,
        clearAllFilters,showAllTransactions,
    };
};