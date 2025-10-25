"""
Configuración de la aplicación datos.
"""

from django.apps import AppConfig


class DatosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'datos'
    verbose_name = 'Limpieza de Datos'
    
    def ready(self):
        """
        Código que se ejecuta cuando la aplicación está lista.
        """
        pass