# Documentación Completa del Proyecto BCRP

## Tabla de Contenidos
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Estructura de Archivos y Directorios](#estructura-de-archivos-y-directorios)
3. [Configuración Técnica Detallada](#configuración-técnica-detallada)
4. [Guía de Implementación Paso a Paso](#guía-de-implementación-paso-a-paso)
5. [Documentación de Referencia](#documentación-de-referencia)
6. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## Resumen del Proyecto

**Proyecto BCRP** es una aplicación Django REST Framework que integra múltiples funcionalidades bancarias y de e-commerce, incluyendo:

- **Detección de Fraude**: Sistema de análisis de transacciones sospechosas
- **Login Facial**: Autenticación mediante reconocimiento facial
- **Gestión de Datos**: Limpieza y procesamiento de datos
- **Catálogo de Productos**: Sistema de e-commerce
- **Procesamiento de Pagos**: Simulación de transacciones
- **Integración Supabase**: Base de datos PostgreSQL en la nube

### Tecnologías Principales
- **Backend**: Django 4.2+ con Django REST Framework
- **Base de Datos**: PostgreSQL (Supabase) / SQLite (desarrollo)
- **Procesamiento de Imágenes**: OpenCV, Pillow, NumPy
- **Servicios en la Nube**: Supabase (BaaS)
- **Autenticación**: Sistema personalizado con reconocimiento facial

---

## Estructura de Archivos y Directorios

### Estructura Completa del Proyecto

```
BCRP/
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── manage.py                       # Script de gestión de Django
├── requirements.txt                # Dependencias del proyecto
├── README.md                       # Documentación básica
│
├── core/                          # Configuración principal del proyecto
│   ├── __init__.py
│   ├── settings.py                # Configuraciones de Django
│   ├── urls.py                    # URLs principales del proyecto
│   ├── wsgi.py                    # Configuración WSGI para producción
│   ├── asgi.py                    # Configuración ASGI para async
│   └── supabase.py                # Cliente y configuración de Supabase
│
├── BD/                            # Módulo de base de datos
│   ├── __init__.py
│   ├── config.py                  # Configuración de conexiones DB
│   └── operaciones.py             # Operaciones CRUD con Supabase
│
├── datos/                         # App de limpieza de datos
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                  # Modelos de datos (vacío por defecto)
│   ├── views.py                   # API para limpieza de datos
│   ├── urls.py                    # Rutas de la app
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
│
├── fraude/                        # App de detección de fraude
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                  # Modelos de fraude (vacío por defecto)
│   ├── views.py                   # Lógica de detección de fraude
│   ├── urls.py                    # Rutas de detección
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
│
├── login_facial/                  # App de autenticación facial
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                  # Modelos de usuarios (vacío por defecto)
│   ├── views.py                   # Procesamiento de imágenes faciales
│   ├── urls.py                    # Rutas de login facial
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
│
├── productos/                     # App de catálogo de productos
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                  # Modelos de productos (vacío por defecto)
│   ├── views.py                   # API de productos
│   ├── urls.py                    # Rutas de productos
│   ├── tests.py
│   └── migrations/
│       └── __init__.py
│
└── pago/                          # App de procesamiento de pagos
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py                  # Modelos de pagos (vacío por defecto)
    ├── views.py                   # Simulación de pagos
    ├── urls.py                    # Rutas de pagos
    ├── tests.py
    └── migrations/
        └── __init__.py
```

### Propósito de Cada Directorio

#### `/core/`
**Propósito**: Configuración central del proyecto Django
- `settings.py`: Configuraciones principales, apps instaladas, middleware, base de datos
- `urls.py`: Enrutamiento principal que incluye todas las apps
- `supabase.py`: Cliente centralizado para conexiones a Supabase
- `wsgi.py/asgi.py`: Configuraciones para servidores web

#### `/BD/`
**Propósito**: Módulo independiente para operaciones de base de datos
- `config.py`: Configuración de clientes Supabase y PostgreSQL directo
- `operaciones.py`: Funciones CRUD reutilizables para Supabase

#### `/datos/`
**Propósito**: Limpieza y procesamiento de datos
- **Funcionalidad**: Elimina registros nulos de tablas
- **Endpoint**: `POST /datos/limpiar/`

#### `/fraude/`
**Propósito**: Sistema de detección de fraude en transacciones
- **Funcionalidad**: Analiza patrones sospechosos (montos altos, frecuencia)
- **Endpoints**: `GET/POST /fraude/detectar/`

#### `/login_facial/`
**Propósito**: Autenticación mediante reconocimiento facial
- **Funcionalidad**: Detecta rostros usando OpenCV y Haar Cascades
- **Endpoint**: `POST /login-facial/login/`

#### `/productos/`
**Propósito**: Catálogo de productos para e-commerce
- **Funcionalidad**: Lista productos desde Supabase
- **Endpoint**: `GET /productos/`

#### `/pago/`
**Propósito**: Procesamiento y simulación de pagos
- **Funcionalidad**: Simula transacciones de pago
- **Endpoint**: `POST /pago/`

---

## Configuración Técnica Detallada

### Dependencias y Versiones Exactas

```txt
# requirements.txt
Django>=4.2,<6
djangorestframework>=3.15.0,<4
supabase>=2.0.0
psycopg2-binary>=2.9.9
python-dotenv>=1.0.1
opencv-python>=4.9.0
numpy>=1.26.0
Pillow>=10.0.0
requests>=2.31.0
```

### Variables de Entorno Requeridas

```env
# .env (basado en .env.example)

# Configuración Supabase
SUPABASE_URL="https://<your-project-id>.supabase.co"
SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

# Conexión directa a PostgreSQL
SUPABASE_DB_NAME="postgres"
SUPABASE_DB_USER="postgres"
SUPABASE_DB_PASSWORD="<db-password>"
SUPABASE_DB_HOST="db.<your-project-id>.supabase.co"
SUPABASE_DB_PORT="5432"

# Configuración Django (opcional)
DJANGO_SECRET_KEY="<your-secret-key>"
```

### Configuraciones Críticas en settings.py

```python
# Aplicaciones instaladas
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    # Apps del proyecto
    'ecommerce',      # Nota: Esta app aparece en settings pero no en estructura
    'fraude',
    'login_facial',
    'datos',
    'login_ecomerce', # Nota: Esta app aparece en settings pero no en estructura
    'productos',
    'pago',
]

# Configuración de base de datos dual (Supabase/SQLite)
# Se usa Supabase si todas las variables están presentes, sino SQLite
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",  # o sqlite3
        "NAME": SUPABASE_DB_NAME,  # o BASE_DIR / "db.sqlite3"
        "USER": SUPABASE_DB_USER,
        "PASSWORD": SUPABASE_DB_PASSWORD,
        "HOST": SUPABASE_DB_HOST,
        "PORT": SUPABASE_DB_PORT,
    }
}
```

### Configuración de Supabase

```python
# core/supabase.py
def get_supabase_client(service: bool = False) -> Client:
    """
    Devuelve cliente Supabase:
    - service=True: Usa SERVICE_ROLE_KEY (permisos admin)
    - service=False: Usa ANON_KEY (permisos limitados)
    """
```

---

## Guía de Implementación Paso a Paso

### Requisitos Previos del Sistema

#### Software Requerido
- **Python**: 3.8 o superior
- **pip**: Gestor de paquetes de Python
- **Git**: Control de versiones
- **Editor de código**: VS Code, PyCharm, etc.

#### Servicios Externos
- **Cuenta Supabase**: Para base de datos PostgreSQL
- **Proyecto Supabase configurado** con:
  - Tabla `productos` (campos: id, nombre, precio)
  - Tabla `transacciones` (campos: id, user_id, monto, timestamp)

### Proceso de Instalación Detallado

#### 1. Clonar y Configurar el Proyecto

```bash
# Crear directorio del proyecto
mkdir mi-proyecto-bcrp
cd mi-proyecto-bcrp

# Inicializar Git (opcional)
git init

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

#### 2. Crear Estructura de Directorios

```bash
# Crear estructura principal
mkdir core BD datos fraude login_facial productos pago

# Crear archivos __init__.py
touch core/__init__.py BD/__init__.py datos/__init__.py
touch fraude/__init__.py login_facial/__init__.py productos/__init__.py pago/__init__.py

# Para cada app Django, crear estructura completa
for app in datos fraude login_facial productos pago; do
    mkdir $app/migrations
    touch $app/{admin,apps,models,tests,urls,views}.py
    touch $app/migrations/__init__.py
done
```

#### 3. Instalar Dependencias

```bash
# Crear requirements.txt
cat > requirements.txt << EOF
Django>=4.2,<6
djangorestframework>=3.15.0,<4
supabase>=2.0.0
psycopg2-binary>=2.9.9
python-dotenv>=1.0.1
opencv-python>=4.9.0
numpy>=1.26.0
Pillow>=10.0.0
requests>=2.31.0
EOF

# Instalar dependencias
pip install -r requirements.txt
```

#### 4. Configurar Variables de Entorno

```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# SUPABASE_URL, SUPABASE_ANON_KEY, etc.
```

#### 5. Crear Archivos de Configuración

Copiar el contenido de cada archivo desde la documentación:
- `core/settings.py`
- `core/urls.py`
- `core/supabase.py`
- `core/wsgi.py`
- `core/asgi.py`
- `manage.py`
- Archivos de cada app (models.py, views.py, urls.py, etc.)

#### 6. Configuración Inicial de Django

```bash
# Crear migraciones iniciales
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Recopilar archivos estáticos
python manage.py collectstatic --noinput
```

### Configuración de Supabase

#### 1. Crear Proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Anotar URL del proyecto y claves API

#### 2. Crear Tablas Necesarias

```sql
-- Tabla de productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    precio DECIMAL(10,2),
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de transacciones
CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    monto DECIMAL(10,2),
    timestamp TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(50) DEFAULT 'pendiente'
);

-- Insertar datos de prueba
INSERT INTO productos (nombre, precio, descripcion) VALUES
('Producto 1', 100.00, 'Descripción del producto 1'),
('Producto 2', 250.50, 'Descripción del producto 2'),
('Producto 3', 75.25, 'Descripción del producto 3');
```

### Pruebas de Validación Post-Instalación

#### 1. Verificar Servidor de Desarrollo

```bash
# Iniciar servidor
python manage.py runserver

# Verificar en navegador:
# http://127.0.0.1:8000/admin/ (panel admin)
```

#### 2. Probar Endpoints de API

```bash
# Probar catálogo de productos
curl http://127.0.0.1:8000/productos/

# Probar detección de fraude
curl -X POST http://127.0.0.1:8000/fraude/detectar/ \
  -H "Content-Type: application/json" \
  -d '{"transacciones": [{"id": 1, "monto": 1500, "user_id": 1}]}'

# Probar limpieza de datos
curl -X POST http://127.0.0.1:8000/datos/limpiar/

# Probar simulación de pago
curl -X POST http://127.0.0.1:8000/pago/ \
  -H "Content-Type: application/json" \
  -d '{"carrito": [{"id": 1, "cantidad": 2}], "monto": 200.00}'
```

#### 3. Probar Login Facial

```bash
# Probar con imagen (requiere archivo de imagen)
curl -X POST http://127.0.0.1:8000/login-facial/login/ \
  -F "imagen=@ruta/a/tu/imagen.jpg"
```

---

## Documentación de Referencia

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Django REST    │    │   Supabase      │
│   (Cliente)     │◄──►│   Framework      │◄──►│   PostgreSQL    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Aplicaciones   │
                       │                  │
                       │ ┌──────────────┐ │
                       │ │   Fraude     │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │ Login Facial │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │   Productos  │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │    Pagos     │ │
                       │ └──────────────┘ │
                       │ ┌──────────────┐ │
                       │ │    Datos     │ │
                       │ └──────────────┘ │
                       └──────────────────┘
```

### Flujo de Trabajo Principal

#### 1. Flujo de Detección de Fraude
```
Transacción → Análisis de Monto → Análisis Temporal → Resultado
     │              │                    │              │
     │              ▼                    ▼              ▼
     │        ¿Monto > 1000?      ¿3+ tx en 5min?   Sospechosa/Normal
     │              │                    │
     └──────────────┴────────────────────┘
```

#### 2. Flujo de Login Facial
```
Imagen → Conversión → Detección → Validación → Resultado
  │         │           │           │           │
  ▼         ▼           ▼           ▼           ▼
Upload   PIL→NumPy   OpenCV     ¿Rostros>0?  Auth/Reject
```

#### 3. Flujo de Productos
```
Request → Supabase → Procesamiento → Response
   │         │            │            │
   ▼         ▼            ▼            ▼
GET /    Query tabla   Format JSON   Lista productos
```

### Convenciones de Código

#### Estructura de Views
```python
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

class MiView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request: Request) -> Response:
        try:
            # Lógica aquí
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

#### Estructura de URLs
```python
from django.urls import path
from .views import MiView

urlpatterns = [
    path("endpoint/", MiView.as_view(), name="mi_endpoint"),
]
```

#### Manejo de Supabase
```python
from core.supabase import get_supabase_client

# Para operaciones de lectura
client = get_supabase_client(service=False)

# Para operaciones de escritura/admin
client = get_supabase_client(service=True)
```

### Configuraciones Recomendadas

#### Producción
```python
# settings.py para producción
DEBUG = False
ALLOWED_HOSTS = ['tu-dominio.com', 'www.tu-dominio.com']

# Usar variables de entorno para secretos
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# Configurar HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

#### Desarrollo
```python
# settings.py para desarrollo
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# Base de datos SQLite para desarrollo rápido
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

---

## Solución de Problemas Comunes

### Error: "No module named 'cv2'"
**Problema**: OpenCV no instalado correctamente
**Solución**:
```bash
pip uninstall opencv-python
pip install opencv-python-headless  # Para servidores sin GUI
# o
pip install opencv-python  # Para desarrollo local
```

### Error: "Supabase connection failed"
**Problema**: Variables de entorno incorrectas
**Solución**:
1. Verificar archivo `.env` existe
2. Comprobar variables en Supabase dashboard
3. Verificar formato de URL: `https://xxx.supabase.co`

### Error: "psycopg2 installation failed"
**Problema**: Dependencias de PostgreSQL faltantes
**Solución**:
```bash
# Windows
pip install psycopg2-binary

# Linux/Mac
sudo apt-get install libpq-dev  # Ubuntu/Debian
brew install postgresql  # macOS
pip install psycopg2-binary
```

### Error: "CSRF token missing"
**Problema**: Protección CSRF en APIs
**Solución**:
```python
# En views.py, usar decorador
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class MiAPIView(APIView):
    # ...
```

### Error: "Table 'productos' doesn't exist"
**Problema**: Tablas no creadas en Supabase
**Solución**:
1. Ir al SQL Editor en Supabase
2. Ejecutar scripts de creación de tablas
3. Verificar permisos de las tablas

### Rendimiento Lento
**Problema**: Consultas no optimizadas
**Solución**:
```python
# Limitar resultados
res = client.table("productos").select("*").limit(100).execute()

# Usar índices en Supabase
# CREATE INDEX idx_productos_nombre ON productos(nombre);
```

### Error de Memoria con OpenCV
**Problema**: Imágenes muy grandes
**Solución**:
```python
# Redimensionar imagen antes de procesar
from PIL import Image

def resize_image(image_file, max_size=(800, 600)):
    img = Image.open(image_file)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    return img
```

---

## Notas Adicionales

### Seguridad
- **Nunca** commitear archivos `.env` al repositorio
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en backend
- Implementar rate limiting para APIs públicas
- Validar todas las entradas de usuario

### Escalabilidad
- Considerar usar Redis para caché
- Implementar paginación en listados grandes
- Usar Celery para tareas asíncronas pesadas
- Monitorear uso de Supabase para evitar límites

### Mantenimiento
- Actualizar dependencias regularmente
- Monitorear logs de errores
- Hacer backups regulares de Supabase
- Documentar cambios en la API

---

**Fecha de creación**: $(date)
**Versión del proyecto**: 1.0.0
**Autor**: Equipo de desarrollo BCRP