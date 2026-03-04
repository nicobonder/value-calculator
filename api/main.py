
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .routers import search, stock

# --- Configuración del Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)

# --- Inicialización de la App FastAPI ---
app = FastAPI(
    title="Value Calculator API",
    description="API para la calculadora de valor de acciones, con endpoints para búsqueda y datos financieros.",
    version="1.1.0", # Version bump
)

# --- MANEJADOR DE EXCEPCIONES GLOBAL (NUESTRA 'CAJA NEGRA') ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Este manejador captura cualquier excepción no controlada en la aplicación,
    evitando los 500 genéricos y devolviendo siempre un JSON con el detalle del error.
    """
    logging.error(f"Unhandled exception for {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "message": "An unexpected internal server error occurred.",
            "error_type": str(type(exc).__name__),
            "error_details": str(exc)
        },
    )

# --- Middleware de CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://value-calculator-psi.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Inclusión de Routers ---
app.include_router(search.router)
app.include_router(stock.router)

# --- Endpoint Raíz ---
@app.get("/", tags=["root"])
def read_root():
    return {"status": "API is running"}

