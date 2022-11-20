from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
from pydantic import EmailStr, BaseModel
from jinja2 import Environment, select_autoescape, FileSystemLoader

from ..config import settings
from ..models import User

env = Environment(
	loader=FileSystemLoader('send_email/'),
	autoescape=select_autoescape(['html', 'xml'])
)

class EmailScheme(BaseModel):
	email: List[EmailStr]

class Email:
	def __init__(self, user: User, url: str, email: List[EmailStr]):
		self.username = user.username
		self.sender = 'Admin <admin@rowanwood.com>'
		self.email = email
		self.url = url
		pass

	async def send_mail(self, subject, template):
		conf = ConnectionConfig(
			MAIL_USERNAME=settings.EMAIL_USER,
            MAIL_PASSWORD=settings.EMAIL_PASS,
            MAIL_FROM=settings.EMAIL_FROM,
            MAIL_PORT=settings.EMAIL_PORT,
            MAIL_SERVER=settings.EMAIL_HOST,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
		)
		template = env.get_template(f'{template}.html')

		html = template.render(
			url=self.url,
			username=self.username,
			subject=subject
		)

		message = MessageSchema(
			subject=subject,
			recipients=self.email,
            body=html,
            subtype="html"
		)
		
		fm = FastMail(conf)
		await fm.send_message(message)

	async def send_verification_email_link(self):
		await self.send_mail('Your verification code (Valid for 10 min)', 'verify_email_template')

	async def send_verification_change_password_link(self):
		await self.send_mail('Your verification code (Valid for 10 min)', 'verify_change_password_template')
