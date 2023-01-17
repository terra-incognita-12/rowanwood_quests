import boto3
from botocore.exceptions import ClientError

from .config import settings

class S3:
	def __init__(self):
		self.s3 = boto3.client('s3')

	def add_new_photo(self, file, key):
		try:
			self.s3.upload_fileobj(file, settings.S3_BUCKET_NAME, key, ExtraArgs={"ACL": "public-read"})
		except ClientError as e:
			raise Exception(e)

	def delete_photo(self, key):
		try:
			self.s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
		except ClientError as e:
			raise Exception(e)

s3 = S3()


