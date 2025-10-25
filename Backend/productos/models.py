"""
Modelos para la aplicación de gestión de productos financieros.
"""

import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class ProductCategory(models.Model):
    """
    Modelo para categorías de productos financieros.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Nombre de la categoría"
    )
    description = models.TextField(
        blank=True,
        help_text="Descripción de la categoría"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Código único de la categoría"
    )
    parent_category = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories',
        help_text="Categoría padre para jerarquía"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Orden de visualización"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Indica si la categoría está activa"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product_categories'
        verbose_name = 'Categoría de Producto'
        verbose_name_plural = 'Categorías de Productos'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class FinancialProduct(models.Model):
    """
    Modelo principal para productos financieros.
    """
    PRODUCT_TYPE_CHOICES = [
        ('savings_account', 'Cuenta de Ahorros'),
        ('checking_account', 'Cuenta Corriente'),
        ('credit_card', 'Tarjeta de Crédito'),
        ('debit_card', 'Tarjeta de Débito'),
        ('personal_loan', 'Préstamo Personal'),
        ('mortgage', 'Hipoteca'),
        ('investment', 'Inversión'),
        ('insurance', 'Seguro'),
        ('certificate_deposit', 'Certificado de Depósito'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('discontinued', 'Descontinuado'),
        ('pending_approval', 'Pendiente de Aprobación'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=200,
        help_text="Nombre del producto"
    )
    description = models.TextField(
        help_text="Descripción detallada del producto"
    )
    short_description = models.CharField(
        max_length=500,
        blank=True,
        help_text="Descripción corta para listados"
    )
    product_code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código único del producto"
    )
    product_type = models.CharField(
        max_length=50,
        choices=PRODUCT_TYPE_CHOICES,
        help_text="Tipo de producto financiero"
    )
    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.PROTECT,
        related_name='products',
        help_text="Categoría del producto"
    )
    
    # Información financiera
    base_interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('1'))],
        help_text="Tasa de interés base (como decimal, ej: 0.05 para 5%)"
    )
    minimum_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Monto mínimo requerido"
    )
    maximum_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Monto máximo permitido"
    )
    monthly_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Cuota mensual del producto"
    )
    setup_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Costo de apertura/configuración"
    )
    
    # Configuración del producto
    requires_approval = models.BooleanField(
        default=True,
        help_text="Indica si requiere aprobación para contratación"
    )
    minimum_age = models.IntegerField(
        default=18,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        help_text="Edad mínima requerida"
    )
    maximum_age = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        help_text="Edad máxima permitida"
    )
    minimum_income = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Ingreso mínimo requerido"
    )
    
    # Estado y metadatos
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    launch_date = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de lanzamiento del producto"
    )
    discontinuation_date = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de descontinuación del producto"
    )
    terms_and_conditions = models.TextField(
        blank=True,
        help_text="Términos y condiciones del producto"
    )
    features = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de características del producto"
    )
    benefits = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de beneficios del producto"
    )
    requirements = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de requisitos para el producto"
    )
    additional_info = models.JSONField(
        default=dict,
        blank=True,
        help_text="Información adicional del producto"
    )
    
    # Auditoría
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products_created'
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products_updated'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'financial_products'
        verbose_name = 'Producto Financiero'
        verbose_name_plural = 'Productos Financieros'
        indexes = [
            models.Index(fields=['product_type', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['status', 'launch_date']),
        ]
    
    def __str__(self):
        return f"{self.product_code} - {self.name}"
    
    def is_available(self):
        """
        Verifica si el producto está disponible para contratación.
        """
        if self.status != 'active':
            return False
        
        today = timezone.now().date()
        
        if self.launch_date and self.launch_date > today:
            return False
        
        if self.discontinuation_date and self.discontinuation_date <= today:
            return False
        
        return True


class ProductApplication(models.Model):
    """
    Modelo para solicitudes de productos financieros.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('under_review', 'En Revisión'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('cancelled', 'Cancelado'),
        ('completed', 'Completado'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Número único de solicitud"
    )
    product = models.ForeignKey(
        FinancialProduct,
        on_delete=models.PROTECT,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='product_applications'
    )
    
    # Información de la solicitud
    requested_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Monto solicitado"
    )
    applicant_data = models.JSONField(
        default=dict,
        help_text="Datos del solicitante"
    )
    supporting_documents = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de documentos de soporte"
    )
    
    # Estado y procesamiento
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_applications'
    )
    
    # Fechas importantes
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    
    # Notas y comentarios
    applicant_notes = models.TextField(
        blank=True,
        help_text="Notas del solicitante"
    )
    internal_notes = models.TextField(
        blank=True,
        help_text="Notas internas del procesamiento"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Razón de rechazo si aplica"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product_applications'
        verbose_name = 'Solicitud de Producto'
        verbose_name_plural = 'Solicitudes de Productos'
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['applicant', 'status']),
            models.Index(fields=['product', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]
    
    def __str__(self):
        return f"Solicitud {self.application_number} - {self.product.name}"


class ProductRecommendation(models.Model):
    """
    Modelo para recomendaciones de productos basadas en el perfil del usuario.
    """
    RECOMMENDATION_TYPE_CHOICES = [
        ('profile_based', 'Basada en Perfil'),
        ('behavior_based', 'Basada en Comportamiento'),
        ('collaborative', 'Colaborativa'),
        ('content_based', 'Basada en Contenido'),
        ('hybrid', 'Híbrida'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='product_recommendations'
    )
    product = models.ForeignKey(
        FinancialProduct,
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    
    # Información de la recomendación
    recommendation_type = models.CharField(
        max_length=20,
        choices=RECOMMENDATION_TYPE_CHOICES
    )
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Puntuación de confianza de la recomendación (0-1)"
    )
    relevance_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Puntuación de relevancia para el usuario (0-1)"
    )
    
    # Razones de la recomendación
    recommendation_reasons = models.JSONField(
        default=list,
        help_text="Lista de razones para la recomendación"
    )
    user_profile_factors = models.JSONField(
        default=dict,
        help_text="Factores del perfil del usuario considerados"
    )
    
    # Estado de la recomendación
    is_active = models.BooleanField(
        default=True,
        help_text="Indica si la recomendación está activa"
    )
    shown_to_user = models.BooleanField(
        default=False,
        help_text="Indica si se ha mostrado al usuario"
    )
    user_response = models.CharField(
        max_length=20,
        choices=[
            ('interested', 'Interesado'),
            ('not_interested', 'No Interesado'),
            ('applied', 'Solicitó'),
            ('dismissed', 'Descartó'),
        ],
        null=True,
        blank=True
    )
    
    # Fechas
    generated_at = models.DateTimeField(auto_now_add=True)
    shown_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de expiración de la recomendación"
    )
    
    class Meta:
        db_table = 'product_recommendations'
        verbose_name = 'Recomendación de Producto'
        verbose_name_plural = 'Recomendaciones de Productos'
        unique_together = ['user', 'product', 'recommendation_type']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['confidence_score', 'relevance_score']),
            models.Index(fields=['generated_at', 'expires_at']),
        ]
    
    def __str__(self):
        return f"Recomendación para {self.user.username} - {self.product.name}"
    
    def is_expired(self):
        """
        Verifica si la recomendación ha expirado.
        """
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at