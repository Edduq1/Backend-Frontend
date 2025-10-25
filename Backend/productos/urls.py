"""
URLs de la aplicación de productos financieros.
"""

from django.urls import path
from . import views

app_name = 'productos'

urlpatterns = [
    path('categorias/', views.listar_categorias, name='listar_categorias'),
    path('productos/', views.listar_productos, name='listar_productos'),
    path('productos/<uuid:product_id>/', views.detalle_producto, name='detalle_producto'),
    path('solicitudes/', views.crear_solicitud_producto, name='crear_solicitud_producto'),
]