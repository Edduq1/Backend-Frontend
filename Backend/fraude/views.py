"""
Vistas para la aplicación de detección de fraudes.
"""

import time
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from BD.operaciones import get_operations
from .models import FraudDetectionRule, FraudAlert, FraudAnalysisLog, BlacklistedEntity


class FraudDetector:
    """
    Clase principal para detección de fraudes.
    """
    
    def __init__(self):
        self.operations = get_operations(admin=True)
        self.rules = FraudDetectionRule.objects.filter(is_active=True)
    
    def analyze_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analiza una transacción individual para detectar fraude.
        
        Args:
            transaction_data (dict): Datos de la transacción
        
        Returns:
            dict: Resultado del análisis
        """
        start_time = time.time()
        alerts = []
        risk_score = 0.0
        
        try:
            # Verificar lista negra primero
            blacklist_result = self._check_blacklist(transaction_data)
            if blacklist_result['is_blacklisted']:
                risk_score = 100.0
                alerts.append({
                    'rule_type': 'blacklist_check',
                    'severity': 'critical',
                    'message': blacklist_result['message'],
                    'details': blacklist_result['details']
                })
            
            # Aplicar reglas de detección
            for rule in self.rules:
                rule_result = self._apply_rule(rule, transaction_data)
                if rule_result['triggered']:
                    alerts.append(rule_result)
                    risk_score = max(risk_score, rule_result['risk_score'])
            
            # Calcular puntuación final
            final_risk_score = min(100.0, risk_score)
            
            processing_time = time.time() - start_time
            
            return {
                'success': True,
                'transaction_id': transaction_data.get('id', 'unknown'),
                'risk_score': final_risk_score,
                'risk_level': self._get_risk_level(final_risk_score),
                'alerts': alerts,
                'processing_time': processing_time,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'transaction_id': transaction_data.get('id', 'unknown')
            }
    
    def _check_blacklist(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica si algún elemento de la transacción está en lista negra.
        """
        blacklisted_entities = BlacklistedEntity.objects.filter(is_active=True)
        
        for entity in blacklisted_entities:
            if entity.is_expired():
                continue
                
            # Verificar según el tipo de entidad
            if entity.entity_type == 'account' and transaction_data.get('account_id') == entity.entity_value:
                return {
                    'is_blacklisted': True,
                    'message': f'Cuenta en lista negra: {entity.entity_value}',
                    'details': {'reason': entity.reason, 'risk_level': entity.risk_level}
                }
            elif entity.entity_type == 'card' and transaction_data.get('card_number') == entity.entity_value:
                return {
                    'is_blacklisted': True,
                    'message': f'Tarjeta en lista negra: {entity.entity_value}',
                    'details': {'reason': entity.reason, 'risk_level': entity.risk_level}
                }
            elif entity.entity_type == 'ip_address' and transaction_data.get('ip_address') == entity.entity_value:
                return {
                    'is_blacklisted': True,
                    'message': f'IP en lista negra: {entity.entity_value}',
                    'details': {'reason': entity.reason, 'risk_level': entity.risk_level}
                }
        
        return {'is_blacklisted': False}
    
    def _apply_rule(self, rule: FraudDetectionRule, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aplica una regla específica a la transacción.
        """
        try:
            if rule.rule_type == 'amount_threshold':
                return self._check_amount_threshold(rule, transaction_data)
            elif rule.rule_type == 'frequency_limit':
                return self._check_frequency_limit(rule, transaction_data)
            elif rule.rule_type == 'location_anomaly':
                return self._check_location_anomaly(rule, transaction_data)
            elif rule.rule_type == 'time_pattern':
                return self._check_time_pattern(rule, transaction_data)
            elif rule.rule_type == 'velocity_check':
                return self._check_velocity(rule, transaction_data)
            else:
                return {'triggered': False}
                
        except Exception as e:
            return {
                'triggered': True,
                'rule_type': rule.rule_type,
                'severity': 'medium',
                'risk_score': 30.0,
                'message': f'Error al aplicar regla: {str(e)}',
                'details': {'error': str(e)}
            }
    
    def _check_amount_threshold(self, rule: FraudDetectionRule, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica si el monto excede el umbral definido.
        """
        amount = float(transaction_data.get('amount', 0))
        threshold = float(rule.parameters.get('threshold', 10000))
        
        if amount > threshold:
            risk_score = min(100.0, (amount / threshold) * 50)
            return {
                'triggered': True,
                'rule_type': rule.rule_type,
                'rule_name': rule.name,
                'severity': rule.severity,
                'risk_score': risk_score,
                'message': f'Monto {amount} excede umbral de {threshold}',
                'details': {
                    'amount': amount,
                    'threshold': threshold,
                    'excess_percentage': ((amount - threshold) / threshold) * 100
                }
            }
        
        return {'triggered': False}
    
    def _check_frequency_limit(self, rule: FraudDetectionRule, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica si se excede el límite de frecuencia de transacciones.
        """
        account_id = transaction_data.get('account_id')
        if not account_id:
            return {'triggered': False}
        
        # Obtener parámetros de la regla
        time_window = rule.parameters.get('time_window_minutes', 60)
        max_transactions = rule.parameters.get('max_transactions', 5)
        
        # Calcular ventana de tiempo
        end_time = timezone.now()
        start_time = end_time - timedelta(minutes=time_window)
        
        # Simular consulta de transacciones recientes (en producción sería una consulta real)
        # Por ahora, asumimos que no se excede el límite
        recent_transactions = 0  # Aquí iría la consulta real
        
        if recent_transactions > max_transactions:
            risk_score = min(100.0, (recent_transactions / max_transactions) * 60)
            return {
                'triggered': True,
                'rule_type': rule.rule_type,
                'rule_name': rule.name,
                'severity': rule.severity,
                'risk_score': risk_score,
                'message': f'{recent_transactions} transacciones en {time_window} minutos (límite: {max_transactions})',
                'details': {
                    'recent_transactions': recent_transactions,
                    'max_allowed': max_transactions,
                    'time_window': time_window
                }
            }
        
        return {'triggered': False}
    
    def _check_location_anomaly(self, rule: FraudDetectionRule, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica anomalías de ubicación.
        """
        current_location = transaction_data.get('location')
        if not current_location:
            return {'triggered': False}
        
        # Simular verificación de ubicación (en producción sería más complejo)
        suspicious_countries = rule.parameters.get('suspicious_countries', [])
        if current_location.get('country') in suspicious_countries:
            return {
                'triggered': True,
                'rule_type': rule.rule_type,
                'rule_name': rule.name,
                'severity': rule.severity,
                'risk_score': 70.0,
                'message': f'Transacción desde país sospechoso: {current_location.get("country")}',
                'details': {
                    'location': current_location,
                    'suspicious_countries': suspicious_countries
                }
            }
        
        return {'triggered': False}
    
    def _check_time_pattern(self, rule: FraudDetectionRule, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica patrones de tiempo sospechosos.
        """
        transaction_time = datetime.fromisoformat(transaction_data.get('timestamp', timezone.now().isoformat()))
        hour = transaction_time.hour
        
        # Verificar si es fuera de horario normal
        start_hour = rule.parameters.get('suspicious_start_hour', 23)
        end_hour = rule.parameters.get('suspicious_end_hour', 6)
        
        if start_hour <= hour or hour <= end_hour:
            return {
                'triggered': True,
                'rule_type': rule.rule_type,
                'rule_name': rule.name,
                'severity': rule.severity,
                'risk_score': 40.0,
                'message': f'Transacción en horario sospechoso: {hour:02d}:00',
                'details': {
                    'transaction_hour': hour,
                    'suspicious_window': f'{start_hour:02d}:00 - {end_hour:02d}:00'
                }
            }
        
        return {'triggered': False}
    
    def _check_velocity(self, rule: FraudDetectionRule, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica la velocidad de transacciones (múltiples transacciones en poco tiempo).
        """
        # Implementación simplificada
        # En producción, esto requeriría consultas a la base de datos
        return {'triggered': False}
    
    def _get_risk_level(self, risk_score: float) -> str:
        """
        Determina el nivel de riesgo basado en la puntuación.
        """
        if risk_score >= 80:
            return 'critical'
        elif risk_score >= 60:
            return 'high'
        elif risk_score >= 30:
            return 'medium'
        else:
            return 'low'


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def detectar_fraude(request):
    """
    Endpoint para detección de fraude.
    
    GET /fraude/detectar/ - Obtiene estadísticas de detección
    POST /fraude/detectar/ - Analiza una transacción para detectar fraude
    
    POST Body:
    {
        "transaction": {
            "id": "txn_123456",
            "amount": 5000.00,
            "account_id": "acc_789",
            "card_number": "****1234",
            "timestamp": "2024-01-15T10:30:00Z",
            "location": {
                "country": "PE",
                "city": "Lima"
            },
            "ip_address": "192.168.1.1"
        }
    }
    """
    if request.method == 'GET':
        try:
            # Obtener estadísticas de detección
            total_alerts = FraudAlert.objects.count()
            pending_alerts = FraudAlert.objects.filter(status='pending').count()
            high_risk_alerts = FraudAlert.objects.filter(risk_score__gte=70).count()
            
            # Estadísticas de los últimos 30 días
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_alerts = FraudAlert.objects.filter(created_at__gte=thirty_days_ago).count()
            
            # Reglas activas
            active_rules = FraudDetectionRule.objects.filter(is_active=True).count()
            
            return Response({
                'success': True,
                'statistics': {
                    'total_alerts': total_alerts,
                    'pending_alerts': pending_alerts,
                    'high_risk_alerts': high_risk_alerts,
                    'recent_alerts_30d': recent_alerts,
                    'active_rules': active_rules
                },
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            # Validar datos de entrada
            transaction_data = request.data.get('transaction')
            if not transaction_data:
                return Response({
                    'success': False,
                    'error': 'Se requieren datos de transacción'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Inicializar detector
            detector = FraudDetector()
            
            # Analizar transacción
            analysis_result = detector.analyze_transaction(transaction_data)
            
            if analysis_result['success']:
                # Crear alertas si es necesario
                if analysis_result['risk_score'] >= 30:  # Umbral mínimo para crear alerta
                    for alert_data in analysis_result['alerts']:
                        # Buscar la regla correspondiente
                        try:
                            rule = FraudDetectionRule.objects.get(
                                rule_type=alert_data['rule_type'],
                                is_active=True
                            )
                            
                            # Crear alerta
                            FraudAlert.objects.create(
                                transaction_id=analysis_result['transaction_id'],
                                rule=rule,
                                risk_score=analysis_result['risk_score'],
                                transaction_data=transaction_data,
                                detection_details=alert_data
                            )
                        except FraudDetectionRule.DoesNotExist:
                            continue
                
                # Registrar análisis
                FraudAnalysisLog.objects.create(
                    analysis_type='single_transaction',
                    transactions_analyzed=1,
                    alerts_generated=len(analysis_result['alerts']),
                    high_risk_count=1 if analysis_result['risk_score'] >= 70 else 0,
                    processing_time=analysis_result['processing_time'],
                    parameters_used={'threshold': 30},
                    results_summary=analysis_result
                )
            
            return Response(analysis_result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_alertas(request):
    """
    Obtiene las alertas de fraude.
    
    GET /fraude/alertas/
    
    Query parameters:
    - status: Filtrar por estado (pending, investigating, confirmed, false_positive, resolved)
    - risk_level: Filtrar por nivel de riesgo (low, medium, high, critical)
    - limit: Número máximo de resultados (default: 50)
    """
    try:
        # Obtener parámetros de consulta
        status_filter = request.GET.get('status')
        risk_level = request.GET.get('risk_level')
        limit = int(request.GET.get('limit', 50))
        
        # Construir consulta
        queryset = FraudAlert.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if risk_level:
            if risk_level == 'critical':
                queryset = queryset.filter(risk_score__gte=80)
            elif risk_level == 'high':
                queryset = queryset.filter(risk_score__gte=60, risk_score__lt=80)
            elif risk_level == 'medium':
                queryset = queryset.filter(risk_score__gte=30, risk_score__lt=60)
            elif risk_level == 'low':
                queryset = queryset.filter(risk_score__lt=30)
        
        # Limitar resultados
        alerts = queryset[:limit]
        
        # Serializar datos
        alerts_data = []
        for alert in alerts:
            alerts_data.append({
                'id': alert.id,
                'transaction_id': alert.transaction_id,
                'rule_name': alert.rule.name,
                'rule_type': alert.rule.rule_type,
                'risk_score': alert.risk_score,
                'risk_level': 'critical' if alert.risk_score >= 80 else 
                            'high' if alert.risk_score >= 60 else
                            'medium' if alert.risk_score >= 30 else 'low',
                'status': alert.status,
                'transaction_data': alert.transaction_data,
                'detection_details': alert.detection_details,
                'notes': alert.notes,
                'investigated_by': alert.investigated_by,
                'investigated_at': alert.investigated_at.isoformat() if alert.investigated_at else None,
                'created_at': alert.created_at.isoformat()
            })
        
        return Response({
            'success': True,
            'alerts': alerts_data,
            'count': len(alerts_data),
            'total_count': queryset.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def gestionar_reglas(request):
    """
    Gestiona las reglas de detección de fraude.
    
    GET /fraude/reglas/ - Obtiene todas las reglas
    POST /fraude/reglas/ - Crea una nueva regla
    """
    if request.method == 'GET':
        try:
            reglas = FraudDetectionRule.objects.all()
            
            reglas_data = []
            for regla in reglas:
                reglas_data.append({
                    'id': regla.id,
                    'name': regla.name,
                    'description': regla.description,
                    'rule_type': regla.rule_type,
                    'parameters': regla.parameters,
                    'severity': regla.severity,
                    'is_active': regla.is_active,
                    'created_at': regla.created_at.isoformat()
                })
            
            return Response({
                'success': True,
                'rules': reglas_data,
                'count': len(reglas_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            # Validar datos requeridos
            required_fields = ['name', 'description', 'rule_type', 'parameters']
            for field in required_fields:
                if not request.data.get(field):
                    return Response({
                        'success': False,
                        'error': f'El campo "{field}" es requerido'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear nueva regla
            regla = FraudDetectionRule.objects.create(
                name=request.data['name'],
                description=request.data['description'],
                rule_type=request.data['rule_type'],
                parameters=request.data['parameters'],
                severity=request.data.get('severity', 'medium'),
                is_active=request.data.get('is_active', True)
            )
            
            return Response({
                'success': True,
                'rule': {
                    'id': regla.id,
                    'name': regla.name,
                    'description': regla.description,
                    'rule_type': regla.rule_type,
                    'parameters': regla.parameters,
                    'severity': regla.severity,
                    'is_active': regla.is_active
                },
                'message': 'Regla de detección creada exitosamente'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)