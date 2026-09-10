
"""Create demo users so you can log in immediately.

Run from the backend/ folder (with your virtualenv active):

    python seed_demo_data.py

Creates, if they don't already exist:
  - admin@Nirikshan.test     / Admin@123   (role: admin)
  - inspector@Nirikshan.test / Inspect@123 (role: inspector)
"""
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app import models  # noqa: F401 - register model metadata
from app.models.user import User

DEMO_USERS = [
    {
        "email": "admin@Nirikshan.test",
        "password": "Admin@123",
        "full_name": "Demo Admin",
        "role": "admin",
        "department": "Head Office",
    },
    {
        "email": "inspector@Nirikshan.test",
        "password": "Inspect@123",
        "full_name": "Demo Inspector",
        "role": "inspector",
        "department": "Field Operations",
    },
]


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        created = []
        for u in DEMO_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                continue
            db.add(
                User(
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    department=u["department"],
                )
            )
            created.append(u["email"])
        db.commit()

        if created:
            print(f"Created demo users: {', '.join(created)}")
        else:
            print("Demo users already exist - nothing to do.")

        print("\nLogin credentials:")
        for u in DEMO_USERS:
            print(f"  {u['role']:>10}: {u['email']} / {u['password']}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
