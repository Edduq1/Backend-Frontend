"""
Configuración de la aplicación de detección de fraudes.
"""

from django.apps import AppConfig


class FraudeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fraude'
    verbose_name = 'Detección de Fraudes'
    
    def ready(self):
        """
        Configuración inicial cuando la aplicación está lista.
        """
        pass