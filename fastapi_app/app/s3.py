import boto3
from botocore.exceptions import ClientError

from .config import settings

class S3:
	def __init__(self):
		self.s3 = boto3.client('s3', aws_access_key_id=settings.S3_ACCESS_KEY, aws_secret_access_key=settings.S3_SECRET_KEY)

	def add_new_photo(self, file, key):
		try:
			self.s3.upload_fileobj(file, settings.S3_BUCKET_NAME, key)
		except ClientError as e:
			raise Exception(e)

	def delete_photo(self, key):
		try:
			self.s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
		except ClientError as e:
			raise Exception(e)

s3 = S3()