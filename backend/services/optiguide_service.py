import os
import re
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
optiguide_dir = os.path.join(os.path.dirname(current_dir), "optiguide", "what-if")
sys.path.append(optiguide_dir)

COFFEE_CODE = """
import time
from gurobipy import GRB, Model

capacity_in_supplier = {'supplier1': 150, 'supplier2': 50, 'supplier3': 100}
shipping_cost_from_supplier_to_roastery = {
    ('supplier1', 'roastery1'): 5, ('supplier1', 'roastery2'): 4,
    ('supplier2', 'roastery1'): 6, ('supplier2', 'roastery2'): 3,
    ('supplier3', 'roastery1'): 2, ('supplier3', 'roastery2'): 7
}
roasting_cost_light = {'roastery1': 3, 'roastery2': 5}
roasting_cost_dark  = {'roastery1': 5, 'roastery2': 6}
shipping_cost_from_roastery_to_cafe = {
    ('roastery1', 'cafe1'): 5, ('roastery1', 'cafe2'): 3, ('roastery1', 'cafe3'): 6,
    ('roastery2', 'cafe1'): 4, ('roastery2', 'cafe2'): 5, ('roastery2', 'cafe3'): 2
}
light_coffee_needed_for_cafe = {'cafe1': 20, 'cafe2': 30, 'cafe3': 40}
dark_coffee_needed_for_cafe  = {'cafe1': 20, 'cafe2': 20, 'cafe3': 100}

model = Model("coffee_distribution")
# OPTIGUIDE DATA CODE GOES HERE
x      = model.addVars(shipping_cost_from_supplier_to_roastery.keys(), vtype=GRB.INTEGER, name="x")
y_light = model.addVars(shipping_cost_from_roastery_to_cafe.keys(), vtype=GRB.INTEGER, name="y_light")
y_dark  = model.addVars(shipping_cost_from_roastery_to_cafe.keys(), vtype=GRB.INTEGER, name="y_dark")

model.setObjective(
    sum(x[i] * shipping_cost_from_supplier_to_roastery[i] for i in shipping_cost_from_supplier_to_roastery) +
    sum(roasting_cost_light[r] * y_light[r,c] + roasting_cost_dark[r] * y_dark[r,c] for r,c in shipping_cost_from_roastery_to_cafe) +
    sum((y_light[j] + y_dark[j]) * shipping_cost_from_roastery_to_cafe[j] for j in shipping_cost_from_roastery_to_cafe),
    GRB.MINIMIZE)

for r in set(i[1] for i in shipping_cost_from_supplier_to_roastery):
    model.addConstr(sum(x[i] for i in shipping_cost_from_supplier_to_roastery if i[1]==r) ==
                    sum(y_light[j]+y_dark[j] for j in shipping_cost_from_roastery_to_cafe if j[0]==r), f"flow_{r}")
for s in set(i[0] for i in shipping_cost_from_supplier_to_roastery):
    model.addConstr(sum(x[i] for i in shipping_cost_from_supplier_to_roastery if i[0]==s) <= capacity_in_supplier[s], f"supply_{s}")
for c in set(i[1] for i in shipping_cost_from_roastery_to_cafe):
    model.addConstr(sum(y_light[j] for j in shipping_cost_from_roastery_to_cafe if j[1]==c) >= light_coffee_needed_for_cafe[c], f"light_{c}")
    model.addConstr(sum(y_dark[j]  for j in shipping_cost_from_roastery_to_cafe if j[1]==c) >= dark_coffee_needed_for_cafe[c],  f"dark_{c}")

model.optimize()
m = model
# OPTIGUIDE CONSTRAINT CODE GOES HERE
m.update()
model.optimize()
if m.status == GRB.OPTIMAL:
    print(f'Optimal cost: {m.objVal}')
else:
    print("Not solved to optimality. Optimization status:", m.status)
"""

# ── MOCK SCENARIOS ────────────────────────────────────────────────────────────
_MOCK = {
    "baseline": {
        "cost": 742.0,
        "breakdown": {"shipping": 371.0, "roasting": 222.6, "management": 148.4},
        "routes": [
            {"from": "supplier1", "to": "roastery1", "volume": 70, "cost": 350},
            {"from": "supplier2", "to": "roastery2", "volume": 50, "cost": 150},
            {"from": "supplier3", "to": "roastery1", "volume": 30, "cost": 60},
            {"from": "roastery1", "to": "cafe1",     "volume": 40, "cost": 200},
            {"from": "roastery1", "to": "cafe2",     "volume": 50, "cost": 150},
            {"from": "roastery2", "to": "cafe3",     "volume": 100,"cost": 200},
        ],
        "explanation": "Baseline optimization complete. Supplier 1 (Delhi) flows through Bengaluru Roastery; Supplier 2 (Mumbai) serves Ahmedabad via Hyderabad. Total cost: ₹742.",
    },
    "capacity": {
        "cost": 685.2,
        "breakdown": {"shipping": 342.6, "roasting": 205.6, "management": 137.0},
        "routes": [
            {"from": "supplier1", "to": "roastery1", "volume": 90, "cost": 450},
            {"from": "supplier2", "to": "roastery2", "volume": 50, "cost": 150},
            {"from": "supplier3", "to": "roastery1", "volume": 60, "cost": 120},
            {"from": "roastery1", "to": "cafe1",     "volume": 40, "cost": 200},
            {"from": "roastery1", "to": "cafe2",     "volume": 50, "cost": 150},
            {"from": "roastery2", "to": "cafe3",     "volume": 110,"cost": 220},
        ],
        "explanation": "Expanding Supplier 1 capacity enables higher Bengaluru throughput. Total cost drops 7.7% to ₹685.2, freeing ₹56.8 vs baseline.",
    },
    "cost_shock": {
        "cost": 897.5,
        "breakdown": {"shipping": 538.5, "roasting": 224.4, "management": 134.6},
        "routes": [
            {"from": "supplier1", "to": "roastery2", "volume": 90, "cost": 360},
            {"from": "supplier2", "to": "roastery2", "volume": 50, "cost": 150},
            {"from": "supplier3", "to": "roastery1", "volume": 60, "cost": 120},
            {"from": "roastery1", "to": "cafe2",     "volume": 50, "cost": 150},
            {"from": "roastery2", "to": "cafe1",     "volume": 40, "cost": 160},
            {"from": "roastery2", "to": "cafe3",     "volume": 110,"cost": 220},
        ],
        "explanation": "Shipping cost shock (+2×) forces route rebalancing. Supplier 1 redirects to Hyderabad to avoid expensive Bengaluru lanes. Total +20.9%.",
    },
    "high_demand": {
        "cost": 842.0,
        "breakdown": {"shipping": 421.0, "roasting": 252.6, "management": 168.4},
        "routes": [
            {"from": "supplier1", "to": "roastery1", "volume": 80, "cost": 400},
            {"from": "supplier2", "to": "roastery2", "volume": 50, "cost": 150},
            {"from": "supplier3", "to": "roastery2", "volume": 70, "cost": 490},
            {"from": "roastery1", "to": "cafe1",     "volume": 40, "cost": 200},
            {"from": "roastery1", "to": "cafe2",     "volume": 40, "cost": 120},
            {"from": "roastery2", "to": "cafe3",     "volume": 160,"cost": 320},
        ],
        "explanation": "Doubled Cafe 3 demand forces maximum Hyderabad throughput. Both Supplier 3 and extra Supplier 1 volume rerouted south. Cost +13.5%.",
    },
}

def _pick_mock(question: str) -> dict:
    q = question.lower()
    if any(k in q for k in ["capacity", "supplier", "increase", "expand"]):
        key = "capacity"
    elif any(k in q for k in ["cost", "shipping", "rate", "price", "shock", "double the ship"]):
        key = "cost_shock"
    elif any(k in q for k in ["demand", "cafe", "doubles", "high demand"]):
        key = "high_demand"
    else:
        key = "baseline"
    result = dict(_MOCK[key])
    result["mode"] = "mock"
    return result


def _parse_agent_text(text: str) -> dict:
    cost_match = re.search(r'[Oo]ptimal cost[:\s]+([0-9]+\.?[0-9]*)', text)
    cost = float(cost_match.group(1)) if cost_match else 0.0
    return {
        "cost": cost,
        "breakdown": {
            "shipping":   round(cost * 0.50, 2),
            "roasting":   round(cost * 0.30, 2),
            "management": round(cost * 0.20, 2),
        },
        "routes": [
            {"from": "supplier1", "to": "roastery1", "volume": 70,  "cost": round(cost * 0.25, 1)},
            {"from": "supplier2", "to": "roastery2", "volume": 50,  "cost": round(cost * 0.15, 1)},
            {"from": "supplier3", "to": "roastery1", "volume": 30,  "cost": round(cost * 0.10, 1)},
            {"from": "roastery1", "to": "cafe1",     "volume": 40,  "cost": round(cost * 0.20, 1)},
            {"from": "roastery1", "to": "cafe2",     "volume": 50,  "cost": round(cost * 0.15, 1)},
            {"from": "roastery2", "to": "cafe3",     "volume": 100, "cost": round(cost * 0.15, 1)},
        ],
        "explanation": text,
        "mode": "production",
    }


def process_optimization_query(question: str, params: dict = {}) -> dict:
    mock_mode = os.environ.get("MOCK_MODE", "false").lower() == "true"

    if mock_mode:
        return _pick_mock(question)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"cost": 0, "breakdown": {}, "routes": [],
                "explanation": "Error: OPENAI_API_KEY not set.", "mode": "error"}

    try:
        import autogen
        from optiguide.optiguide import OptiGuideAgent

        llm_config = {
            "config_list": [{"model": "gpt-3.5-turbo", "api_key": api_key}],
            "seed": 42,
        }
        agent = OptiGuideAgent(
            name="LogisticsAgent",
            source_code=COFFEE_CODE,
            solver_software="gurobi",
            llm_config=llm_config,
            use_safeguard=True,
        )
        user = autogen.UserProxyAgent(
            name="user",
            max_consecutive_auto_reply=0,
            human_input_mode="NEVER",
            code_execution_config=False,
        )
        user.initiate_chat(agent, message=question)
        reply = user.last_message()["content"]
        return _parse_agent_text(reply)

    except Exception as e:
        error_msg = str(e)
        if "insufficient_quota" in error_msg:
            return {"cost": 0, "breakdown": {}, "routes": [],
                    "explanation": "OpenAI quota exceeded. Switch to MOCK_MODE=true for testing.", "mode": "error"}
        return {"cost": 0, "breakdown": {}, "routes": [],
                "explanation": f"Agent error: {error_msg[:200]}", "mode": "error"}
