
import logging
from fastapi import FastAPI, CORSMiddleware

# Importar los routers que hemos creado
from api.routers import search, stock

# --- Configuración del Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)

# --- Inicialización de la App FastAPI ---
app = FastAPI(
    title="Value Calculator API",
    description="API para la calculadora de valor de acciones, con endpoints para búsqueda y datos financieros.",
    version="1.0.0",
)

# --- Middleware de CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://value-calculator-psi.vercel.app", # Dominio de producción
        "http://localhost:5173", # Entorno de desarrollo local
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Inclusión de Routers ---
# Vercel maneja el /api a través de las reescrituras en vercel.json
app.include_router(search.router)
app.include_router(stock.router)


# --- Endpoint Raíz (Opcional) ---
@app.get("/", tags=["root"])
def read_root():
    return {"status": "API is running"}
