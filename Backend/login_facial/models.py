# En backend/login_facial/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
import uuid

class UsuarioManager(BaseUserManager):
    # (Tu UsuarioManager de backend2/login/models/models.py va aquí)
    # ...
    # ¡IMPORTANTE! Modifica create_user y create_superuser para que:
    # 1. Usen 'id' como un CharField (ej. 'u-001') y no un AutoField.
    # 2. Se alineen a los campos de REGISTRO_USUARIOS (dni, nombres, apellidos, rol).
    # 3. No requieran 'password'.
    def create_user(self, dni, nombres, apellidos, rol, email=None, **extra_fields):
        if not dni:
            raise ValueError('El DNI es obligatorio')

        # Generar ID de texto único
        user_id = extra_fields.pop('id', f'u-{uuid.uuid4().hex[:6]}')

        user = self.model(
            id=user_id,
            dni=dni,
            nombres=nombres,
            apellidos=apellidos,
            email=self.normalize_email(email) if email else None,
            rol=rol,
            **extra_fields
        )
        user.set_unusable_password() # No usamos passwords de Django
        user.save(using=self._db)
        return user

    def create_superuser(self, dni, nombres, apellidos, rol='Administrador', email=None, password=None, **extra_fields):
        # ... (Lógica adaptada para campos de Supabase) ...
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('estado', 'Activo')

        return self.create_user(dni, nombres, apellidos, rol, email, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    # --- Campos Mapeados 1:1 con REGISTRO_USUARIOS ---
    id = models.CharField(max_length=16, primary_key=True) #
    dni = models.CharField(max_length=8, unique=True, null=False) #
    nombres = models.CharField(max_length=80, null=False) #
    apellidos = models.CharField(max_length=120, null=False) #
    rol = models.CharField(max_length=20, choices=[('Administrador', 'Administrador'), ('Analista', 'Analista')]) #
    estado = models.CharField(max_length=10, choices=[('Activo', 'Activo'), ('Inactivo', 'Inactivo')], default='Activo') #
    email = models.EmailField(max_length=120, null=True, blank=True, unique=True) #
    created_at = models.DateTimeField(default=timezone.now) #
    face_registered = models.BooleanField(default=False, null=False) #

    # --- Campos de tu lógica facial (backend2) ---
    # Estos se guardarán como columnas JSONB en PostgreSQL
    facial_embeddings = models.JSONField(default=list, blank=True)
    positions = models.JSONField(default=list, blank=True)
    failed_attempts = models.IntegerField(default=0)

    # --- Campos requeridos por Django para Admin y Auth ---
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    # 'is_active' se maneja con una propiedad:
    @property
    def is_active(self):
        return self.estado == 'Activo'

    objects = UsuarioManager()

    # Usamos DNI para login en Django admin, ya que email puede ser nulo
    USERNAME_FIELD = 'dni' 
    REQUIRED_FIELDS = ['nombres', 'apellidos', 'email', 'rol']

    class Meta:
        # ¡La línea más importante!
        # Le dice a Django que NO cree una tabla nueva,
        # sino que use la tabla existente de Supabase.
        db_table = 'REGISTRO_USUARIOS' 
        managed = False # Django no gestionará esta tabla (no borrar/crear)