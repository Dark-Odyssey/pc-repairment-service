from secrets import token_hex
from time import time
from schemas import Tokens
from database.models import UserORM
import jwt
from core.config import settings


class JWTHandler:
    __private_key = settings.PRIVATE_KEY
    __public_key = settings.PUBLIC_KEY
    __algorithm = settings.ALGORITHM


    @classmethod
    def make_jwt(
        cls,
        payload: dict,
        lifetime: int
    ) -> str:
        now = int(time())
        updated_payload = payload.copy()

        payload_update = {
            "iat": now,
            "exp": now + lifetime
        }
        updated_payload.update(payload_update)

        token = jwt.encode(
            payload=updated_payload,
            key=cls.__private_key,
            algorithm=cls.__algorithm,
        )
        return token


    @classmethod
    def decode_jwt(
        cls,
        token: str
    ) -> dict | None:
        try:
            payload = jwt.decode(
                token,
                key=cls.__public_key,
                algorithms=[cls.__algorithm]
            )
            return payload
        except Exception:
            return None


    @staticmethod
    async def generate_tokens(user_db: UserORM) -> Tokens:
        csrf_token = token_hex(16)

        access_payload = {
            "sub": str(user_db.id),
            "role": str(user_db.role),
            "token_type": "access",
        }
        refresh_payload = {
            "sub": str(user_db.id),
            "role": str(user_db.role),
            "token_type": "refresh",
            "csrf": csrf_token
        }

        tokens = Tokens(
            access_token=JWTHandler.make_jwt(payload=access_payload, lifetime=settings.ACCESS_TOKEN_LIFE),
            refresh_token=JWTHandler.make_jwt(payload=refresh_payload, lifetime=settings.REFRESH_TOKEN_LIFE),
            csrf_token=csrf_token
        )
        return tokens

