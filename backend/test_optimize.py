import requests
import json

url = "http://localhost:8000/optimize"
payload = {"question": "What is the optimal cost for the current coffee distribution?"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
