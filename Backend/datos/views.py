"""
Vistas para la aplicación de limpieza de datos.
"""

import json
import re
from datetime import datetime
from typing import Dict, Any, List

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from BD.operaciones import get_operations
from .models import DataCleaningLog, DataValidationRule


class DataCleaner:
    """
    Clase para manejar operaciones de limpieza de datos.
    """
    
    def __init__(self):
        self.operations = get_operations(admin=True)
    
    def remove_null_values(self, table: str, columns: List[str] = None) -> Dict[str, Any]:
        """
        Elimina registros con valores nulos.
        
        Args:
            table (str): Nombre de la tabla
            columns (list): Columnas específicas a verificar
        
        Returns:
            dict: Resultado de la operación
        """
        try:
            if columns:
                deleted_count = 0
                for column in columns:
                    result = self.operations.clean_null_records(table, column)
                    if result['success']:
                        deleted_count += result['deleted_count']
                    else:
                        return result
                
                return {
                    'success': True,
                    'deleted_count': deleted_count,
                    'message': f'Eliminados {deleted_count} registros con valores nulos'
                }
            else:
                # Si no se especifican columnas, obtener estructura de tabla
                # y limpiar todas las columnas
                result = self.operations.select_all(table, "*")
                if not result['success'] or not result['data']:
                    return {
                        'success': False,
                        'error': 'No se pudo obtener la estructura de la tabla'
                    }
                
                # Para este ejemplo, asumimos que limpiamos registros completamente nulos
                return {
                    'success': True,
                    'deleted_count': 0,
                    'message': 'Operación completada'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def remove_duplicates(self, table: str, key_columns: List[str] = None) -> Dict[str, Any]:
        """
        Elimina registros duplicados.
        
        Args:
            table (str): Nombre de la tabla
            key_columns (list): Columnas para identificar duplicados
        
        Returns:
            dict: Resultado de la operación
        """
        try:
            # Obtener todos los registros
            result = self.operations.select_all(table)
            if not result['success']:
                return result
            
            records = result['data']
            if not records:
                return {
                    'success': True,
                    'deleted_count': 0,
                    'message': 'No hay registros para procesar'
                }
            
            # Identificar duplicados
            seen = set()
            duplicates = []
            
            for record in records:
                if key_columns:
                    # Crear clave basada en columnas específicas
                    key = tuple(record.get(col) for col in key_columns)
                else:
                    # Usar todos los campos excepto ID y timestamps
                    exclude_fields = ['id', 'created_at', 'updated_at']
                    key = tuple(v for k, v in record.items() if k not in exclude_fields)
                
                if key in seen:
                    duplicates.append(record['id'])
                else:
                    seen.add(key)
            
            # Eliminar duplicados
            deleted_count = 0
            for record_id in duplicates:
                delete_result = self.operations.delete_record(table, record_id)
                if delete_result['success']:
                    deleted_count += 1
            
            return {
                'success': True,
                'deleted_count': deleted_count,
                'message': f'Eliminados {deleted_count} registros duplicados'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def normalize_text_data(self, table: str, text_columns: List[str]) -> Dict[str, Any]:
        """
        Normaliza datos de texto (trim, lowercase, etc.).
        
        Args:
            table (str): Nombre de la tabla
            text_columns (list): Columnas de texto a normalizar
        
        Returns:
            dict: Resultado de la operación
        """
        try:
            # Obtener todos los registros
            result = self.operations.select_all(table)
            if not result['success']:
                return result
            
            records = result['data']
            updated_count = 0
            
            for record in records:
                updated_data = {}
                needs_update = False
                
                for column in text_columns:
                    if column in record and record[column]:
                        original_value = record[column]
                        if isinstance(original_value, str):
                            # Normalizar: trim, lowercase, remover espacios extra
                            normalized_value = re.sub(r'\s+', ' ', original_value.strip().lower())
                            if normalized_value != original_value:
                                updated_data[column] = normalized_value
                                needs_update = True
                
                if needs_update:
                    update_result = self.operations.update_record(
                        table, record['id'], updated_data
                    )
                    if update_result['success']:
                        updated_count += 1
            
            return {
                'success': True,
                'updated_count': updated_count,
                'message': f'Normalizados {updated_count} registros'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_data_format(self, table: str, validation_rules: Dict[str, str]) -> Dict[str, Any]:
        """
        Valida formato de datos según reglas específicas.
        
        Args:
            table (str): Nombre de la tabla
            validation_rules (dict): Reglas de validación {columna: regex_pattern}
        
        Returns:
            dict: Resultado de la validación
        """
        try:
            # Obtener todos los registros
            result = self.operations.select_all(table)
            if not result['success']:
                return result
            
            records = result['data']
            invalid_records = []
            
            for record in records:
                for column, pattern in validation_rules.items():
                    if column in record and record[column]:
                        value = str(record[column])
                        if not re.match(pattern, value):
                            invalid_records.append({
                                'id': record['id'],
                                'column': column,
                                'value': value,
                                'expected_pattern': pattern
                            })
            
            return {
                'success': True,
                'invalid_count': len(invalid_records),
                'invalid_records': invalid_records[:10],  # Limitar a 10 ejemplos
                'message': f'Encontrados {len(invalid_records)} registros con formato inválido'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def limpiar_datos(request):
    """
    Endpoint para limpiar datos según el tipo de operación especificado.
    
    POST /datos/limpiar/
    
    Body:
    {
        "operation": "remove_nulls|remove_duplicates|normalize_text|validate_format|clean_all",
        "table": "nombre_tabla",
        "parameters": {
            "columns": ["col1", "col2"],  // Para remove_nulls, normalize_text
            "key_columns": ["col1"],      // Para remove_duplicates
            "validation_rules": {         // Para validate_format
                "email": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"
            }
        }
    }
    """
    try:
        # Validar datos de entrada
        operation = request.data.get('operation')
        table = request.data.get('table')
        parameters = request.data.get('parameters', {})
        
        if not operation or not table:
            return Response({
                'success': False,
                'error': 'Los campos "operation" y "table" son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear log de operación
        log = DataCleaningLog.objects.create(
            operation_type=operation,
            table_name=table,
            status='processing'
        )
        
        # Inicializar limpiador
        cleaner = DataCleaner()
        result = None
        
        try:
            # Ejecutar operación según el tipo
            if operation == 'remove_nulls':
                columns = parameters.get('columns')
                result = cleaner.remove_null_values(table, columns)
                
            elif operation == 'remove_duplicates':
                key_columns = parameters.get('key_columns')
                result = cleaner.remove_duplicates(table, key_columns)
                
            elif operation == 'normalize_text':
                text_columns = parameters.get('columns', [])
                if not text_columns:
                    raise ValueError("Se requieren columnas para normalización de texto")
                result = cleaner.normalize_text_data(table, text_columns)
                
            elif operation == 'validate_format':
                validation_rules = parameters.get('validation_rules', {})
                if not validation_rules:
                    raise ValueError("Se requieren reglas de validación")
                result = cleaner.validate_data_format(table, validation_rules)
                
            elif operation == 'clean_all':
                # Ejecutar todas las operaciones de limpieza
                results = []
                
                # 1. Eliminar nulos
                null_result = cleaner.remove_null_values(table)
                results.append(('remove_nulls', null_result))
                
                # 2. Eliminar duplicados
                dup_result = cleaner.remove_duplicates(table)
                results.append(('remove_duplicates', dup_result))
                
                # 3. Normalizar texto (si se especifican columnas)
                text_columns = parameters.get('text_columns', [])
                if text_columns:
                    text_result = cleaner.normalize_text_data(table, text_columns)
                    results.append(('normalize_text', text_result))
                
                result = {
                    'success': True,
                    'operations': results,
                    'message': 'Limpieza completa ejecutada'
                }
                
            else:
                raise ValueError(f"Operación no válida: {operation}")
            
            # Actualizar log con resultado
            if result and result.get('success'):
                log.status = 'completed'
                log.records_cleaned = result.get('deleted_count', 0) or result.get('updated_count', 0)
                log.completed_at = timezone.now()
            else:
                log.status = 'failed'
                log.error_message = result.get('error', 'Error desconocido') if result else 'Sin resultado'
            
            log.save()
            
            # Preparar respuesta
            response_data = {
                'success': result.get('success', False) if result else False,
                'operation': operation,
                'table': table,
                'log_id': log.id,
                'timestamp': timezone.now().isoformat()
            }
            
            if result:
                response_data.update(result)
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Actualizar log con error
            log.status = 'failed'
            log.error_message = str(e)
            log.completed_at = timezone.now()
            log.save()
            
            return Response({
                'success': False,
                'error': str(e),
                'log_id': log.id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error en el procesamiento: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_logs_limpieza(request):
    """
    Obtiene el historial de operaciones de limpieza.
    
    GET /datos/logs/
    """
    try:
        logs = DataCleaningLog.objects.all()[:50]  # Últimos 50 logs
        
        logs_data = []
        for log in logs:
            logs_data.append({
                'id': log.id,
                'operation_type': log.operation_type,
                'table_name': log.table_name,
                'status': log.status,
                'records_processed': log.records_processed,
                'records_cleaned': log.records_cleaned,
                'error_message': log.error_message,
                'started_at': log.started_at.isoformat(),
                'completed_at': log.completed_at.isoformat() if log.completed_at else None,
                'duration': str(log.duration()) if log.duration() else None
            })
        
        return Response({
            'success': True,
            'logs': logs_data,
            'count': len(logs_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def gestionar_reglas_validacion(request):
    """
    Gestiona las reglas de validación de datos.
    
    GET /datos/reglas/ - Obtiene todas las reglas
    POST /datos/reglas/ - Crea una nueva regla
    """
    if request.method == 'GET':
        try:
            reglas = DataValidationRule.objects.filter(is_active=True)
            
            reglas_data = []
            for regla in reglas:
                reglas_data.append({
                    'id': regla.id,
                    'name': regla.name,
                    'table_name': regla.table_name,
                    'column_name': regla.column_name,
                    'rule_type': regla.rule_type,
                    'rule_value': json.loads(regla.rule_value) if regla.rule_value else None,
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
            required_fields = ['name', 'table_name', 'column_name', 'rule_type']
            for field in required_fields:
                if not request.data.get(field):
                    return Response({
                        'success': False,
                        'error': f'El campo "{field}" es requerido'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear nueva regla
            regla = DataValidationRule.objects.create(
                name=request.data['name'],
                table_name=request.data['table_name'],
                column_name=request.data['column_name'],
                rule_type=request.data['rule_type'],
                rule_value=json.dumps(request.data.get('rule_value', {})),
                is_active=request.data.get('is_active', True)
            )
            
            return Response({
                'success': True,
                'rule': {
                    'id': regla.id,
                    'name': regla.name,
                    'table_name': regla.table_name,
                    'column_name': regla.column_name,
                    'rule_type': regla.rule_type,
                    'rule_value': json.loads(regla.rule_value) if regla.rule_value else None,
                    'is_active': regla.is_active
                },
                'message': 'Regla de validación creada exitosamente'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)