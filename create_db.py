from app import app, db, Admin
import os

def init_db():
    with app.app_context():
        # This will create tables in the database specified in DATABASE_URL
        print("Creating tables...")
        db.create_all()
        
        # Check if admin already exists
        if not Admin.query.filter_by(email="admin@example.com").first():
            print("Seeding admin user...")
            admin = Admin(email="admin@example.com", password="admin-password")
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: admin@example.com / admin-password")
        else:
            print("Admin user already exists.")

if __name__ == "__main__":
    init_db()
