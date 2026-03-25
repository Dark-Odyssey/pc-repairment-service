from uvicorn import run
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from tools.injections import DataBase

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def hello():
    return f"""
<h1>Hello from Fastapi!</h1>"""



if __name__=="__main__":
    run("main:app", host="localhost", port=8080)  