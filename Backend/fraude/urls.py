"""
URLs para la aplicación de detección de fraudes.
"""

from django.urls import path
from . import views

app_name = 'fraude'

urlpatterns = [
    # Detección de fraude
    path('detectar/', views.detectar_fraude, name='detectar_fraude'),
    
    # Gestión de alertas
    path('alertas/', views.obtener_alertas, name='obtener_alertas'),
    
    # Gestión de reglas de detección
    path('reglas/', views.gestionar_reglas, name='gestionar_reglas'),
]