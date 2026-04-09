from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


HOME_PATH = Path(__file__).parent.parent.parent



class Settings(BaseSettings):
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int

    PATH_PRIV_KEY: Path = HOME_PATH / "certs" / "private_key.pem"
    PATH_PUB_KEY: Path = HOME_PATH / "certs" / "public_key.pem"
    ALGORITHM: str
    ACCESS_TOKEN_LIFE: int
    REFRESH_TOKEN_LIFE: int


    CSRF_COOKIE_NAME: str = "x_csrf_token"
    CSRF_HEADER_NAME: str = "X_CSRF_TOKEN"
    REFRESH_COOKIE_NAME: str = "refresh_token"

    @property
    def PRIVATE_KEY(self) -> str:
        return self.PATH_PRIV_KEY.read_text()
    
    @property
    def PUBLIC_KEY(self) -> str:
        return self.PATH_PUB_KEY.read_text()

    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(env_file=HOME_PATH / ".env")

settings = Settings() #type: ignore
