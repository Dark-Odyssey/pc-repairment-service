from core.config import settings
from fastapi import HTTPException
from database.models import UserORM
from aiosmtplib import send
from .html import reset_password_html, send_repair_order_creds_html
from email.message import EmailMessage




class EmailHandler: 
    __sender_email = settings.EMAIL
    __sender_password = settings.EMAIL_KEY
    async def send_token_link(self, user_db: UserORM, token: str) -> None:
        link = f"http://localhost:5500/nowe-haslo?token={token}"
        email = EmailMessage()
        email["Subject"] = "Password reset"
        email["From"] = self.__sender_email
        email["To"] = user_db.email
        email.set_content(f"Link for setting new password\n\n{link}")
        email.add_alternative(reset_password_html(link=link), subtype="html")
        await self.__send_email(email=email, to_email=user_db.email)


    async def send_new_status(self) -> None:
        pass


    async def send_repair_order_creds(self, user_db: UserORM, order_number: str, access_code: str):
        email = EmailMessage()
        email["Subject"] = "New order credentials"
        email["From"] = self.__sender_email
        email["To"] = user_db.email
        email.set_content(f"Data for your order\n\nOrder number: {order_number}\n\nAccess code: {access_code}")
        email.add_alternative(send_repair_order_creds_html(order_number=order_number, access_code=access_code), subtype="html")
        await self.__send_email(email=email, to_email=user_db.email)


    async def __send_email(self, email: EmailMessage, to_email: str):
        try:
            await send(
                email,
                recipients=to_email,
                sender=self.__sender_email,
                hostname="smtp.gmail.com",
                port=587,
                username=self.__sender_email,
                password=self.__sender_password,
                start_tls=True
            )
        except Exception:
            raise HTTPException(status_code=500, detail="Cant send code on your email!")