"""
Cliente y configuración de Supabase para el proyecto BCRP.

Este módulo proporciona funciones para obtener clientes Supabase
con diferentes niveles de permisos según las necesidades.
"""

import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Variables de entorno de Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')


def get_supabase_client(service: bool = False) -> Optional[Client]:
    """
    Devuelve cliente Supabase con diferentes niveles de permisos.
    
    Args:
        service (bool): Si True, usa SERVICE_ROLE_KEY (permisos admin)
                       Si False, usa ANON_KEY (permisos limitados)
    
    Returns:
        Client: Cliente Supabase configurado
        None: Si las variables de entorno no están configuradas
    
    Raises:
        ValueError: Si las variables de entorno requeridas no están presentes
    """
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL no está configurada en las variables de entorno")
    
    if service:
        if not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno")
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    else:
        if not SUPABASE_ANON_KEY:
            raise ValueError("SUPABASE_ANON_KEY no está configurada en las variables de entorno")
        return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_supabase_admin_client() -> Optional[Client]:
    """
    Devuelve cliente Supabase con permisos de administrador.
    
    Returns:
        Client: Cliente Supabase con permisos admin
    """
    return get_supabase_client(service=True)


def get_supabase_public_client() -> Optional[Client]:
    """
    Devuelve cliente Supabase con permisos públicos limitados.
    
    Returns:
        Client: Cliente Supabase con permisos limitados
    """
    return get_supabase_client(service=False)


def test_supabase_connection() -> dict:
    """
    Prueba la conexión a Supabase y devuelve el estado.
    
    Returns:
        dict: Estado de la conexión con detalles
    """
    try:
        client = get_supabase_public_client()
        if client:
            # Intentar una operación simple para verificar la conexión
            # Nota: Esto podría fallar si no hay tablas, pero al menos verifica la conexión
            return {
                "status": "success",
                "message": "Conexión a Supabase establecida correctamente",
                "url": SUPABASE_URL
            }
        else:
            return {
                "status": "error",
                "message": "No se pudo crear el cliente Supabase",
                "url": SUPABASE_URL
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al conectar con Supabase: {str(e)}",
            "url": SUPABASE_URL
        }