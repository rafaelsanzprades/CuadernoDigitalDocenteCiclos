import os
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool, QueuePool
from sqlalchemy.orm import declarative_base, sessionmaker

# Use DATABASE_URL env var if set, fallback to local SQLite
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./cdd_pro.db")

# Some providers use "postgres://" prefix but SQLAlchemy requires "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False; PostgreSQL does not
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Configure connection pool
if DATABASE_URL.startswith("sqlite"):
    # SQLite: Use StaticPool for single-threaded access
    poolclass = StaticPool
    pool_args = {}
else:
    # PostgreSQL/Other: Use QueuePool with configurable size
    poolclass = QueuePool
    pool_args = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    }

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass,
    **pool_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
