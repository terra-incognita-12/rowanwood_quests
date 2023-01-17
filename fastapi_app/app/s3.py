import boto3

S3_BUCKET_NAME = 'rowan-wood-test-bucket'

s3 = boto3.resource("s3")

bucket = s3.Bucket(S3_BUCKET_NAME)



