"""
Utils para manejo de transacciones en FastAPI endpoints.
"""
from functools import wraps
from typing import Callable, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


def with_transaction(func: Callable) -> Callable:
    """
    Decorador para manejar transacciones automáticamente en endpoints FastAPI.
    
    Uso:
        @with_transaction
        def my_endpoint(db: Session = Depends(get_db)):
            # Tu lógica aquí
            pass
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Buscar la sesión de base de datos en los argumentos
        db = None
        for arg in args:
            if isinstance(arg, Session):
                db = arg
                break
        
        if not db:
            # Buscar en kwargs
            db = kwargs.get('db')
        
        if not db:
            raise HTTPException(
                status_code=500,
                detail="Database session not found in endpoint arguments"
            )
        
        try:
            # Ejecutar la función
            result = func(*args, **kwargs)
            
            # Hacer commit si no hubo excepción
            db.commit()
            
            return result
            
        except HTTPException:
            # No hacer rollback en HTTPException (ya fue manejada)
            raise
            
        except Exception as e:
            # Hacer rollback en cualquier otro error
            db.rollback()
            logger.error(f"Transaction failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Database transaction failed: {str(e)}"
            )
    
    return wrapper


def transactional(db: Session):
    """
    Context manager para transacciones manuales.
    
    Uso:
        with transactional(db) as tx:
            # Tu lógica aquí
            pass
    """
    class TransactionContext:
        def __enter__(self):
            return self
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            if exc_type is None:
                db.commit()
            else:
                db.rollback()
                logger.error(f"Transaction failed: {exc_val}", exc_info=True)
    
    return TransactionContext()


def safe_query(db: Session, query, error_msg: str = "Query failed"):
    """
    Ejecuta una consulta de forma segura con manejo de errores.
    
    Args:
        db: Sesión de base de datos
        query: Consulta SQLAlchemy a ejecutar
        error_msg: Mensaje de error personalizado
    
    Returns:
        Resultado de la consulta
    """
    try:
        return query.all()
    except Exception as e:
        logger.error(f"{error_msg}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"{error_msg}: {str(e)}"
        )


def safe_query_one(db: Session, query, error_msg: str = "Query failed"):
    """
    Ejecuta una consulta que espera un solo resultado.
    """
    try:
        return query.first()
    except Exception as e:
        logger.error(f"{error_msg}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"{error_msg}: {str(e)}"
        )


def safe_query_by_id(db: Session, model, id: int, error_msg: str = "Record not found"):
    """
    Obtiene un registro por ID de forma segura.
    """
    try:
        record = db.query(model).filter(model.id == id).first()
        if not record:
            raise HTTPException(status_code=404, detail=error_msg)
        return record
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"{error_msg}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"{error_msg}: {str(e)}"
        )
