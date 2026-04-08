import os
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.optiguide_service import process_optimization_query

load_dotenv()

app = FastAPI(title="OptiGuide Logistics API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizationRequest(BaseModel):
    question: str
    params: Optional[dict] = {}

@app.post("/optimize")
def optimize(request: OptimizationRequest):
    try:
        result = process_optimization_query(request.question, request.params or {})
        return result
    except Exception as e:
        return {"error": f"Internal Server Error: {str(e)}", "cost": None, "routes": [], "breakdown": {}}

@app.get("/health")
def health_check():
    mock_mode = os.environ.get("MOCK_MODE", "false").lower() == "true"
    return {
        "status": "ok",
        "mode": "mock" if mock_mode else "production",
        "engine": "OptiGuide + Gurobi",
        "version": "2.0.0"
    }

@app.get("/api-check")
def api_key_check():
    api_key = os.environ.get("OPENAI_API_KEY", "")
    mock_mode = os.environ.get("MOCK_MODE", "false").lower() == "true"

    if not api_key:
        return {"valid": False, "error": "OPENAI_API_KEY not configured", "mode": "mock" if mock_mode else "production"}

    if mock_mode:
        return {"valid": True, "mode": "mock", "note": "Mock mode active — real API not tested"}

    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
        models = client.models.list()
        return {"valid": True, "mode": "production", "model_count": len(list(models))}
    except Exception as e:
        error_msg = str(e)
        if "invalid_api_key" in error_msg or "Incorrect API key" in error_msg:
            return {"valid": False, "error": "Invalid API key", "mode": "production"}
        elif "insufficient_quota" in error_msg:
            return {"valid": False, "error": "Quota exceeded — check OpenAI billing", "mode": "production"}
        return {"valid": False, "error": error_msg[:150], "mode": "production"}

@app.get("/services")
def get_services():
    mock_mode = os.environ.get("MOCK_MODE", "false").lower() == "true"
    return {
        "mode": "mock" if mock_mode else "production",
        "services": [
            {"id": "route_opt",      "name": "Route Optimization",  "description": "Find least-cost shipping paths", "icon": "route",       "available": True},
            {"id": "what_if",        "name": "What-If Analysis",    "description": "AI-powered scenario simulation", "icon": "flask-conical","available": True},
            {"id": "cost_breakdown", "name": "Cost Breakdown",       "description": "Segment-level cost analysis",   "icon": "pie-chart",    "available": True},
            {"id": "demand_plan",    "name": "Demand Planning",      "description": "Optimize against cafe forecasts","icon": "trending-up",  "available": True},
            {"id": "supplier_eval",  "name": "Supplier Evaluation",  "description": "Compare supplier performance",  "icon": "users",        "available": True},
            {"id": "gurobi",         "name": "Gurobi Solver",        "description": "Industrial LP/MIP optimizer",   "icon": "cpu",          "available": True},
        ]
    }

frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
