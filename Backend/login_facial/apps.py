"""
Configuración de la aplicación de login facial.
"""

from django.apps import AppConfig


class LoginFacialConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'login_facial'
    verbose_name = 'Login Facial'
    
    def ready(self):
        """
        Hook de inicialización cuando la app está lista.
        """
        pass