from fastapi import FastAPI
from uvicorn import run
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
async def hello():
    return"""
<h1>Hello from FastAPI!</h1>"""


if __name__=="__main__":
    run("main:app", host="localhost", port=8080)