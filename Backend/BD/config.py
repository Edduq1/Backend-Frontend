"""
Configuración de conexiones de base de datos para el proyecto BCRP.

Este módulo proporciona configuraciones para conectarse tanto a Supabase
como a PostgreSQL directamente, según las necesidades del proyecto.
"""

import os
import psycopg2
from typing import Optional, Dict, Any
from supabase import Client
from core.supabase import get_supabase_client, get_supabase_admin_client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


class DatabaseConfig:
    """
    Clase para manejar configuraciones de base de datos.
    """
    
    def __init__(self):
        """Inicializa la configuración de base de datos."""
        self.supabase_url = os.environ.get('SUPABASE_URL')
        self.supabase_anon_key = os.environ.get('SUPABASE_ANON_KEY')
        self.supabase_service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        # Configuración PostgreSQL directo
        self.db_name = os.environ.get('SUPABASE_DB_NAME', 'postgres')
        self.db_user = os.environ.get('SUPABASE_DB_USER', 'postgres')
        self.db_password = os.environ.get('SUPABASE_DB_PASSWORD')
        self.db_host = os.environ.get('SUPABASE_DB_HOST')
        self.db_port = os.environ.get('SUPABASE_DB_PORT', '5432')
    
    def get_supabase_client(self, admin: bool = False) -> Optional[Client]:
        """
        Obtiene un cliente Supabase.
        
        Args:
            admin (bool): Si True, usa permisos de administrador
        
        Returns:
            Client: Cliente Supabase o None si no se puede crear
        """
        try:
            if admin:
                return get_supabase_admin_client()
            else:
                return get_supabase_client(service=False)
        except Exception as e:
            print(f"Error al crear cliente Supabase: {e}")
            return None
    
    def get_postgres_connection(self) -> Optional[psycopg2.extensions.connection]:
        """
        Obtiene una conexión directa a PostgreSQL.
        
        Returns:
            connection: Conexión PostgreSQL o None si falla
        """
        try:
            if not all([self.db_host, self.db_password]):
                print("Faltan variables de entorno para PostgreSQL")
                return None
            
            connection = psycopg2.connect(
                host=self.db_host,
                database=self.db_name,
                user=self.db_user,
                password=self.db_password,
                port=self.db_port
            )
            return connection
        except psycopg2.Error as e:
            print(f"Error al conectar con PostgreSQL: {e}")
            return None
        except Exception as e:
            print(f"Error inesperado: {e}")
            return None
    
    def test_connections(self) -> Dict[str, Any]:
        """
        Prueba todas las conexiones disponibles.
        
        Returns:
            dict: Estado de las conexiones
        """
        results = {
            'supabase_public': False,
            'supabase_admin': False,
            'postgres_direct': False,
            'errors': []
        }
        
        # Probar Supabase público
        try:
            client = self.get_supabase_client(admin=False)
            if client:
                results['supabase_public'] = True
        except Exception as e:
            results['errors'].append(f"Supabase público: {e}")
        
        # Probar Supabase admin
        try:
            client = self.get_supabase_client(admin=True)
            if client:
                results['supabase_admin'] = True
        except Exception as e:
            results['errors'].append(f"Supabase admin: {e}")
        
        # Probar PostgreSQL directo
        try:
            conn = self.get_postgres_connection()
            if conn:
                results['postgres_direct'] = True
                conn.close()
        except Exception as e:
            results['errors'].append(f"PostgreSQL directo: {e}")
        
        return results
    
    def get_connection_info(self) -> Dict[str, Any]:
        """
        Obtiene información sobre las configuraciones disponibles.
        
        Returns:
            dict: Información de configuración (sin credenciales sensibles)
        """
        return {
            'supabase_url': self.supabase_url,
            'supabase_configured': bool(self.supabase_url and self.supabase_anon_key),
            'postgres_host': self.db_host,
            'postgres_port': self.db_port,
            'postgres_database': self.db_name,
            'postgres_configured': bool(self.db_host and self.db_password),
        }


# Instancia global de configuración
db_config = DatabaseConfig()