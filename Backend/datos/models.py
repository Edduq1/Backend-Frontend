"""
Modelos para la aplicación de limpieza de datos.
"""

from django.db import models
from django.utils import timezone


class DataCleaningLog(models.Model):
    """
    Modelo para registrar las operaciones de limpieza de datos.
    """
    
    OPERATION_CHOICES = [
        ('remove_nulls', 'Eliminar valores nulos'),
        ('remove_duplicates', 'Eliminar duplicados'),
        ('normalize_text', 'Normalizar texto'),
        ('validate_format', 'Validar formato'),
        ('clean_all', 'Limpieza completa'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]
    
    operation_type = models.CharField(
        max_length=50,
        choices=OPERATION_CHOICES,
        verbose_name="Tipo de operación"
    )
    
    table_name = models.CharField(
        max_length=100,
        verbose_name="Nombre de tabla"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Estado"
    )
    
    records_processed = models.IntegerField(
        default=0,
        verbose_name="Registros procesados"
    )
    
    records_cleaned = models.IntegerField(
        default=0,
        verbose_name="Registros limpiados"
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name="Mensaje de error"
    )
    
    started_at = models.DateTimeField(
        default=timezone.now,
        verbose_name="Iniciado en"
    )
    
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Completado en"
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
        verbose_name = "Log de limpieza de datos"
        verbose_name_plural = "Logs de limpieza de datos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.operation_type} - {self.table_name} ({self.status})"
    
    def duration(self):
        """Calcula la duración de la operación."""
        if self.completed_at and self.started_at:
            return self.completed_at - self.started_at
        return None


class DataValidationRule(models.Model):
    """
    Modelo para definir reglas de validación de datos.
    """
    
    RULE_TYPES = [
        ('not_null', 'No nulo'),
        ('unique', 'Único'),
        ('format', 'Formato específico'),
        ('range', 'Rango de valores'),
        ('length', 'Longitud específica'),
    ]
    
    name = models.CharField(
        max_length=100,
        verbose_name="Nombre de la regla"
    )
    
    table_name = models.CharField(
        max_length=100,
        verbose_name="Nombre de tabla"
    )
    
    column_name = models.CharField(
        max_length=100,
        verbose_name="Nombre de columna"
    )
    
    rule_type = models.CharField(
        max_length=20,
        choices=RULE_TYPES,
        verbose_name="Tipo de regla"
    )
    
    rule_value = models.TextField(
        blank=True,
        null=True,
        verbose_name="Valor de la regla",
        help_text="JSON con parámetros específicos de la regla"
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
        verbose_name = "Regla de validación"
        verbose_name_plural = "Reglas de validación"
        unique_together = ['table_name', 'column_name', 'rule_type']
    
    def __str__(self):
        return f"{self.name} - {self.table_name}.{self.column_name}"