from routers.Admin import router as admin_router
from routers.Auth import router as auth_router
from routers.RepairOrder import router as repair_orders_router
from routers.DeviceType import router as device_type_router
from routers.Worker import router as worker_router
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
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(worker_router)
app.include_router(device_type_router)
app.include_router(repair_orders_router)

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