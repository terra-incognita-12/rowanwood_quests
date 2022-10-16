from decouple import config

class Settings:
	POSTGRES_NAME=config('POSTGRES_NAME')
	POSTGRES_USER=config('POSTGRES_USER')
	POSTGRES_PASS=config('POSTGRES_PASS')
	POSTGRES_HOST=config('POSTGRES_HOST')
settings = Settings()