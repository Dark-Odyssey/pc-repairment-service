from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from tools.init_db import create_database, add_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_database()
    await add_admin()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def hello():
    return f"""
<h1>Hello from Fastapi!</h1>"""