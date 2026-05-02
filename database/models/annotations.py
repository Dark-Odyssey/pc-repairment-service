from typing import Annotated
from sqlalchemy.orm import mapped_column
from sqlalchemy import String


intpk = Annotated[int, mapped_column(primary_key=True)]
str_50 = Annotated[str, mapped_column(String(50))]
str_100 = Annotated[str, mapped_column(String(100))]
str_256 = Annotated[str, mapped_column(String(256))]