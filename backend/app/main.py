"""
FastAPI application entry point.
Loads models on startup and serves prediction endpoints.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.loader import registry
from app.routers import predict, info

app = FastAPI(
    title="Precision Care Model",
    description="Staged Alzheimer's Disease prediction API",
    version="1.0.0"
)

# CORS middleware — allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models on startup
@app.on_event("startup")
async def startup_event():
    registry.load_all()
    print("All models loaded successfully.")

# Include routers
app.include_router(info.router)
app.include_router(predict.router)


@app.get("/")
async def root():
    return {
        "message": "Precision Care Model API",
        "docs": "/docs",
        "health": "/health"
    }
