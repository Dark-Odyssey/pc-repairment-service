from time import time
from jwt.exceptions import ExpiredSignatureError
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
