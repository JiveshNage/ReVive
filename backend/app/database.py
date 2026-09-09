from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_db_initialized() -> None:
    Base.metadata.create_all(bind=engine)
    if settings.database_url.startswith("sqlite"):
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

