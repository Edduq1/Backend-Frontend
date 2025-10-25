import logging
import base64
import json
import uuid
from typing import Optional, Dict, Any

# Imports de Django REST Framework y JWT
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

# Imports locales
from .models import Usuario
from BD.operaciones import SupabaseOperations
from django.utils import timezone

# Imports para la lógica facial
try:
    import numpy as np
    import cv2
except ImportError:
    np = None
    cv2 = None
try:
    import face_recognition
except ImportError:
    face_recognition = None

log = logging.getLogger('facial')

def _compute_embedding_from_b64(b64_str) -> Optional['np.ndarray']:
    log = logging.getLogger('facial')
    if not b64_str:
        log.debug('compute_embedding: b64_str vacío')
        return None
    if np is None:
        log.debug('compute_embedding: numpy no disponible')
        return None
    try:
        header, encoded = b64_str.split(',') if ',' in b64_str else ('', b64_str)
        img_bytes = base64.b64decode(encoded)
        image = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(image, cv2.IMREAD_COLOR)
        if frame is None:
            log.debug('compute_embedding: cv2.imdecode devolvió None')
            return None
        if face_recognition is not None:
            rgb = frame[:, :, ::-1]
            boxes = face_recognition.face_locations(rgb, model='hog')
            log.debug(f'compute_embedding: boxes={len(boxes)}')
            if not boxes:
                return None
            encs = face_recognition.face_encodings(rgb, boxes)
            log.debug(f'compute_embedding: encs={len(encs)}')
            if not encs:
                return None
            return np.array(encs[0], dtype=np.float32)
        else:
            # Fallback: usar promedio de píxeles de la región central como "huella" rudimentaria
            h, w = frame.shape[:2]
            cx, cy = w // 2, h // 2
            crop = frame[max(cy-100,0):cy+100, max(cx-100,0):cx+100]
            if crop.size == 0:
                log.debug('compute_embedding: crop vacío en fallback')
                return None
            emb = cv2.resize(crop, (16, 16)).astype('float32').reshape(-1)
            emb = emb / (np.linalg.norm(emb) + 1e-6)
            return emb
    except Exception as e:
        logging.getLogger('facial').exception(f'compute_embedding: excepción {e}')
        return None


def _compare_embeddings(stored_bytes: bytes, live_emb) -> bool:
    if stored_bytes is None or live_emb is None or np is None:
        return False
    try:
        stored = np.frombuffer(stored_bytes, dtype=np.float32)
        if face_recognition is not None and stored.shape[0] in (128, 129):
            # distancia euclidiana típica < 0.6
            dist = np.linalg.norm(stored[:128] - live_emb[:128])
            return dist < 0.6
        else:
            # coseno para el fallback
            num = float(np.dot(stored, live_emb))
            den = (np.linalg.norm(stored) * np.linalg.norm(live_emb) + 1e-6)
            sim = num / den
            return sim > 0.9
    except Exception:
        return False


def _compare_to_collection(user: Usuario, live_emb) -> bool:
    """Compara el embedding vivo contra la colección de embeddings del usuario.
    Mantiene la lógica: si no hay colección, usa el método de compatibilidad _compare_embeddings.
    Usa umbral estricto base 0.45 con leve adaptación hasta 0.55 por intentos fallidos.
    """
    try:
        if live_emb is None:
            return False
        if np is None:
            # Sin numpy no podemos comparar colecciones; usar compatibilidad
            return _compare_embeddings(user.facial_data, live_emb)
        # Si no hay colección, caer al camino de compatibilidad
        if not user.facial_embeddings:
            return _compare_embeddings(user.facial_data, live_emb)

        base_thr = 0.45
        thr = min(base_thr + (user.failed_attempts or 0) * 0.03, 0.55)

        live = np.array(live_emb, dtype=np.float32)
        for emb_list in user.facial_embeddings:
            stored = np.array(emb_list, dtype=np.float32)
            # Euclidiana en primeras 128 dims (face_recognition)
            dist = float(np.linalg.norm(stored[:128] - live[:128]))
            if dist < thr:
                return True
        return False
    except Exception:
        return False


def _validate_position_collection(user: Usuario, live_pos) -> bool:
    """Valida la posición contra alguna de las posiciones registradas en el usuario.
    Si no hay colección, usa la posición de compatibilidad existente.
    Tolerancias estrictas y ligera adaptación por intentos fallidos.
    """
    try:
        if not live_pos:
            return False
        positions = user.positions or ([] if user.position_data is None else [user.position_data])
        if not positions:
            return False

        # Tolerancias base
        attempts = user.failed_attempts or 0
        tol_xy = max(0.05, 0.10 - attempts * 0.01)      # 0.10 -> 0.05
        tol_scale = max(0.08, 0.15 - attempts * 0.01)   # 0.15 -> 0.08

        for p in positions:
            # Formato {x,y,scale}
            if all(k in p for k in ('x', 'y', 'scale')) and all(k in live_pos for k in ('x', 'y', 'scale')):
                if (
                    abs(p['x'] - live_pos['x']) <= tol_xy and
                    abs(p['y'] - live_pos['y']) <= tol_xy and
                    abs(p['scale'] - live_pos['scale']) <= tol_scale
                ):
                    return True
            # Formato angular {roll,pitch,yaw,dist}
            if all(k in p for k in ('roll', 'pitch', 'yaw', 'dist')) and all(k in live_pos for k in ('roll', 'pitch', 'yaw', 'dist')):
                tol_ang = max(8, 15 - attempts * 1)
                tol_dist = max(0.12, 0.22 - attempts * 0.02)
                if (
                    abs(p['roll'] - live_pos['roll']) <= tol_ang and
                    abs(p['pitch'] - live_pos['pitch']) <= tol_ang and
                    abs(p['yaw'] - live_pos['yaw']) <= tol_ang and
                    abs(p['dist'] - live_pos['dist']) <= tol_dist
                ):
                    return True
        return False
    except Exception:
        return False

def _validate_position(stored_pos, live_pos) -> bool:
    try:
        # posición esperada: dict con {x,y,scale} o {roll,pitch,yaw,dist}
        keys = ('x', 'y', 'scale')
        if all(k in stored_pos for k in keys) and all(k in live_pos for k in keys):
            tol_xy = 0.12
            tol_scale = 0.20
            ok = (
                abs(stored_pos['x'] - live_pos['x']) <= tol_xy and
                abs(stored_pos['y'] - live_pos['y']) <= tol_xy and
                abs(stored_pos['scale'] - live_pos['scale']) <= tol_scale
            )
            return ok
        angles = ('roll', 'pitch', 'yaw', 'dist')
        if all(k in stored_pos for k in angles) and all(k in live_pos for k in angles):
            tol_ang = 15  # grados
            tol_dist = 0.25
            return (
                abs(stored_pos['roll'] - live_pos['roll']) <= tol_ang and
                abs(stored_pos['pitch'] - live_pos['pitch']) <= tol_ang and
                abs(stored_pos['yaw'] - live_pos['yaw']) <= tol_ang and
                abs(stored_pos['dist'] - live_pos['dist']) <= tol_dist
            )
        return False
    except Exception:
        return False

# --- VISTAS DE API ADAPTADAS ---

class MultiStageLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        # Instancia del conector Supabase DENTRO de la vista
        db = SupabaseOperations(admin=True) 

        # --- Etapa 1: Username (DNI o Email) ---
        if 'username' in data and 'password' in data: # Ignoramos password
            username = data['username']

            # --- Usa SupabaseOperations ---
            user_data = None
            filters_dni = {'dni': username}
            resp_dni = db.select_with_filter(table='REGISTRO_USUARIOS', filters=filters_dni)
            if resp_dni.get('success') and resp_dni.get('data'):
                user_data = resp_dni['data'][0]
            else:
                filters_email = {'email': username}
                resp_email = db.select_with_filter(table='REGISTRO_USUARIOS', filters=filters_email)
                if resp_email.get('success') and resp_email.get('data'):
                    user_data = resp_email['data'][0]
            # --- Fin Uso SupabaseOperations ---

            if user_data and user_data.get('estado') == 'Activo':
                request.session['login_user_id'] = user_data['id'] # ID de Supabase
                return Response({"status": "pending_facial_recognition"})

            return Response({"error": "Credenciales inválidas o usuario inactivo"}, status=400)

        # --- Etapa 2: Reconocimiento Facial ---
        elif 'facialToken' in data:
            user_id = request.session.get('login_user_id')
            if not user_id: return Response({"error": "Flujo de login inválido"}, status=400)

            # --- Usa SupabaseOperations ---
            resp = db.select_with_filter(table='REGISTRO_USUARIOS', filters={'id': user_id})
            if not resp.get('success') or not resp.get('data'):
                return Response({"error": "Usuario no encontrado"}, status=404)
            user_data = resp['data'][0]
            # --- Fin Uso SupabaseOperations ---

            # Objeto temporal para lógica pura
            temp_user_obj = Usuario(**user_data) 

            live_emb = _compute_embedding_from_b64(data['facialToken']) # Tu lógica pura
            if live_emb is None: return Response({"error": "Rostro no detectado"}, status=401)

            match = _compare_to_collection(temp_user_obj, live_emb) # Tu lógica pura
            position_ok = _validate_position_collection(temp_user_obj, data.get('position_data', {})) # Tu lógica pura

            if match and position_ok:
                # --- Usa SupabaseOperations ---
                db.update_record(table='REGISTRO_USUARIOS', record_id=user_id, data={'failed_attempts': 0})
                # --- Fin Uso SupabaseOperations ---
                return Response({"status": "pending_dni_code"})

            new_attempts = min(user_data.get('failed_attempts', 0) + 1, 5)
            # --- Usa SupabaseOperations ---
            db.update_record(table='REGISTRO_USUARIOS', record_id=user_id, data={'failed_attempts': new_attempts})
            # --- Fin Uso SupabaseOperations ---
            return Response({"error": "Reconocimiento facial fallido"}, status=401)

        # --- Etapa 3 y 4: DNI y Código Manual ---
        elif 'dni' in data and 'code' in data:
            user_id = request.session.get('login_user_id')
            if not user_id: return Response({"error": "Flujo de login inválido"}, status=400)

            # --- Usa SupabaseOperations ---
            resp = db.select_with_filter(table='REGISTRO_USUARIOS', filters={'id': user_id})
            if not resp.get('success') or not resp.get('data'):
                return Response({"error": "Usuario no encontrado"}, status=404)
            user_data = resp['data'][0]
            # --- Fin Uso SupabaseOperations ---

            dni_valido = (user_data.get('dni') == data['dni'])
            codigo_valido = (data['code'] == "CODIGO_SECRETO") # <-- Lógica real por definir

            if dni_valido and codigo_valido:
                request.session.flush()
                user_obj_for_token = Usuario(id=user_data['id'], dni=user_data['dni'], email=user_data.get('email'))
                refresh = RefreshToken.for_user(user_obj_for_token)

                return Response({
                    'token': str(refresh.access_token),
                    'user': { # Datos de Supabase
                        'id': user_data['id'],
                        'nombre': f"{user_data.get('nombres')} {user_data.get('apellidos')}",
                        'rol': user_data.get('rol')
                    }
                })

            return Response({"error": "DNI o código manual inválido"}, status=401)

        return Response({"error": "Payload de login incorrecto"}, status=400)

class UserDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user.id # ID del token JWT
        db = SupabaseOperations(admin=True)

        # --- Usa SupabaseOperations ---
        resp = db.select_with_filter(table='REGISTRO_USUARIOS', filters={'id': user_id})
        if not resp.get('success') or not resp.get('data'):
            return Response({"error": "Usuario no encontrado"}, status=404)
        user_data = resp['data'][0]
        # --- Fin Uso SupabaseOperations ---

        return Response({ # Datos de Supabase
            'id': user_data['id'],
            'nombre': f"{user_data.get('nombres')} {user_data.get('apellidos')}",
            'rol': user_data.get('rol')
        })

# --- Vistas de Registro (Adaptadas para Supabase) ---
class UserRegistrationView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request, *args, **kwargs):
        data = request.data
        db = SupabaseOperations(admin=True)
        # ... (Validación de datos como antes) ...
        required_fields = ['dni', 'nombres', 'apellidos', 'email', 'rol']
        if not all(field in data for field in required_fields):
            return Response({"error": "Faltan campos requeridos"}, status=400)

        new_user_id = f'u-{uuid.uuid4().hex[:6]}'
        user_to_insert = { # Mapeo a tabla REGISTRO_USUARIOS
            'id': new_user_id,
            'dni': data['dni'],
            'nombres': data['nombres'],
            'apellidos': data['apellidos'],
            'email': data['email'],
            'rol': data['rol'],
            'estado': 'Activo',
            'face_registered': False,
            # Campos faciales iniciales vacíos
            'facial_embeddings': [], 
            'positions': [],
            'failed_attempts': 0
        }

        try:
            # --- Usa SupabaseOperations ---
            result = db.insert_record(table='REGISTRO_USUARIOS', data=user_to_insert)
            # --- Fin Uso SupabaseOperations ---
            if result.get('success'):
                return Response({"message": "Usuario registrado", "user_id": new_user_id}, status=201)
            else:
                return Response({"error": result.get('error', 'Error al registrar')}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class FacialRegistrationView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request, user_id, *args, **kwargs):
        db = SupabaseOperations(admin=True)
        # ... (Validación de datos y permisos como antes) ...
        if request.user.id != user_id:
            return Response({"error": "No autorizado"}, status=403)

        embeddings_data = request.data.get('embeddings')
        positions_data = request.data.get('positions')
        if not embeddings_data or not positions_data:
            return Response({"error": "Faltan datos faciales"}, status=400)

        data_to_update = { # Mapeo a tabla REGISTRO_USUARIOS
            'facial_embeddings': embeddings_data,
            'positions': positions_data,
            'face_registered': True 
        }

        try:
            # --- Usa SupabaseOperations ---
            result = db.update_record(table='REGISTRO_USUARIOS', record_id=user_id, data=data_to_update)
            # --- Fin Uso SupabaseOperations ---
            if result.get('success'):
                return Response({"message": "Registro facial completado"}, status=200)
            else:
                return Response({"error": result.get('error', 'Error al guardar datos')}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=400)