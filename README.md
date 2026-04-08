<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Gurobi-EE3124?style=for-the-badge&logo=gurobi&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
</p>

# ⚡ OptiGuide — Logistics Intelligence Platform

> **AI-powered supply-chain optimization and what-if scenario analysis for coffee distribution across India.**

OptiGuide is a full-stack logistics optimization system that combines **Gurobi's industrial-grade LP/MIP solver** with **OpenAI-powered natural-language what-if analysis** to help supply chain managers find the least-cost distribution strategy — and instantly see how it changes under various disruption scenarios.

---

## 📸 Overview

| Feature | Description |
|---|---|
| 🗺️ **Interactive Route Map** | Real-time visualization of optimized supply routes on a dark-themed Leaflet map centered on India |
| 📊 **Cost Breakdown Charts** | Doughnut chart segmentation of shipping, roasting, and management costs |
| 🧪 **What-If Scenarios** | AI-driven scenario simulation — ask natural language questions like *"What if Supplier 1 capacity increases by 50%?"* |
| 📍 **Point-to-Point Routing** | Calculate logistics cost for specific origin→destination lanes |
| ⚙️ **Parameter Tuning** | Sliders for supplier capacity, cafe demand, and cost multipliers |
| 🔖 **Quick Presets** | One-click scenario presets (Baseline, High Demand, Cost Shock, Cap Cut) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Static)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Leaflet  │  │ Chart.js │  │  Lucide   │  │  Vanilla  │  │
│  │   Map    │  │ Doughnut │  │  Icons    │  │  CSS/JS   │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────┘  │
│              index.html · app.js · style.css                │
└─────────────┬───────────────────────────────────────────────┘
              │  HTTP (JSON) — port 8000
┌─────────────▼───────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  main.py — REST API                                  │   │
│  │  ├── POST /optimize   → run optimization query       │   │
│  │  ├── GET  /health     → backend status               │   │
│  │  ├── GET  /api-check  → OpenAI key validation        │   │
│  │  └── GET  /services   → available service list       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  optiguide_service.py — Core Logic                   │   │
│  │  ├── Gurobi LP Model (coffee distribution)           │   │
│  │  ├── OptiGuide Agent (AutoGen + OpenAI)              │   │
│  │  └── Mock Mode (offline testing)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Supply Chain Network

The system models a **3-tier coffee supply chain** across Indian cities:

| Tier | Nodes | Cities |
|---|---|---|
| **Suppliers** | 3 | Delhi, Mumbai, Kolkata |
| **Roasteries** | 2 | Bengaluru, Hyderabad |
| **Cafes** | 3 | Chennai, Pune, Ahmedabad |

The optimizer finds the minimum-cost flow from suppliers → roasteries → cafes while respecting capacity constraints and demand requirements for both light and dark coffee variants.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Gurobi Optimizer** (with a valid license — free academic licenses available at [gurobi.com](https://www.gurobi.com/academia/academic-program-and-licenses/))
- **OpenAI API Key** (for AI-powered what-if analysis; optional if using Mock Mode)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/logistic-optimization-system.git
cd logistic-optimization-system
```

### 2. Set Up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-dotenv openai pydantic gurobipy pyautogen
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
MOCK_MODE=false
```

> [!TIP]
> Set `MOCK_MODE=true` to run the system without an OpenAI API key or Gurobi license. The backend will return realistic pre-computed scenarios for testing and demonstration.

### 4. Start the Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Open the Dashboard

Navigate to **[http://localhost:8000](http://localhost:8000)** in your browser. The frontend is served as static files by the FastAPI backend — no separate build step required.

---

## 📂 Project Structure

```
logistic-optimization-system/
│
├── backend/
│   ├── main.py                     # FastAPI application & API routes
│   ├── .env                        # Environment variables (API keys, mode)
│   ├── test_optimize.py            # Quick API test script
│   ├── services/
│   │   └── optiguide_service.py    # Core optimization logic & mock engine
│   ├── optiguide/                  # OptiGuide library (AutoGen agent)
│   │   └── what-if/                # What-if scenario analysis module
│   └── venv/                       # Python virtual environment
│
├── frontend/
│   ├── index.html                  # Main dashboard UI
│   ├── style.css                   # Full design system (glassmorphism, dark theme)
│   ├── app.js                      # Application logic (map, charts, API calls)
│   └── components.js               # Reusable UI component templates
│
└── README.md                       # This file
```

---

## 🔌 API Reference

### `POST /optimize`

Run an optimization query with optional parameter overrides.

**Request Body:**

```json
{
  "question": "What if Supplier 1 capacity increases by 50%?",
  "params": {
    "capacity": { "supplier1": 225, "supplier2": 50, "supplier3": 100 },
    "demand": {
      "cafe1": { "light": 20, "dark": 20 },
      "cafe2": { "light": 30, "dark": 20 },
      "cafe3": { "light": 40, "dark": 100 }
    },
    "multipliers": { "shipping": 1.0, "roasting": 1.0 }
  }
}
```

**Response:**

```json
{
  "cost": 685.2,
  "breakdown": { "shipping": 342.6, "roasting": 205.6, "management": 137.0 },
  "routes": [
    { "from": "supplier1", "to": "roastery1", "volume": 90, "cost": 450 },
    { "from": "roastery2", "to": "cafe3", "volume": 110, "cost": 220 }
  ],
  "explanation": "Expanding Supplier 1 capacity enables higher Bengaluru throughput...",
  "mode": "mock"
}
```

### `GET /health`

Returns backend status and engine info.

```json
{ "status": "ok", "mode": "mock", "engine": "OptiGuide + Gurobi", "version": "2.0.0" }
```

### `GET /api-check`

Validates the configured OpenAI API key.

```json
{ "valid": true, "mode": "production", "model_count": 42 }
```

### `GET /services`

Lists all available optimization services.

```json
{
  "mode": "mock",
  "services": [
    { "id": "route_opt", "name": "Route Optimization", "description": "Find least-cost shipping paths", "available": true },
    { "id": "what_if", "name": "What-If Analysis", "description": "AI-powered scenario simulation", "available": true }
  ]
}
```

---

## 🧪 Running Tests

```bash
cd backend

# Quick endpoint test
python test_optimize.py
```

Ensure the server is running on `localhost:8000` before executing the test script.

---

## ⚙️ Operating Modes

| Mode | `MOCK_MODE` | Requirements | Description |
|---|---|---|---|
| **Production** | `false` | OpenAI API key + Gurobi license | Full AI-powered optimization with real Gurobi solver |
| **Mock** | `true` | None | Pre-computed scenario responses for demo/testing |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | FastAPI | High-performance REST API |
| **Optimization Solver** | Gurobi (gurobipy) | Linear/Mixed-Integer Programming |
| **AI Agent** | AutoGen + OpenAI GPT | Natural-language what-if queries |
| **Map Visualization** | Leaflet.js | Interactive route map |
| **Charts** | Chart.js | Cost breakdown doughnut chart |
| **Icons** | Lucide | Consistent, lightweight SVG icons |
| **Typography** | Inter + Outfit | Modern, clean UI fonts |
| **Styling** | Vanilla CSS | Glassmorphism dark theme with custom animations |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is built on top of the [OptiGuide](https://github.com/microsoft/OptiGuide) framework by Microsoft Research, licensed under the MIT License.

---

<p align="center">
  Built with ❤️ using FastAPI, Gurobi, and OpenAI
</p>