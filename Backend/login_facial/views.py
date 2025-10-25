"""
Vistas para la aplicación de login facial.
"""

import time
import uuid
from datetime import timedelta
from typing import Dict, Any

from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    FaceEncoding,
    FaceLoginAttempt,
    FaceRecognitionSettings,
    BlockedIP,
)


def _get_client_ip(request) -> str:
    ip = request.META.get('HTTP_X_FORWARDED_FOR')
    if ip:
        ip = ip.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
    return ip


def _get_active_settings() -> FaceRecognitionSettings:
    settings_qs = FaceRecognitionSettings.objects.filter(is_active=True)
    if settings_qs.exists():
        return settings_qs.first()
    # Fallback de configuración por defecto si no hay registros
    return FaceRecognitionSettings(
        name='default',
        algorithm='face_recognition',
        confidence_threshold=0.6,
        max_face_distance=0.6,
        min_face_size=50,
        max_image_size=1024,
        quality_threshold=0.5,
        max_attempts_per_minute=5,
        max_failed_attempts=3,
        block_duration_minutes=15,
        enable_liveness_detection=False,
        is_active=True,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_codificacion(request):
    """
    Registra una codificación facial para un usuario.
    
    Body JSON esperado:
    {
        "user_id": "<uuid>", // opcional si se envía "username"
        "username": "<str>", // opcional si se envía "user_id"
        "encoding_data": { ... },
        "is_primary": false,
        "confidence_score": 0.92,
        "image_quality_score": 0.88
    }
    """
    try:
        user_id = request.data.get('user_id')
        username = request.data.get('username')
        encoding_data = request.data.get('encoding_data')
        is_primary = bool(request.data.get('is_primary', False))
        confidence_score = float(request.data.get('confidence_score', 0.0))
        image_quality_score = float(request.data.get('image_quality_score', 0.0))
        
        if not encoding_data:
            return Response({
                'success': False,
                'error': 'El campo "encoding_data" es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Resolver usuario
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'success': False, 'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        elif username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({'success': False, 'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'success': False, 'error': 'Debe proporcionar "user_id" o "username"'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear codificación
        fe = FaceEncoding.objects.create(
            user=user,
            encoding_data=encoding_data,
            is_primary=is_primary,
            confidence_score=confidence_score,
            image_quality_score=image_quality_score,
        )
        
        # Si no había primaria, establecer esta como primaria
        if not FaceEncoding.objects.filter(user=user, is_primary=True).exclude(id=fe.id).exists():
            fe.is_primary = True
            fe.save(update_fields=['is_primary'])
        
        return Response({
            'success': True,
            'encoding_id': str(fe.id),
            'user': user.username,
            'is_primary': fe.is_primary
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verificar_login_facial(request):
    """
    Verifica un intento de login facial comparando una codificación enviada
    contra las codificaciones registradas. Esta implementación es simplificada.
    
    Body JSON esperado:
    {
        "encoding_data": { ... },
        "username": "opcional",
        "session_id": "opcional",
        "image_metadata": { ... opcional ... }
    }
    """
    start_time = time.time()
    client_ip = _get_client_ip(request)
    settings_obj = _get_active_settings()
    now = timezone.now()
    
    # Rate limiting por IP
    try:
        existing_block = BlockedIP.objects.filter(ip_address=client_ip).first()
        if existing_block and existing_block.is_currently_blocked():
            attempt = FaceLoginAttempt.objects.create(
                user=None,
                ip_address=client_ip,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                status='blocked',
                failure_reason='too_many_attempts',
                image_metadata=request.data.get('image_metadata'),
                detection_details={'reason': 'ip_blocked'},
                session_id=request.data.get('session_id')
            )
            return Response({
                'success': False,
                'blocked': True,
                'blocked_until': existing_block.blocked_until.isoformat(),
                'reason': existing_block.reason
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        one_minute_ago = now - timedelta(minutes=1)
        recent_attempts = FaceLoginAttempt.objects.filter(
            ip_address=client_ip,
            created_at__gte=one_minute_ago
        ).count()
        
        if recent_attempts >= settings_obj.max_attempts_per_minute:
            BlockedIP.objects.create(
                ip_address=client_ip,
                reason='too_many_attempts',
                failed_attempts_count=recent_attempts,
                blocked_until=now + timedelta(minutes=settings_obj.block_duration_minutes),
                notes='Bloqueo automático por demasiados intentos',
                is_permanent=False,
                created_by=None
            )
            attempt = FaceLoginAttempt.objects.create(
                user=None,
                ip_address=client_ip,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                status='blocked',
                failure_reason='too_many_attempts',
                image_metadata=request.data.get('image_metadata'),
                detection_details={'reason': 'rate_limit_exceeded'},
                session_id=request.data.get('session_id')
            )
            return Response({
                'success': False,
                'blocked': True,
                'blocked_until': (now + timedelta(minutes=settings_obj.block_duration_minutes)).isoformat(),
                'reason': 'too_many_attempts'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except Exception:
        pass
    
    try:
        encoding_data = request.data.get('encoding_data')
        username = request.data.get('username')
        session_id = request.data.get('session_id')
        image_metadata = request.data.get('image_metadata')
        
        if not encoding_data:
            return Response({'success': False, 'error': 'encoding_data requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar codificaciones candidatas
        encodings_qs = FaceEncoding.objects.filter(is_active=True)
        if username:
            encodings_qs = encodings_qs.filter(user__username=username)
        
        matched_user = None
        confidence = 0.0
        detection_details = {
            'algorithm': settings_obj.algorithm,
            'comparisons': 0,
        }
        
        # Implementación de coincidencia simplificada: si hay coincidencia exacta de una clave
        # conocida en el JSON de encoding, considerar éxito.
        # En producción se calcularía distancia euclidiana/coseno, etc.
        key = 'signature'
        provided_signature = encoding_data.get(key)
        for fe in encodings_qs:
            detection_details['comparisons'] += 1
            stored_signature = (fe.encoding_data or {}).get(key)
            if stored_signature and provided_signature and stored_signature == provided_signature:
                matched_user = fe.user
                confidence = max(confidence, fe.confidence_score or 0.9)
                break
        
        status_value = 'success' if matched_user else 'failed'
        failure_reason = None if matched_user else 'no_match'
        processing_time = time.time() - start_time
        
        attempt = FaceLoginAttempt.objects.create(
            user=matched_user,
            ip_address=client_ip,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            status=status_value,
            confidence_score=confidence if matched_user else None,
            processing_time=processing_time,
            failure_reason=failure_reason,
            image_metadata=image_metadata,
            detection_details=detection_details,
            session_id=session_id
        )
        
        return Response({
            'success': True if matched_user else False,
            'status': status_value,
            'username': matched_user.username if matched_user else None,
            'confidence_score': confidence if matched_user else None,
            'attempt_id': str(attempt.id),
            'processing_time': processing_time,
        }, status=status.HTTP_200_OK if matched_user else status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_intentos(request):
    """
    Lista intentos de login facial con filtros simples.
    Query params: username, status, limit (por defecto 50)
    """
    try:
        username = request.GET.get('username')
        status_filter = request.GET.get('status')
        limit = int(request.GET.get('limit', 50))
        
        qs = FaceLoginAttempt.objects.all().order_by('-created_at')
        if username:
            qs = qs.filter(user__username=username)
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        attempts = []
        for a in qs[:limit]:
            attempts.append({
                'id': str(a.id),
                'username': a.user.username if a.user else None,
                'ip_address': a.ip_address,
                'status': a.status,
                'confidence_score': a.confidence_score,
                'processing_time': a.processing_time,
                'failure_reason': a.failure_reason,
                'created_at': a.created_at.isoformat(),
            })
        
        return Response({'success': True, 'attempts': attempts, 'count': len(attempts)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_ips_bloqueadas(request):
    """
    Lista IPs bloqueadas actualmente.
    """
    try:
        now = timezone.now()
        qs = BlockedIP.objects.all()
        items = []
        for b in qs:
            items.append({
                'ip_address': b.ip_address,
                'reason': b.reason,
                'failed_attempts_count': b.failed_attempts_count,
                'blocked_until': b.blocked_until.isoformat(),
                'currently_blocked': b.is_currently_blocked(),
                'notes': b.notes,
                'is_permanent': b.is_permanent,
            })
        return Response({'success': True, 'blocked_ips': items, 'count': len(items)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)