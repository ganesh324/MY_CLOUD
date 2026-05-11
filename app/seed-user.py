from backend.database import SessionLocal, engine
from backend import models, auth

# 1. CREATE THE TABLES (This is the missing step!)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Now it can search because the table actually exists
existing_user = db.query(models.User).filter(models.User.username == "ganesh").first()

if not existing_user:
    hashed_pwd = auth.get_password_hash("your_secure_password") 
    admin_user = models.User(
        username="ganesh",
        full_name="Ganesh Eeti",
        hashed_password=hashed_pwd,
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    print("✅ Admin user 'ganesh' created successfully!")
else:
    print("ℹ️ User 'ganesh' already exists.")

db.close()