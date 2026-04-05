import bcrypt



class Crypt:
    @staticmethod
    async def hash_password(
        plain_password: str
    ) -> str:
        password_bytes = plain_password.encode()
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password=password_bytes, salt=salt)
        return password_hash.decode("utf-8")
    
    @staticmethod
    async def check_password(
        plain_password: str,
        hashed_password: str
    ) -> bool:
        plain_password_bytes = plain_password.encode()
        hashed_password_bytes = hashed_password.encode()
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)