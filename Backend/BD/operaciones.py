"""
Operaciones CRUD reutilizables para Supabase en el proyecto BCRP.

Este módulo proporciona funciones de alto nivel para realizar operaciones
comunes de base de datos usando Supabase.
"""

from typing import List, Dict, Any, Optional, Union
from supabase import Client
from BD.config import db_config
import json


class SupabaseOperations:
    """
    Clase para manejar operaciones CRUD con Supabase.
    """
    
    def __init__(self, use_admin: bool = False):
        """
        Inicializa las operaciones con un cliente Supabase.
        
        Args:
            use_admin (bool): Si True, usa permisos de administrador
        """
        self.client = db_config.get_supabase_client(admin=use_admin)
        if not self.client:
            raise ConnectionError("No se pudo establecer conexión con Supabase")
    
    def select_all(self, table: str, columns: str = "*") -> Dict[str, Any]:
        """
        Selecciona todos los registros de una tabla.
        
        Args:
            table (str): Nombre de la tabla
            columns (str): Columnas a seleccionar (por defecto todas)
        
        Returns:
            dict: Resultado de la consulta con datos y metadatos
        """
        try:
            response = self.client.table(table).select(columns).execute()
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": [],
                "count": 0,
                "error": str(e)
            }
    
    def select_by_id(self, table: str, record_id: Union[int, str], columns: str = "*") -> Dict[str, Any]:
        """
        Selecciona un registro por ID.
        
        Args:
            table (str): Nombre de la tabla
            record_id (Union[int, str]): ID del registro
            columns (str): Columnas a seleccionar
        
        Returns:
            dict: Resultado de la consulta
        """
        try:
            response = self.client.table(table).select(columns).eq("id", record_id).execute()
            return {
                "success": True,
                "data": response.data[0] if response.data else None,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }
    
    def select_with_filter(self, table: str, filters: Dict[str, Any], columns: str = "*") -> Dict[str, Any]:
        """
        Selecciona registros con filtros.
        
        Args:
            table (str): Nombre de la tabla
            filters (dict): Filtros a aplicar {columna: valor}
            columns (str): Columnas a seleccionar
        
        Returns:
            dict: Resultado de la consulta
        """
        try:
            query = self.client.table(table).select(columns)
            
            # Aplicar filtros
            for column, value in filters.items():
                query = query.eq(column, value)
            
            response = query.execute()
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": [],
                "count": 0,
                "error": str(e)
            }
    
    def insert_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Inserta un nuevo registro.
        
        Args:
            table (str): Nombre de la tabla
            data (dict): Datos a insertar
        
        Returns:
            dict: Resultado de la inserción
        """
        try:
            response = self.client.table(table).insert(data).execute()
            return {
                "success": True,
                "data": response.data[0] if response.data else None,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }
    
    def insert_multiple(self, table: str, data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Inserta múltiples registros.
        
        Args:
            table (str): Nombre de la tabla
            data_list (list): Lista de diccionarios con datos a insertar
        
        Returns:
            dict: Resultado de la inserción
        """
        try:
            response = self.client.table(table).insert(data_list).execute()
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": [],
                "count": 0,
                "error": str(e)
            }
    
    def update_record(self, table: str, record_id: Union[int, str], data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Actualiza un registro por ID.
        
        Args:
            table (str): Nombre de la tabla
            record_id (Union[int, str]): ID del registro
            data (dict): Datos a actualizar
        
        Returns:
            dict: Resultado de la actualización
        """
        try:
            response = self.client.table(table).update(data).eq("id", record_id).execute()
            return {
                "success": True,
                "data": response.data[0] if response.data else None,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }
    
    def delete_record(self, table: str, record_id: Union[int, str]) -> Dict[str, Any]:
        """
        Elimina un registro por ID.
        
        Args:
            table (str): Nombre de la tabla
            record_id (Union[int, str]): ID del registro
        
        Returns:
            dict: Resultado de la eliminación
        """
        try:
            response = self.client.table(table).delete().eq("id", record_id).execute()
            return {
                "success": True,
                "data": response.data,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }
    
    def clean_null_records(self, table: str, column: str) -> Dict[str, Any]:
        """
        Elimina registros con valores nulos en una columna específica.
        
        Args:
            table (str): Nombre de la tabla
            column (str): Columna a verificar por valores nulos
        
        Returns:
            dict: Resultado de la limpieza
        """
        try:
            response = self.client.table(table).delete().is_(column, None).execute()
            return {
                "success": True,
                "deleted_count": len(response.data) if response.data else 0,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "deleted_count": 0,
                "error": str(e)
            }
    
    def count_records(self, table: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Cuenta registros en una tabla con filtros opcionales.
        
        Args:
            table (str): Nombre de la tabla
            filters (dict, optional): Filtros a aplicar
        
        Returns:
            dict: Resultado del conteo
        """
        try:
            query = self.client.table(table).select("id", count="exact")
            
            if filters:
                for column, value in filters.items():
                    query = query.eq(column, value)
            
            response = query.execute()
            return {
                "success": True,
                "count": response.count if hasattr(response, 'count') else len(response.data),
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "count": 0,
                "error": str(e)
            }


# Funciones de conveniencia para uso directo
def get_operations(admin: bool = False) -> SupabaseOperations:
    """
    Obtiene una instancia de SupabaseOperations.
    
    Args:
        admin (bool): Si True, usa permisos de administrador
    
    Returns:
        SupabaseOperations: Instancia configurada
    """
    return SupabaseOperations(use_admin=admin)


def quick_select(table: str, columns: str = "*", admin: bool = False) -> Dict[str, Any]:
    """
    Función rápida para seleccionar todos los registros de una tabla.
    
    Args:
        table (str): Nombre de la tabla
        columns (str): Columnas a seleccionar
        admin (bool): Si usar permisos de administrador
    
    Returns:
        dict: Resultado de la consulta
    """
    try:
        ops = get_operations(admin=admin)
        return ops.select_all(table, columns)
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "count": 0,
            "error": str(e)
        }


def quick_insert(table: str, data: Dict[str, Any], admin: bool = True) -> Dict[str, Any]:
    """
    Función rápida para insertar un registro.
    
    Args:
        table (str): Nombre de la tabla
        data (dict): Datos a insertar
        admin (bool): Si usar permisos de administrador
    
    Returns:
        dict: Resultado de la inserción
    """
    try:
        ops = get_operations(admin=admin)
        return ops.insert_record(table, data)
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "error": str(e)
        }