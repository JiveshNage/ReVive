import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import DEFAULT_DB_PATH, settings

logger = logging.getLogger("revive.database")


class Base(DeclarativeBase):
    pass


def get_normalized_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url and "+asyncpg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def create_resilient_engine():
    normalized_db_url = get_normalized_database_url(settings.database_url)
    connect_args = {"check_same_thread": False} if normalized_db_url.startswith("sqlite") else {}
    eng = create_engine(normalized_db_url, pool_pre_ping=True, connect_args=connect_args)
    if not normalized_db_url.startswith("sqlite"):
        try:
            with eng.connect():
                pass
        except OperationalError as exc:
            logger.warning(
                "Primary database connection failed. Falling back gracefully to SQLite: %s",
                exc,
            )
            sqlite_url = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
            eng = create_engine(sqlite_url, pool_pre_ping=True, connect_args={"check_same_thread": False})
    return eng


engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_db_initialized() -> None:
    Base.metadata.create_all(bind=engine)
    if "sqlite" in str(engine.url):
        with engine.connect() as conn:
            try:
                res = conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
                existing_cols = {row[1] for row in res}
                cols_to_add = [
                    ("location", "VARCHAR(120) DEFAULT 'Bhopal, MP'"),
                    ("email", "VARCHAR(120)"),
                    ("company_name", "VARCHAR(150)"),
                    ("license_no", "VARCHAR(80)"),
                    ("service_area", "VARCHAR(150)"),
                    ("custom_user_id", "VARCHAR(50)"),
                    ("hashed_password", "VARCHAR(255)"),
                    ("verification_status", "VARCHAR(40) DEFAULT 'NOT_SUBMITTED'"),
                ]
                for col_name, col_type in cols_to_add:
                    if col_name not in existing_cols:
                        conn.exec_driver_sql(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                conn.commit()
            except Exception:
                pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Ensure tables and migrations are initialized on module load
ensure_db_initialized()

