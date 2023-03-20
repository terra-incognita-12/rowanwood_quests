import hashlib
from random import randbytes

class PasswordToken:
	@staticmethod
	def get_password_token():
		token = randbytes(10)
		hashed_token = hashlib.sha256()
		hashed_token.update(token)
		return hashed_token.hexdigest()
