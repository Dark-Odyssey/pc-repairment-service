from core.config import settings
from fastapi import HTTPException
from database.models import UserORM
from aiosmtplib import send
from email.message import EmailMessage


class EmailHandler: 
    __sender_email = settings.EMAIL
    __sender_password = settings.EMAIL_KEY
    async def send_token_link(self, user_db: UserORM, token: str) -> None:
        email = EmailMessage()
        email["Subject"] = "Password reset"
        email["From"] = self.__sender_email
        email["To"] = user_db.email
        email.set_content(f"Your account recovery linkn\n\nhttp://127.0.0.1:8000/auth/new-password?token={token}")
        try:
            await send(
                email,
                recipients=user_db.email,
                sender=self.__sender_email,
                hostname="smtp.gmail.com",
                port=587,
                username=self.__sender_email,
                password=self.__sender_password,
                start_tls=True
            )
        except Exception:
            raise HTTPException(status_code=500, detail="Cant send code on youir email!")