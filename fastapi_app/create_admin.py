from app.database import SessionLocal
from app.models import User

def create_admin():
	session = SessionLocal()
	try:
		admin = User(username='admin', email='admin@admin.com', password='$2a$12$Eym1OSEVLHFxu437sXyqBOhjtnRFX9GOA0rLL9/34n4WmLmsP1eAi', is_email_verified=True, role='admin')
		session.add(admin)
		session.commit()
		session.refresh(admin)
	except Exception as e:
		session.rollback()
		raise e
	finally:
		session.close()
	
if __name__ == "__main__":
	create_admin()