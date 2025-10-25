"""
Modelos para la aplicación de detección de fraudes.
"""

from django.db import models
from django.utils import timezone
import json


class FraudDetectionRule(models.Model):
    """
    Modelo para definir reglas de detección de fraude.
    """
    
    RULE_TYPES = [
        ('amount_threshold', 'Umbral de monto'),
        ('frequency_limit', 'Límite de frecuencia'),
        ('location_anomaly', 'Anomalía de ubicación'),
        ('time_pattern', 'Patrón de tiempo'),
        ('velocity_check', 'Verificación de velocidad'),
        ('blacklist_check', 'Verificación de lista negra'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Bajo'),
        ('medium', 'Medio'),
        ('high', 'Alto'),
        ('critical', 'Crítico'),
    ]
    
    name = models.CharField(
        max_length=100,
        verbose_name="Nombre de la regla"
    )
    
    description = models.TextField(
        verbose_name="Descripción"
    )
    
    rule_type = models.CharField(
        max_length=50,
        choices=RULE_TYPES,
        verbose_name="Tipo de regla"
    )
    
    parameters = models.JSONField(
        default=dict,
        verbose_name="Parámetros de la regla",
        help_text="JSON con parámetros específicos de la regla"
    )
    
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_LEVELS,
        default='medium',
        verbose_name="Nivel de severidad"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activa"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Creado en"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Actualizado en"
    )
    
    class Meta:
        verbose_name = "Regla de detección de fraude"
        verbose_name_plural = "Reglas de detección de fraude"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.rule_type})"


class FraudAlert(models.Model):
    """
    Modelo para registrar alertas de fraude detectadas.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('investigating', 'Investigando'),
        ('confirmed', 'Confirmado'),
        ('false_positive', 'Falso positivo'),
        ('resolved', 'Resuelto'),
    ]
    
    transaction_id = models.CharField(
        max_length=100,
        verbose_name="ID de transacción"
    )
    
    rule = models.ForeignKey(
        FraudDetectionRule,
        on_delete=models.CASCADE,
        verbose_name="Regla activada"
    )
    
    risk_score = models.FloatField(
        verbose_name="Puntuación de riesgo",
        help_text="Valor entre 0 y 100"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Estado"
    )
    
    transaction_data = models.JSONField(
        verbose_name="Datos de la transacción"
    )
    
    detection_details = models.JSONField(
        default=dict,
        verbose_name="Detalles de la detección"
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name="Notas"
    )
    
    investigated_by = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Investigado por"
    )
    
    investigated_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Investigado en"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Creado en"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Actualizado en"
    )
    
    class Meta:
        verbose_name = "Alerta de fraude"
        verbose_name_plural = "Alertas de fraude"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
            models.Index(fields=['risk_score']),
        ]
    
    def __str__(self):
        return f"Alerta {self.transaction_id} - {self.rule.name}"


class FraudAnalysisLog(models.Model):
    """
    Modelo para registrar análisis de fraude realizados.
    """
    
    ANALYSIS_TYPES = [
        ('single_transaction', 'Transacción individual'),
        ('batch_analysis', 'Análisis por lotes'),
        ('pattern_analysis', 'Análisis de patrones'),
        ('risk_assessment', 'Evaluación de riesgo'),
    ]
    
    analysis_type = models.CharField(
        max_length=50,
        choices=ANALYSIS_TYPES,
        verbose_name="Tipo de análisis"
    )
    
    transactions_analyzed = models.IntegerField(
        default=0,
        verbose_name="Transacciones analizadas"
    )
    
    alerts_generated = models.IntegerField(
        default=0,
        verbose_name="Alertas generadas"
    )
    
    high_risk_count = models.IntegerField(
        default=0,
        verbose_name="Transacciones de alto riesgo"
    )
    
    processing_time = models.FloatField(
        verbose_name="Tiempo de procesamiento (segundos)"
    )
    
    parameters_used = models.JSONField(
        default=dict,
        verbose_name="Parámetros utilizados"
    )
    
    results_summary = models.JSONField(
        default=dict,
        verbose_name="Resumen de resultados"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Creado en"
    )
    
    class Meta:
        verbose_name = "Log de análisis de fraude"
        verbose_name_plural = "Logs de análisis de fraude"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.analysis_type} - {self.transactions_analyzed} transacciones"


class BlacklistedEntity(models.Model):
    """
    Modelo para entidades en lista negra.
    """
    
    ENTITY_TYPES = [
        ('account', 'Cuenta'),
        ('card', 'Tarjeta'),
        ('ip_address', 'Dirección IP'),
        ('device', 'Dispositivo'),
        ('email', 'Email'),
        ('phone', 'Teléfono'),
    ]
    
    entity_type = models.CharField(
        max_length=20,
        choices=ENTITY_TYPES,
        verbose_name="Tipo de entidad"
    )
    
    entity_value = models.CharField(
        max_length=255,
        verbose_name="Valor de la entidad"
    )
    
    reason = models.TextField(
        verbose_name="Razón del bloqueo"
    )
    
    risk_level = models.CharField(
        max_length=20,
        choices=FraudDetectionRule.SEVERITY_LEVELS,
        default='high',
        verbose_name="Nivel de riesgo"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    
    expires_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Expira en"
    )
    
    added_by = models.CharField(
        max_length=100,
        verbose_name="Agregado por"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Creado en"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Actualizado en"
    )
    
    class Meta:
        verbose_name = "Entidad en lista negra"
        verbose_name_plural = "Entidades en lista negra"
        unique_together = ['entity_type', 'entity_value']
        indexes = [
            models.Index(fields=['entity_type', 'entity_value']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.entity_type}: {self.entity_value}"
    
    def is_expired(self):
        """Verifica si la entrada ha expirado."""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False