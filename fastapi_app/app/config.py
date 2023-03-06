from decouple import config

class Settings:
	DEV=config('DEV', cast=bool)

	SITE_ADDRESS=config('SITE_ADDRESS')
	CLIENT_PORT=config('CLIENT_PORT')
	BACKEND_PORT=config('BACKEND_PORT')

	POSTGRES_NAME=config('POSTGRES_DB')
	POSTGRES_USER=config('POSTGRES_USER')
	POSTGRES_PASS=config('POSTGRES_PASSWORD')
	POSTGRES_HOST=config('POSTGRES_HOST')
	POSTGRES_PORT=config('POSTGRES_PORT')
	
	JWT_ALGORITHM=config('JWT_ALGORITHM')
	ACCESS_TOKEN_EXPIRES=config('ACCESS_TOKEN_EXPIRES')
	REFRESH_TOKEN_EXPIRES=config('REFRESH_TOKEN_EXPIRES')	
	JWT_PRIVATE_KEY=config('JWT_PRIVATE_KEY')
	JWT_PUBLIC_KEY=config('JWT_PUBLIC_KEY')

	EMAIL_HOST=config('EMAIL_HOST')
	EMAIL_PORT=config('EMAIL_PORT')
	EMAIL_USER=config('EMAIL_USER')
	EMAIL_PASS=config('EMAIL_PASS')
	EMAIL_FROM=config('EMAIL_FROM')
	EMAIL_STARTTLS=config('EMAIL_STARTTLS', cast=bool)
	EMAIL_SSL_TLS=config('EMAIL_SSL_TLS', cast=bool)
	EMAIL_USE_CREDENTIALS=config('EMAIL_USE_CREDENTIALS', cast=bool)
	EMAIL_VALIDATE_CERTS=config('EMAIL_VALIDATE_CERTS', cast=bool)
	EMAIL_TOKEN_EXPIRES_SECONDS=config('EMAIL_TOKEN_EXPIRES_SECONDS')

	S3_HOST_NAME=config('S3_HOST_NAME')
	S3_BUCKET_NAME=config('S3_BUCKET_NAME')
	S3_ACCESS_KEY=config('S3_ACCESS_KEY')
	S3_SECRET_KEY=config('S3_SECRET_KEY')
	S3_REGION=config('S3_REGION')

	if DEV:
		S3_FULL_URL=f'{SITE_ADDRESS}:4566/{S3_BUCKET_NAME}/'
	else:
		S3_FULL_URL=S3_HOST_NAME
	
settings = Settings()