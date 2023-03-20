import base64
import time

class EmailToken:
	@staticmethod
	def decode_token(token):
		# 0 - username, 1 - expiration time
		data = base64.urlsafe_b64decode(bytes.fromhex(token)).decode('utf-8').split('(^_^)')
		return (data[0], float(data[1]))

	@staticmethod
	def get_email_token(username, expiration):
		# Encode username and expiration time() in token with separator (^_^)
		return base64.urlsafe_b64encode(f"{username}(^_^){time.time() + int(expiration)}".encode('utf-8')).hex()

	@staticmethod
	def decode_change_email_token(token):
		# 0 - old_email, 1 - new_email, 2 - expiration time
		data = base64.urlsafe_b64decode(bytes.fromhex(token)).decode('utf-8').split('(^_^)')
		return (data[0], data[1], float(data[2]))

	@staticmethod
	def get_change_email_token(old_email, new_email, expiration):
		# Encode old email, new email and expiration time() in token with separator (^_^)
		return base64.urlsafe_b64encode(f"{old_email}(^_^){new_email}(^_^){time.time() + int(expiration)}".encode('utf-8')).hex()