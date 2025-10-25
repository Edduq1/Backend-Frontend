"""
URLs para la aplicación de login facial.
"""

from django.urls import path
from . import views

app_name = 'login_facial'

urlpatterns = [
    path('registrar/', views.registrar_codificacion, name='registrar_codificacion'),
    path('verificar/', views.verificar_login_facial, name='verificar_login_facial'),
    path('intentos/', views.listar_intentos, name='listar_intentos'),
    path('bloqueos/', views.listar_ips_bloqueadas, name='listar_ips_bloqueadas'),
]