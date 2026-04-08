<p align="center">
  <strong style="font-size:2rem;">⚡ OptiGuide — Logistics Intelligence Platform</strong><br>
  <em>Project Report</em>
</p>

---

# 📋 Project Report
## OptiGuide — Logistics Optimization System

| Field | Details |
|---|---|
| **Project Title** | OptiGuide — Logistics Intelligence Platform |
| **Domain** | Supply Chain Management / Operations Research |
| **Technology Stack** | Python, FastAPI, Gurobi, OpenAI, HTML/CSS/JS |
| **Version** | 2.0.0 |
| **Date** | April 2026  |

---

## 🔗 Project Links

| Link | URL |
|---|---|
| **GitHub Repository** | `<paste-your-github-repo-link-here>` |
| **Live Demo / Deployed App** | `<paste-your-live-deployment-link-here>` |
| **Demo Video / Recording** | `<paste-your-demo-video-link-here>` |
| **API Documentation** | `<paste-your-api-docs-link-here>` *(e.g. Swagger at `/docs`)* |
| **Presentation / Slides** | `<paste-your-slides-link-here>` |
| **OptiGuide (Base Framework)** | https://github.com/microsoft/OptiGuide |

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Literature Review & Background](#5-literature-review--background)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Module Descriptions](#8-module-descriptions)
9. [Supply Chain Model](#9-supply-chain-model)
10. [Data Flow & API Design](#10-data-flow--api-design)
11. [Frontend Design](#11-frontend-design)
12. [Optimization Engine](#12-optimization-engine)
13. [What-If Scenario Analysis](#13-what-if-scenario-analysis)
14. [Testing & Validation](#14-testing--validation)
15. [Screenshots](#15-screenshots)
16. [Future Enhancements](#16-future-enhancements)
17. [Conclusion](#17-conclusion)
18. [References](#18-references)

---

## 1. Abstract

OptiGuide is a full-stack logistics intelligence platform that addresses the complex problem of supply chain cost optimization through a combination of **mathematical programming** and **AI-driven natural-language what-if analysis**. The system models a multi-tier coffee distribution network across Indian cities — spanning suppliers, roasteries, and retail cafes — and uses Gurobi's industrial-grade LP/MIP solver to determine the minimum-cost flow plan while respecting capacity and demand constraints.

The platform features an interactive web dashboard with real-time route visualization on a dark-themed Leaflet map, doughnut-chart cost breakdowns, configurable network parameters via sliders, and an AI-powered scenario analysis panel where users can ask natural-language questions such as *"What if Supplier 1 capacity increases by 50%?"* and instantly see the optimized impact.

The system supports both a **production mode** (backed by OpenAI and Gurobi) and a **mock mode** for offline demonstrations, making it suitable for both real-world deployment and academic showcases.

---

## 2. Introduction

Logistics and supply chain management is one of the most critical components of modern business operations. Inefficient routing, poor capacity planning, and inability to respond to demand fluctuations can result in significant financial losses. Traditional spreadsheet-based approaches fail to capture the mathematical complexity of multi-node, multi-constraint distribution networks.

**OptiGuide** was developed to bridge this gap by combining:

- **Operations Research** — Formulating the distribution problem as a Linear Programming (LP) model with integer constraints (Mixed-Integer Programming).
- **AI/NLP** — Enabling non-technical users to explore "what-if" scenarios through natural language interaction, powered by OpenAI's GPT models and Microsoft's AutoGen framework.
- **Modern Web Technologies** — Providing a visually rich, real-time dashboard for intuitive exploration of results.

The system is contextualized for an **Indian coffee supply chain** spanning 8 nodes across 8 cities, but the architecture is generalizable to any multi-tier distribution network.

---

## 3. Problem Statement

> **How can we build an intelligent, user-friendly system that minimizes logistics costs across a multi-tier supply chain while enabling business stakeholders to interactively explore the impact of disruption scenarios in real time?**

Specific sub-problems addressed:

1. **Cost Minimization** — Finding the optimal volume allocation between suppliers → roasteries → cafes that minimizes total shipping + roasting + management costs.
2. **Constraint Satisfaction** — Ensuring supplier capacity limits are not exceeded and all cafe demands (for both light and dark coffee variants) are met.
3. **Scenario Exploration** — Allowing users to ask "what-if" questions and see how the optimal solution changes under disruptions such as capacity cuts, demand surges, or cost shocks.
4. **Visualization** — Presenting optimization results geographically on a map with cost breakdowns and route details.
5. **Accessibility** — Making the solver accessible to non-technical users through a modern web interface and natural-language query support.

---

## 4. Objectives

1. Design and implement a multi-tier supply chain optimization model using Gurobi's LP/MIP solver.
2. Build a FastAPI backend that exposes the optimization engine through a clean RESTful API.
3. Create an interactive frontend dashboard with map visualization, parameter tuning, and cost analysis.
4. Integrate AI-powered what-if scenario analysis using OpenAI GPT and Microsoft AutoGen's OptiGuide agent.
5. Support both production and mock operating modes for flexible deployment.
6. Localize the system for the Indian market with Indian city nodes and INR currency formatting.
7. Enable point-to-point route costing for ad-hoc logistics analysis.

---

## 5. Literature Review & Background

### 5.1 Linear Programming in Supply Chain

Linear Programming (LP) is a well-established mathematical technique for optimization, widely used in logistics since the 1940s (Dantzig, 1947). The transportation problem — a classic LP formulation — seeks the minimum-cost distribution plan between sources and destinations subject to supply and demand constraints.

Modern solvers like **Gurobi** extend LP with Mixed-Integer Programming (MIP), branch-and-bound algorithms, and cutting-plane methods to handle real-world constraints such as integer volumes, binary decisions (open/close a route), and non-linear costs.

### 5.2 AutoGen & OptiGuide

**AutoGen** (Wu et al., 2023) is Microsoft Research's multi-agent conversation framework that enables LLM-based agents to collaborate on complex tasks. **OptiGuide** (Li et al., 2023) builds on AutoGen to create a specialized agent that can interpret natural-language optimization queries, generate appropriate LP constraint code, and execute it safely via Gurobi — effectively bridging the gap between business users and mathematical solvers.

### 5.3 Interactive Data Visualization

Research in visual analytics (Thomas & Cook, 2005) shows that interactive visualizations significantly improve decision-making quality. Tools like Leaflet.js and Chart.js enable web-based geographic and statistical visualizations that allow users to explore data patterns intuitively.

---

## 6. System Architecture

The system follows a **client-server architecture** with a clear separation between the frontend presentation layer and the backend optimization engine.

```
┌──────────────────────────────────────────────────────────────┐
│                      USER (Browser)                          │
│                                                              │
│   ┌────────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐  │
│   │  Leaflet   │  │ Chart.js │  │  Lucide   │  │ Vanilla │  │
│   │ Map Viewer │  │ Doughnut │  │  Icons    │  │ CSS/JS  │  │
│   └────────────┘  └──────────┘  └───────────┘  └─────────┘  │
│   index.html  ·  app.js  ·  components.js  ·  style.css     │
└──────────────────────┬───────────────────────────────────────┘
                       │
            HTTP (JSON) — Port 8000
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                   BACKEND (FastAPI v2.0)                      │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  main.py — REST API Layer                            │   │
│   │  ├── POST /optimize    → run Gurobi/AI query         │   │
│   │  ├── GET  /health      → system status check         │   │
│   │  ├── GET  /api-check   → OpenAI key validation       │   │
│   │  └── GET  /services    → available services          │   │
│   └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│   ┌───────────────────────▼──────────────────────────────┐   │
│   │  optiguide_service.py — Core Optimization Logic      │   │
│   │  ├── Gurobi LP/MIP Model (coffee_distribution)       │   │
│   │  ├── OptiGuide Agent (AutoGen + OpenAI GPT-3.5)      │   │
│   │  ├── Mock Engine (pre-computed scenarios)             │   │
│   │  └── Response Parser (_parse_agent_text)              │   │
│   └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│   ┌───────────────────────▼──────────────────────────────┐   │
│   │  External Services                                   │   │
│   │  ├── Gurobi Optimizer (solver)                       │   │
│   │  └── OpenAI API (GPT-3.5-turbo for NL queries)      │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Architectural Highlights

| Aspect | Decision | Rationale |
|---|---|---|
| **Frontend Serving** | Static files served by FastAPI itself | Simplifies deployment — single process serves both API and UI |
| **CORS Policy** | Open (`allow_origins=["*"]`) | Enables local development and cross-origin access during prototyping |
| **API Design** | RESTful with JSON payloads | Standard, lightweight, easily consumed by any HTTP client |
| **Dual Mode** | Production + Mock via `MOCK_MODE` env var | Enables demos without requiring Gurobi license or OpenAI credits |
| **Agent Framework** | AutoGen UserProxy → OptiGuideAgent | Structured multi-agent conversation for safe code generation |

---

## 7. Technology Stack

### 7.1 Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Primary backend language |
| FastAPI | Latest | ASGI web framework for REST API |
| Uvicorn | Latest | ASGI server for running FastAPI |
| Gurobi (gurobipy) | Latest | Industrial LP/MIP optimization solver |
| OpenAI Python SDK | Latest | Interface to GPT-3.5-turbo for NL queries |
| AutoGen (pyautogen) | Latest | Multi-agent conversation framework |
| OptiGuide | Latest | Specialized optimization agent by Microsoft Research |
| python-dotenv | Latest | Environment variable management |
| Pydantic | v2 | Request/response data validation |

### 7.2 Frontend

| Technology | Version | Purpose |
|---|---|---|
| HTML5 | — | Document structure and semantics |
| Vanilla CSS | — | Premium dark-theme design system with glassmorphism |
| Vanilla JavaScript | ES6+ | Application logic, API integration, DOM manipulation |
| Leaflet.js | 1.9.4 | Interactive map visualization with dark CartoDB tiles |
| Chart.js | Latest | Doughnut chart for cost breakdown |
| Lucide Icons | Latest | Lightweight, consistent SVG icon set |
| Google Fonts | — | Inter (body) + Outfit (headings) typography |

### 7.3 External Services

| Service | Usage |
|---|---|
| OpenAI API (GPT-3.5-turbo) | Natural-language what-if query interpretation |
| CartoDB Dark Tile Server | Dark-themed map base layer |
| Google Fonts CDN | Typography delivery |
| unpkg CDN | Leaflet, Lucide, Chart.js delivery |

---

## 8. Module Descriptions

### 8.1 `backend/main.py` — API Layer

The central FastAPI application responsible for:

- **Routing** — Defines 4 REST endpoints (`/optimize`, `/health`, `/api-check`, `/services`).
- **CORS Middleware** — Enables cross-origin requests.
- **Static File Serving** — Mounts the `frontend/` directory to serve UI at the root URL.
- **Request Validation** — Uses Pydantic's `BaseModel` for typed request schemas.

### 8.2 `backend/services/optiguide_service.py` — Optimization Engine

The core intelligence module containing:

- **`COFFEE_CODE`** — The Gurobi model definition as Python source code, modeling the coffee supply chain LP with decision variables for supplier→roastery flows (`x`), and light/dark roast routes from roastery→cafe (`y_light`, `y_dark`).
- **`process_optimization_query()`** — The main entry point that routes requests to either the mock engine or the real OptiGuide agent based on `MOCK_MODE`.
- **`_pick_mock()`** — Keyword-based mock scenario selector for offline demonstrations.
- **`_parse_agent_text()`** — Regex parser that extracts cost and route data from the OptiGuide agent's natural-language response.
- **Mock Scenarios** — 4 pre-computed response sets: baseline, capacity expansion, cost shock, and high demand.

### 8.3 `frontend/index.html` — Dashboard Layout

A semantic HTML5 document implementing a **3-column layout**:

| Column | Content |
|---|---|
| **Left Panel** | Network Parameters — supplier capacity sliders, cafe demand inputs, cost multipliers, quick presets, and the "Run Optimization" button |
| **Center Panel** | Interactive Leaflet map showing optimized routes, cost breakdown doughnut chart, and active routes data table |
| **Right Panel** | AI-powered what-if query input, point-to-point route calculator, quick template chips, scenario history cards, and available services list |

### 8.4 `frontend/app.js` — Application Logic

Contains all runtime logic:

- **Map Management** — Initializes Leaflet with dark CartoDB tiles, draws node markers (color-coded by tier), renders ghost routes (all-possible paths) and active routes (optimized paths with cost-based coloring).
- **Chart Management** — Initializes and updates the Chart.js doughnut chart for cost segmentation.
- **API Integration** — Sends optimization requests to the backend, handles responses, and updates all UI sections.
- **Health/Key Monitoring** — Periodic polling of `/health` and `/api-check` endpoints with visual status indicators.
- **Preset System** — One-click scenario presets that auto-populate parameters and trigger optimization.
- **Event Handling** — All button clicks, template chips, keyboard shortcuts (Ctrl+Enter to submit).

### 8.5 `frontend/components.js` — Reusable UI Templates

Template functions for dynamically generated HTML:

- **`UI.scenarioCard()`** — Renders a scenario history card with cost, explanation excerpt, and delta tags.
- **`UI.routeRow()`** — Renders a table row with from/to city labels, volume badges, and cost tags.
- **`UI.serviceItem()`** — Renders a service entry with icon, name, description, and availability dot.
- **`UI.showLoading()` / `UI.hideLoading()`** — Loading overlay management.

### 8.6 `frontend/style.css` — Design System

A comprehensive 476-line CSS design system implementing:

- **CSS Custom Properties** — Full design token system (colors, spacing, transitions, shadows).
- **Dark Premium Theme** — Deep navy backgrounds (#070b12, #0d1320) with glassmorphism effects.
- **Component Styles** — Styled sliders, badges, pills, scenario cards, tables, and glass-effect panels.
- **Animations** — Spin (loading), slideIn (scenario cards), pulse (status dots).
- **Leaflet Overrides** — Custom popup and control styling to match the dark theme.
- **Custom Scrollbar** — Minimal, translucent scrollbar styling.

---

## 9. Supply Chain Model

### 9.1 Network Topology

The system models a **3-tier supply chain** for coffee distribution across India:

```
     SUPPLIERS                ROASTERIES               CAFES
  ┌──────────────┐        ┌───────────────┐       ┌──────────────┐
  │ S1 — Delhi   │───────▶│ R1 — Bengaluru│──────▶│ C1 — Chennai │
  │ (cap: 150)   │╲      ╱│ (light: ₹3)   │╲    ╱ │ (L:20, D:20) │
  └──────────────┘ ╲    ╱ │ (dark:  ₹5)   │ ╲  ╱  └──────────────┘
                    ╲  ╱  └───────────────┘  ╲╱
  ┌──────────────┐  ╲╱                        ╳   ┌──────────────┐
  │ S2 — Mumbai  │  ╱╲                       ╱╲  │ C2 — Pune    │
  │ (cap: 50)    │ ╱  ╲  ┌───────────────┐  ╱  ╲ │ (L:30, D:20) │
  └──────────────┘╱    ╲▶│ R2 — Hyderabad│╱    ╲▶└──────────────┘
                 ╱      ╲│ (light: ₹5)   │╲
  ┌──────────────┐       │ (dark:  ₹6)   │ ╲     ┌──────────────┐
  │ S3 — Kolkata │──────▶└───────────────┘  ────▶│ C3 — Ahmedabad│
  │ (cap: 100)   │                                │ (L:40, D:100)│
  └──────────────┘                                └──────────────┘
```

### 9.2 Mathematical Formulation

**Decision Variables:**

| Variable | Domain | Meaning |
|---|---|---|
| `x[s, r]` | Integer ≥ 0 | Volume from supplier `s` to roastery `r` |
| `y_light[r, c]` | Integer ≥ 0 | Light coffee volume from roastery `r` to cafe `c` |
| `y_dark[r, c]` | Integer ≥ 0 | Dark coffee volume from roastery `r` to cafe `c` |

**Objective Function (Minimize):**

```
Z = Σ (shipping_cost[s,r] × x[s,r])                           ← Supplier→Roastery shipping
  + Σ (roasting_cost_light[r] × y_light[r,c])                 ← Light roasting cost
  + Σ (roasting_cost_dark[r] × y_dark[r,c])                   ← Dark roasting cost
  + Σ (shipping_cost[r,c] × (y_light[r,c] + y_dark[r,c]))     ← Roastery→Cafe shipping
```

**Constraints:**

| Constraint | Description |
|---|---|
| **Flow Conservation** | Total inflow to each roastery = total outflow |
| **Supplier Capacity** | Total shipments from each supplier ≤ its capacity |
| **Light Demand** | Each cafe receives ≥ its light coffee demand |
| **Dark Demand** | Each cafe receives ≥ its dark coffee demand |
| **Non-negativity** | All variables ≥ 0, integer |

### 9.3 Cost Matrix (Default Values, in ₹)

**Shipping: Supplier → Roastery**

| | Roastery 1 (Bengaluru) | Roastery 2 (Hyderabad) |
|---|---|---|
| **Supplier 1 (Delhi)** | ₹5 | ₹4 |
| **Supplier 2 (Mumbai)** | ₹6 | ₹3 |
| **Supplier 3 (Kolkata)** | ₹2 | ₹7 |

**Shipping: Roastery → Cafe**

| | Cafe 1 (Chennai) | Cafe 2 (Pune) | Cafe 3 (Ahmedabad) |
|---|---|---|---|
| **Roastery 1 (Bengaluru)** | ₹5 | ₹3 | ₹6 |
| **Roastery 2 (Hyderabad)** | ₹4 | ₹5 | ₹2 |

---

## 10. Data Flow & API Design

### 10.1 Request-Response Cycle

```
┌────────┐    POST /optimize     ┌─────────┐    Gurobi Solve     ┌──────────┐
│  User  │ ──── { question, ────▶│ FastAPI  │ ─── LP Model ─────▶│  Gurobi  │
│ (Browser)│     params }        │ main.py  │                     │ Solver   │
└────────┘                       └──┬──────┘◀── optimal cost ────└──────────┘
     ▲                              │
     │    { cost, breakdown,        │  (or Mock Engine if MOCK_MODE=true)
     │      routes[], explanation } │
     └──────────────────────────────┘
```

### 10.2 API Endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/optimize` | Run optimization with question + params | None |
| `GET` | `/health` | System status, mode, engine info | None |
| `GET` | `/api-check` | Validate OpenAI API key | None |
| `GET` | `/services` | List available services | None |

### 10.3 Request Schema — `/optimize`

```json
{
  "question": "string (required) — natural language query",
  "params": {
    "capacity": {
      "supplier1": 150,
      "supplier2": 50,
      "supplier3": 100
    },
    "demand": {
      "cafe1": { "light": 20, "dark": 20 },
      "cafe2": { "light": 30, "dark": 20 },
      "cafe3": { "light": 40, "dark": 100 }
    },
    "multipliers": {
      "shipping": 1.0,
      "roasting": 1.0
    }
  }
}
```

### 10.4 Response Schema — `/optimize`

```json
{
  "cost": 742.0,
  "breakdown": {
    "shipping": 371.0,
    "roasting": 222.6,
    "management": 148.4
  },
  "routes": [
    {
      "from": "supplier1",
      "to": "roastery1",
      "volume": 70,
      "cost": 350
    }
  ],
  "explanation": "Baseline optimization complete...",
  "mode": "mock | production | error"
}
```

---

## 11. Frontend Design

### 11.1 Design Philosophy

The frontend follows a **premium dark-mode glassmorphism aesthetic**:

- **Color Palette** — Deep navy backgrounds (#070b12, #0d1320) with blue (#3b82f6), cyan (#06b6d4), purple (#8b5cf6), gold (#f59e0b), green (#22c55e), and red (#ef4444) accents.
- **Glassmorphism** — Translucent cards with `backdrop-filter: blur(14px)` and subtle borders.
- **Typography** — Inter (body text, 300–700 weights) and Outfit (headings, 400–800 weights) from Google Fonts.
- **Micro-animations** — Smooth hover transitions (0.22s cubic-bezier), pulse animation on status dots, slide-in for scenario cards.
- **Custom Scrollbar** — Minimal 5px translucent scrollbar.

### 11.2 Layout Architecture

A **3-column horizontal layout** filling the full viewport:

```
┌─────────────────────────────────────────────────────┐
│                    TOP BAR (60px)                     │
│  [Brand Logo]  [KPI Chips: Cost|Savings|Routes|Runs] │
│                              [Status: Backend|Key]   │
├──────────┬─────────────────────────┬────────────────┤
│  LEFT    │       CENTER            │    RIGHT       │
│  PANEL   │                         │    PANEL       │
│  (296px) │  ┌───────────────────┐  │    (336px)     │
│          │  │    LEAFLET MAP    │  │                │
│ Supplier │  │   (dark theme)    │  │ AI Query Box   │
│ Capacity │  │   Route Lines     │  │ Point-to-Point │
│  Sliders │  │   City Markers    │  │ Template Chips │
│          │  └───────────────────┘  │                │
│ Cafe     │                         │ Scenario       │
│ Demand   │  ┌──────────┬────────┐  │ History Cards  │
│ Inputs   │  │  Cost    │ Route  │  │                │
│          │  │ Doughnut │ Table  │  │ Available      │
│ Cost     │  │  Chart   │        │  │ Services List  │
│ Sliders  │  └──────────┴────────┘  │                │
│          │                         │                │
│ Presets  │                         │                │
│ Optimize │                         │                │
└──────────┴─────────────────────────┴────────────────┘
```

### 11.3 Map Visualization

- **Base Layer** — CartoDB Dark Matter tiles for a professional dark aesthetic.
- **Node Markers** — Color-coded circle markers: blue (suppliers), cyan (roasteries), gold (cafes).
- **Ghost Routes** — All 12 possible route paths drawn as dim dashed lines (#334155, opacity 0.35).
- **Active Routes** — Optimized routes drawn as solid lines, color-coded by cost (green → orange → red), weight scaled by volume.
- **Popups** — Interactive click-to-reveal labels with route details (volume, cost in ₹).

### 11.4 Interactive Elements

| Element | Type | Function |
|---|---|---|
| Capacity Sliders | `<input type="range">` | Adjust supplier 1/2/3 capacity (50–300) |
| Demand Inputs | `<input type="number">` | Set light/dark demand per cafe |
| Cost Multipliers | `<input type="range">` | Scale shipping/roasting costs (0.5×–3.0×) |
| Preset Buttons | `<button>` | One-click presets (Baseline, High Demand, Cost Shock, Cap Cut) |
| Optimize Button | `<button>` | Trigger optimization with current parameters |
| Scenario Textarea | `<textarea>` | Free-form natural language query input |
| Analyze Button | `<button>` | Submit what-if scenario to AI |
| Route Dropdowns | `<select>` | Point-to-point origin/destination selection |
| Template Chips | `<button>` | Pre-fill scenario textarea with common queries |
| Clear All | `<button>` | Clear scenario history |

---

## 12. Optimization Engine

### 12.1 Gurobi Solver

The optimization model is formulated as a **Linear Program with Integer constraints** (MIP) using Gurobi's Python API (`gurobipy`). The model:

1. Creates integer decision variables for all supply chain edges.
2. Sets the objective to minimize total cost (shipping + roasting + management).
3. Adds constraints for flow conservation, capacity limits, and demand satisfaction.
4. Invokes `model.optimize()` to find the globally optimal solution.
5. Returns the optimal objective value and variable assignments.

### 12.2 OptiGuide Agent

In production mode, the system uses Microsoft Research's **OptiGuide** agent (built on AutoGen) to:

1. Accept a natural-language question from the user.
2. Interpret the question and determine necessary constraint modifications.
3. Generate safe Python/Gurobi code to implement the scenario.
4. Execute the modified model through Gurobi.
5. Return a natural-language explanation of results.

Safety is ensured through OptiGuide's `use_safeguard=True` parameter, which validates generated code before execution.

### 12.3 Mock Engine

When `MOCK_MODE=true`, the system bypasses Gurobi and OpenAI entirely, using a keyword-matching function (`_pick_mock()`) to select from 4 pre-computed scenario responses:

| Keyword Match | Scenario | Baseline Cost |
|---|---|---|
| capacity, supplier, increase | **Capacity Expansion** | ₹685.2 (↓7.7%) |
| cost, shipping, rate, shock | **Cost Shock** | ₹897.5 (↑20.9%) |
| demand, cafe, doubles | **High Demand** | ₹842.0 (↑13.5%) |
| *(default)* | **Baseline** | ₹742.0 |

---

## 13. What-If Scenario Analysis

The what-if analysis feature is the platform's key differentiator. It bridges the gap between mathematical optimization and business decision-making.

### 13.1 How It Works

1. **User Input** → The user types a natural-language question (e.g., *"What if shipping costs double?"*) or selects a quick template.
2. **API Call** → The frontend sends a `POST /optimize` request with the question and current parameter snapshot.
3. **AI Processing** → The OptiGuide agent interprets the query, modifies the LP constraints, and re-solves.
4. **Results** → The response includes the new optimal cost, route allocations, cost breakdown, and a natural-language explanation.
5. **UI Update** → All dashboard components update simultaneously — KPI chips, map routes, doughnut chart, routes table, and a new scenario card is added to the history.

### 13.2 Scenario Templates

| Template | Question Generated |
|---|---|
| Supplier 1 capacity +50% | *"What if Supplier 1 capacity increases by 50%?"* |
| Shipping costs doubled | *"What if shipping costs are doubled due to fuel surcharge?"* |
| Cafe 3 demand doubled | *"What if Cafe 3 demand doubles?"* |
| Consolidate at Roastery 1 | *"What if we consolidate all roasting at Roastery 1 in Bengaluru?"* |

### 13.3 Point-to-Point Routing

Users can also perform **ad-hoc lane-level analysis** by:
1. Selecting a source node (supplier or roastery) from the "From" dropdown.
2. Selecting a destination node (roastery or cafe) from the "To" dropdown.
3. Specifying a volume.
4. Clicking "Calculate Route" — which constructs a forced-routing query and sends it through the optimization engine.

---

## 14. Testing & Validation

### 14.1 Backend Testing

A test script (`test_optimize.py`) sends a POST request to `/optimize` and validates the response structure:

```python
url = "http://localhost:8000/optimize"
payload = {"question": "What is the optimal cost for the current coffee distribution?"}
response = requests.post(url, json=payload)
print(response.json())
```

### 14.2 Health & API Checks

The system includes built-in health monitoring:

- **`/health`** — Confirms backend is running, reports mode (mock/production) and engine version.
- **`/api-check`** — Validates the OpenAI API key by attempting to list available models, and reports detailed errors for common failure modes (invalid key, insufficient quota).

### 14.3 Frontend Validation

- **Status Indicators** — Real-time backend connectivity (green/red dot) and API key validity, polled every 30s and 60s respectively.
- **Error Handling** — User-facing alerts for connection failures and optimization errors.
- **Loading States** — Full-screen blur overlay with spinner during optimization runs.

### 14.4 Mock Mode Testing

The mock mode enables full end-to-end testing of the frontend and API layer without requiring Gurobi or OpenAI credentials:

| Test Case | Expected Behavior |
|---|---|
| Baseline preset | Returns ₹742.0, 6 routes, updates all UI sections |
| High demand preset | Returns ₹842.0, +13.5% increase, rerouted through Hyderabad |
| Cost shock preset | Returns ₹897.5, +20.9% increase, supplier redirections |
| Cap cut preset | Lower capacity, adjusted volumes |
| Multiple scenarios | History cards accumulate, savings % computed vs first run |
| Clear all | Resets scenario count, history, and baseline |

---

## 15. Screenshots

> *(Insert screenshots of the application here)*
>
> Suggested screenshots:
> 1. **Dashboard Overview** — Full 3-column layout with map and controls
> 2. **Baseline Optimization** — Map with active routes after running baseline
> 3. **What-If Scenario** — Scenario card showing cost comparison
> 4. **Cost Breakdown** — Doughnut chart with segment values
> 5. **Route Table** — Active routes with volume and cost details
> 6. **Point-to-Point** — Ad-hoc routing result
> 7. **Mobile/Responsive** — *(if applicable)*

---

## 16. Future Enhancements

| Enhancement | Description | Priority |
|---|---|---|
| **Real-Time Data Integration** | Connect to live inventory/shipment APIs for dynamic demand and capacity data | High |
| **Multi-Objective Optimization** | Add time, carbon footprint, and reliability as secondary objectives | High |
| **User Authentication** | Role-based access (manager, analyst, viewer) with saved scenarios | Medium |
| **Database Persistence** | Store scenario history, user preferences, and historical optimization results in PostgreSQL | Medium |
| **Additional Solvers** | Support for CPLEX, OR-Tools as alternative solvers | Medium |
| **Responsive Design** | Mobile-optimized layout for tablet/phone access | Medium |
| **Export & Reporting** | PDF/Excel export of optimization results and scenario comparisons | Medium |
| **Network Expansion** | Support for arbitrary number of nodes (suppliers, roasteries, cafes) via dynamic configuration | High |
| **Constraint Editor** | Visual constraint builder for non-technical users (e.g., "block this route", "set minimum volume") | Low |
| **Real Map Routing** | Use actual road network distances (via OSRM or Google Maps API) instead of great-circle paths | Low |

---

## 17. Conclusion

The **OptiGuide Logistics Intelligence Platform** successfully demonstrates the integration of classical operations research techniques with modern AI and web technologies to solve real-world supply chain optimization problems. 

Key achievements of this project:

1. **Mathematical Rigor** — The Gurobi-based LP/MIP model provides provably optimal solutions for the distribution problem.
2. **AI Accessibility** — Natural-language what-if analysis via OptiGuide/AutoGen removes the barrier between business users and mathematical optimizers.
3. **Visual Excellence** — The premium dark-mode dashboard with interactive maps, charts, and scenario cards provides an intuitive decision-support experience.
4. **Practical Flexibility** — Dual-mode operation (production/mock) makes the system equally suitable for real-world deployment and academic demonstration.
5. **Extensibility** — The modular architecture (FastAPI + static frontend) is straightforward to extend with new features, solvers, or data sources.

The platform serves as both a **practical logistics tool** and a **showcase of how AI-augmented optimization** can transform decision-making in supply chain management.

---

## 18. References

1. **Dantzig, G. B.** (1947). *Maximization of a linear function of variables subject to linear inequalities*. Activity Analysis of Production and Allocation.
2. **Wu, Q., Bansal, G., Zhang, J., et al.** (2023). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation*. Microsoft Research. arXiv:2308.08155.
3. **Li, B., et al.** (2023). *OptiGuide: Large Language Models for Supply Chain Optimization*. Microsoft Research.
4. **Gurobi Optimization.** (2024). *Gurobi Optimizer Reference Manual*. https://www.gurobi.com/documentation/
5. **FastAPI.** (2024). *FastAPI Documentation*. https://fastapi.tiangolo.com/
6. **Leaflet.js.** (2024). *Leaflet — an open-source JavaScript library for interactive maps*. https://leafletjs.com/
7. **Chart.js.** (2024). *Simple yet flexible JavaScript charting*. https://www.chartjs.org/
8. **Thomas, J. J., & Cook, K. A.** (2005). *Illuminating the Path: The Research and Development Agenda for Visual Analytics*. IEEE Press.
9. **OpenAI.** (2024). *OpenAI API Documentation*. https://platform.openai.com/docs/

---

<p align="center">
  <strong>— End of Project Report —</strong><br>
  <em>OptiGuide v2.0.0 · April 2026</em>
</p>
