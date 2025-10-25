"""
URLs para la aplicación de limpieza de datos.
"""

from django.urls import path
from . import views

app_name = 'datos'

urlpatterns = [
    # Endpoint principal para limpieza de datos
    path('limpiar/', views.limpiar_datos, name='limpiar_datos'),
    
    # Endpoint para obtener logs de limpieza
    path('logs/', views.obtener_logs_limpieza, name='logs_limpieza'),
    
    # Endpoint para gestionar reglas de validación
    path('reglas/', views.gestionar_reglas_validacion, name='reglas_validacion'),
]