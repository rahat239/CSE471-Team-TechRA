from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
import numpy as np
import onnxruntime as ort
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware

app = FastAPI()

# --- Allow CORS for all origins (you can restrict to specific domains if needed) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, use ["http://localhost:3000"] for restricted access
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# --- Update  BASE and MODEL_DIR to point to ai_service/models ---
BASE = os.path.dirname(__file__)  # BASE should be the directory where app.py is located
MODEL_DIR = os.path.join(BASE, "models")  # Correct path to ai_service/models

# Debugging: Print model directory path
print(f"MODEL_DIR: {MODEL_DIR}")

# --- Load encoders ---
encoder_path = os.path.join(MODEL_DIR, "encoders.json")
print(f"Loading encoder from: {encoder_path}")  # Debugging line to ensure correct path

with open(encoder_path, "r") as f:
    encoders = json.load(f)

# --- Build reverse maps for decoding predictions back to labels ---
rev = {}
for col, mapping in encoders.items():
    rev[col] = {int(v): k for k, v in mapping.items()}

# --- Load ONNX models for each output ---
outputs = [
    "CPU", "GPU", "RAM", "Storage", "recommended_pc", "recommended_brand"
]
sessions = {}
for name in outputs:
    path = os.path.join(MODEL_DIR, f"{name}_recommendation_model.onnx")
    sessions[name] = ort.InferenceSession(path, providers=["CPUExecutionProvider"])

# --- Define the Request Model ---
class Req(BaseModel):
    budget: float
    workPurpose: str

# --- Prediction Endpoint ---
@app.post("/predict")
def predict(r: Req):
    # Check if required fields are provided
    if not r.budget or not r.workPurpose:
        return {"error": "Missing required fields: 'budget' and 'workPurpose'"}

    # Encode inputs
    if r.workPurpose not in encoders["work_purpose"]:
        return {"error": f"Unknown workPurpose: {r.workPurpose}"}

    # Prepare the input data
    x = np.array([[float(r.budget), float(encoders["work_purpose"][r.workPurpose])]], dtype=np.float32)

    result = {}
    # Loop through each output and generate predictions
    for name, sess in sessions.items():
        input_name = sess.get_inputs()[0].name
        try:
            pred = sess.run(None, {input_name: x})[0]
            # pred can be shape (1,) or (1,1) depending on export
            pred_id = int(np.array(pred).reshape(-1)[0])
            result[name] = rev[name].get(pred_id, pred_id)
        except Exception as e:
            return {"error": f"Error generating prediction for {name}: {str(e)}"}

    return {"recommendation": result}