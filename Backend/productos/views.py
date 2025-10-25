"""
Vistas para la aplicación de productos financieros.
"""

import random
import string
from typing import Dict, Any
from decimal import Decimal

from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ProductCategory, FinancialProduct, ProductApplication


def _gen_application_number() -> str:
    ts = timezone.now().strftime('%Y%m%d%H%M%S')
    suffix = ''.join(random.choices(string.digits, k=4))
    return f'APP-{ts}-{suffix}'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_categorias(request):
    """
    Lista categorías activas.
    """
    try:
        qs = ProductCategory.objects.filter(is_active=True).order_by('display_order', 'name')
        data = []
        for c in qs:
            data.append({
                'id': str(c.id),
                'code': c.code,
                'name': c.name,
                'description': c.description,
                'parent_category': str(c.parent_category_id) if c.parent_category_id else None,
                'display_order': c.display_order,
            })
        return Response({'success': True, 'categories': data, 'count': len(data)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_productos(request):
    """
    Lista productos con filtros: category_code, status, available_only
    """
    try:
        category_code = request.GET.get('category_code')
        status_filter = request.GET.get('status')
        available_only = request.GET.get('available_only') in ['1', 'true', 'True']
        limit = int(request.GET.get('limit', 50))
        
        qs = FinancialProduct.objects.all()
        if category_code:
            qs = qs.filter(category__code=category_code)
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        data = []
        count = 0
        for p in qs.order_by('name'):
            if available_only and not p.is_available():
                continue
            item = {
                'id': str(p.id),
                'product_code': p.product_code,
                'name': p.name,
                'short_description': p.short_description,
                'product_type': p.product_type,
                'category': {'code': p.category.code, 'name': p.category.name},
                'status': p.status,
                'monthly_fee': float(p.monthly_fee),
                'requires_approval': p.requires_approval,
                'launch_date': p.launch_date.isoformat() if p.launch_date else None,
                'discontinuation_date': p.discontinuation_date.isoformat() if p.discontinuation_date else None,
                'features': p.features,
                'benefits': p.benefits,
            }
            data.append(item)
            count += 1
            if count >= limit:
                break
        
        return Response({'success': True, 'products': data, 'count': len(data)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalle_producto(request, product_id):
    """
    Obtiene el detalle de un producto por su UUID.
    """
    try:
        p = FinancialProduct.objects.get(id=product_id)
        data = {
            'id': str(p.id),
            'product_code': p.product_code,
            'name': p.name,
            'description': p.description,
            'short_description': p.short_description,
            'product_type': p.product_type,
            'category': {
                'id': str(p.category.id),
                'code': p.category.code,
                'name': p.category.name,
            },
            'base_interest_rate': float(p.base_interest_rate) if p.base_interest_rate is not None else None,
            'minimum_amount': float(p.minimum_amount) if p.minimum_amount is not None else None,
            'maximum_amount': float(p.maximum_amount) if p.maximum_amount is not None else None,
            'monthly_fee': float(p.monthly_fee),
            'setup_fee': float(p.setup_fee),
            'requires_approval': p.requires_approval,
            'minimum_age': p.minimum_age,
            'maximum_age': p.maximum_age,
            'minimum_income': float(p.minimum_income) if p.minimum_income is not None else None,
            'status': p.status,
            'launch_date': p.launch_date.isoformat() if p.launch_date else None,
            'discontinuation_date': p.discontinuation_date.isoformat() if p.discontinuation_date else None,
            'terms_and_conditions': p.terms_and_conditions,
            'features': p.features,
            'benefits': p.benefits,
            'requirements': p.requirements,
            'additional_info': p.additional_info,
            'is_available': p.is_available(),
            'created_at': p.created_at.isoformat(),
            'updated_at': p.updated_at.isoformat(),
        }
        return Response({'success': True, 'product': data}, status=status.HTTP_200_OK)
    except FinancialProduct.DoesNotExist:
        return Response({'success': False, 'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_solicitud_producto(request):
    """
    Crea una solicitud para un producto financiero.
    Body JSON esperado:
    {
        "product_id": "<uuid>",
        "requested_amount": 10000.0,
        "applicant_data": { ... },
        "supporting_documents": [ ... ],
        "priority": "medium"
    }
    """
    try:
        product_id = request.data.get('product_id')
        requested_amount = request.data.get('requested_amount')
        applicant_data = request.data.get('applicant_data', {})
        supporting_documents = request.data.get('supporting_documents', [])
        priority = request.data.get('priority', 'medium')
        
        if not product_id:
            return Response({'success': False, 'error': 'product_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        product = FinancialProduct.objects.get(id=product_id)
        
        # Validaciones básicas
        if requested_amount is not None:
            try:
                requested_amount = Decimal(str(requested_amount))
            except Exception:
                return Response({'success': False, 'error': 'requested_amount inválido'}, status=status.HTTP_400_BAD_REQUEST)
            if product.minimum_amount and requested_amount < product.minimum_amount:
                return Response({'success': False, 'error': 'Monto solicitado menor al mínimo permitido'}, status=status.HTTP_400_BAD_REQUEST)
            if product.maximum_amount and requested_amount > product.maximum_amount:
                return Response({'success': False, 'error': 'Monto solicitado mayor al máximo permitido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not product.is_available():
            return Response({'success': False, 'error': 'Producto no disponible'}, status=status.HTTP_400_BAD_REQUEST)
        
        application_number = _gen_application_number()
        application = ProductApplication.objects.create(
            application_number=application_number,
            product=product,
            applicant=request.user,
            requested_amount=requested_amount,
            applicant_data=applicant_data,
            supporting_documents=supporting_documents,
            priority=priority
        )
        
        return Response({
            'success': True,
            'application_number': application_number,
            'application_id': str(application.id),
            'status': application.status
        }, status=status.HTTP_201_CREATED)
    except FinancialProduct.DoesNotExist:
        return Response({'success': False, 'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)