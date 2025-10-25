"""
Modelos para la aplicación de login facial.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class FaceEncoding(models.Model):
    """
    Modelo para almacenar las codificaciones faciales de los usuarios.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='face_encodings')
    encoding_data = models.JSONField(
        help_text="Datos de codificación facial en formato JSON"
    )
    encoding_version = models.CharField(
        max_length=20,
        default='1.0',
        help_text="Versión del algoritmo de codificación utilizado"
    )
    confidence_score = models.FloatField(
        default=0.0,
        help_text="Puntuación de confianza de la codificación (0-100)"
    )
    image_quality_score = models.FloatField(
        default=0.0,
        help_text="Puntuación de calidad de la imagen utilizada (0-100)"
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Indica si esta es la codificación principal del usuario"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Indica si esta codificación está activa"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'face_encodings'
        verbose_name = 'Codificación Facial'
        verbose_name_plural = 'Codificaciones Faciales'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['is_primary', 'is_active']),
        ]
    
    def __str__(self):
        return f"Codificación facial de {self.user.username} - {self.encoding_version}"


class FaceLoginAttempt(models.Model):
    """
    Modelo para registrar intentos de login facial.
    """
    STATUS_CHOICES = [
        ('success', 'Exitoso'),
        ('failed', 'Fallido'),
        ('blocked', 'Bloqueado'),
        ('error', 'Error'),
    ]
    
    FAILURE_REASON_CHOICES = [
        ('no_face_detected', 'No se detectó rostro'),
        ('multiple_faces', 'Múltiples rostros detectados'),
        ('low_quality', 'Calidad de imagen baja'),
        ('no_match', 'No hay coincidencia'),
        ('low_confidence', 'Confianza baja'),
        ('user_blocked', 'Usuario bloqueado'),
        ('system_error', 'Error del sistema'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='face_login_attempts'
    )
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    confidence_score = models.FloatField(
        null=True, 
        blank=True,
        help_text="Puntuación de confianza del reconocimiento (0-100)"
    )
    processing_time = models.FloatField(
        null=True, 
        blank=True,
        help_text="Tiempo de procesamiento en segundos"
    )
    failure_reason = models.CharField(
        max_length=50, 
        choices=FAILURE_REASON_CHOICES,
        null=True, 
        blank=True
    )
    image_metadata = models.JSONField(
        null=True, 
        blank=True,
        help_text="Metadatos de la imagen procesada"
    )
    detection_details = models.JSONField(
        null=True, 
        blank=True,
        help_text="Detalles técnicos de la detección"
    )
    session_id = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        help_text="ID de sesión para rastreo"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'face_login_attempts'
        verbose_name = 'Intento de Login Facial'
        verbose_name_plural = 'Intentos de Login Facial'
        indexes = [
            models.Index(fields=['user', 'status', 'created_at']),
            models.Index(fields=['ip_address', 'created_at']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        username = self.user.username if self.user else 'Usuario desconocido'
        return f"Intento de login facial - {username} - {self.status} - {self.created_at}"


class FaceRecognitionSettings(models.Model):
    """
    Modelo para configuraciones del sistema de reconocimiento facial.
    """
    ALGORITHM_CHOICES = [
        ('dlib', 'Dlib HOG + Linear SVM'),
        ('mtcnn', 'MTCNN'),
        ('opencv_dnn', 'OpenCV DNN'),
        ('face_recognition', 'Face Recognition Library'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Nombre de la configuración"
    )
    description = models.TextField(
        blank=True,
        help_text="Descripción de la configuración"
    )
    algorithm = models.CharField(
        max_length=50,
        choices=ALGORITHM_CHOICES,
        default='face_recognition'
    )
    confidence_threshold = models.FloatField(
        default=0.6,
        help_text="Umbral mínimo de confianza para aceptar un reconocimiento (0-1)"
    )
    max_face_distance = models.FloatField(
        default=0.6,
        help_text="Distancia máxima entre rostros para considerarlos iguales"
    )
    min_face_size = models.IntegerField(
        default=50,
        help_text="Tamaño mínimo de rostro en píxeles"
    )
    max_image_size = models.IntegerField(
        default=1024,
        help_text="Tamaño máximo de imagen en píxeles"
    )
    quality_threshold = models.FloatField(
        default=0.5,
        help_text="Umbral mínimo de calidad de imagen (0-1)"
    )
    max_attempts_per_minute = models.IntegerField(
        default=5,
        help_text="Máximo número de intentos por minuto por IP"
    )
    max_failed_attempts = models.IntegerField(
        default=3,
        help_text="Máximo número de intentos fallidos antes de bloquear"
    )
    block_duration_minutes = models.IntegerField(
        default=15,
        help_text="Duración del bloqueo en minutos"
    )
    enable_liveness_detection = models.BooleanField(
        default=False,
        help_text="Habilitar detección de vida (anti-spoofing)"
    )
    additional_parameters = models.JSONField(
        default=dict,
        blank=True,
        help_text="Parámetros adicionales específicos del algoritmo"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Indica si esta configuración está activa"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'face_recognition_settings'
        verbose_name = 'Configuración de Reconocimiento Facial'
        verbose_name_plural = 'Configuraciones de Reconocimiento Facial'
    
    def __str__(self):
        return f"Configuración: {self.name} - {self.algorithm}"


class BlockedIP(models.Model):
    """
    Modelo para IPs bloqueadas por intentos fallidos de login facial.
    """
    BLOCK_REASON_CHOICES = [
        ('too_many_attempts', 'Demasiados intentos'),
        ('suspicious_activity', 'Actividad sospechosa'),
        ('manual_block', 'Bloqueo manual'),
        ('security_violation', 'Violación de seguridad'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ip_address = models.GenericIPAddressField(unique=True)
    reason = models.CharField(max_length=50, choices=BLOCK_REASON_CHOICES)
    failed_attempts_count = models.IntegerField(default=0)
    blocked_at = models.DateTimeField(auto_now_add=True)
    blocked_until = models.DateTimeField(
        help_text="Fecha y hora hasta la cual está bloqueada la IP"
    )
    notes = models.TextField(
        blank=True,
        help_text="Notas adicionales sobre el bloqueo"
    )
    is_permanent = models.BooleanField(
        default=False,
        help_text="Indica si el bloqueo es permanente"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blocked_ips_created'
    )
    
    class Meta:
        db_table = 'blocked_ips'
        verbose_name = 'IP Bloqueada'
        verbose_name_plural = 'IPs Bloqueadas'
        indexes = [
            models.Index(fields=['ip_address', 'blocked_until']),
            models.Index(fields=['is_permanent']),
        ]
    
    def __str__(self):
        return f"IP Bloqueada: {self.ip_address} - {self.reason}"
    
    def is_currently_blocked(self):
        """
        Verifica si la IP está actualmente bloqueada.
        """
        if self.is_permanent:
            return True
        return timezone.now() < self.blocked_until