"""Seed the first superadmin user into the database.

Usage:
    cd backend && python -m scripts.seed_admin admin@example.com mypassword

Requires CDD_SECRET_KEY to be set in the environment.
"""
import sys
import os

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import SessionLocal, engine, Base
from models import User
from auth.security import get_password_hash


def seed_admin(email: str, password: str) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User {email} already exists (id={existing.id})")
            return

        user = User(
            name=email.split("@")[0].capitalize(),
            surname="",
            email=email,
            password=get_password_hash(password),
            is_superadmin=True,
        )
        db.add(user)
        db.commit()
        print(f"Superadmin {email} created (id={user.id})")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python -m scripts.seed_admin <email> <password>")
        sys.exit(1)
    seed_admin(sys.argv[1], sys.argv[2])
