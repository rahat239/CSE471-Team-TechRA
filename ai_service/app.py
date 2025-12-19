from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
import numpy as np
import onnxruntime as ort

app = FastAPI()

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "models")

# Load encoders
with open(os.path.join(MODEL_DIR, "encoders.json"), "r") as f:
    encoders = json.load(f)

# Build reverse maps for decoding predictions back to labels
rev = {}
for col, mapping in encoders.items():
    rev[col] = {int(v): k for k, v in mapping.items()}

# Load ONNX models for each output
outputs = [
    "CPU", "GPU", "RAM", "Storage", "recommended_pc", "recommended_brand"
]
sessions = {}
for name in outputs:
    path = os.path.join(MODEL_DIR, f"{name}_recommendation_model.onnx")
    sessions[name] = ort.InferenceSession(path, providers=["CPUExecutionProvider"])

class Req(BaseModel):
    budget: float
    workPurpose: str

@app.post("/recommend")
def recommend(r: Req):
    # Encode inputs
    if r.workPurpose not in encoders["work_purpose"]:
        return {"error": f"Unknown workPurpose: {r.workPurpose}"}

    x = np.array([[float(r.budget), float(encoders["work_purpose"][r.workPurpose])]], dtype=np.float32)

    result = {}
    for name, sess in sessions.items():
        input_name = sess.get_inputs()[0].name
        pred = sess.run(None, {input_name: x})[0]
        # pred can be shape (1,) or (1,1) depending on export
        pred_id = int(np.array(pred).reshape(-1)[0])
        result[name] = rev[name].get(pred_id, pred_id)

    return {"recommendation": result}