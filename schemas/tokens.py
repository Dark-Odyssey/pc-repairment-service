from pydantic import BaseModel



class Tokens(BaseModel):
    access_token: str
    refresh_token: str
    csrf_token: str

class OrderCredsDTO(BaseModel):
    order_number: str
    access_code: str