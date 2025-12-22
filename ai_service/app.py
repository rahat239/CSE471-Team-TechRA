from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import json
import os
import numpy as np
import onnxruntime as ort

app = FastAPI()

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "models")

# ---------- Load encoders ----------
enc_path = os.path.join(MODEL_DIR, "encoders.json")
if not os.path.exists(enc_path):
    raise RuntimeError(f"encoders.json not found at: {enc_path}")

with open(enc_path, "r") as f:
    encoders = json.load(f)

# Reverse maps (id -> label)
rev = {col: {int(v): k for k, v in mapping.items()} for col, mapping in encoders.items()}

# ---------- Load ONNX sessions ----------
outputs = ["CPU", "GPU", "RAM", "Storage", "recommended_pc", "recommended_brand"]
sessions = {}

for name in outputs:
    model_path = os.path.join(MODEL_DIR, f"{name}_recommendation_model.onnx")
    if not os.path.exists(model_path):
        raise RuntimeError(f"ONNX model missing: {model_path}")
    sessions[name] = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])


# Accept BOTH workPurpose and work_purpose
class Req(BaseModel):
    budget: float | int | None = None
    workPurpose: str | None = Field(default=None, alias="work_purpose")

    class Config:
        populate_by_name = True  # allows workPurpose + alias


@app.get("/health")
def health():
    return {"ok": True, "models_loaded": list(sessions.keys())}


@app.post("/predict")
def predict(r: Req):
    # ---- Validate inputs (correctly) ----
    if r.budget is None or r.workPurpose is None:
        raise HTTPException(status_code=400, detail="Missing required fields: budget and workPurpose/work_purpose")

    work = r.workPurpose.strip()
    if work not in encoders.get("work_purpose", {}):
        raise HTTPException(status_code=400, detail=f"Unknown workPurpose: {work}")

    x = np.array([[float(r.budget), float(encoders["work_purpose"][work])]], dtype=np.float32)

    result = {}
    for name, sess in sessions.items():
        try:
            input_name = sess.get_inputs()[0].name
            pred = sess.run(None, {input_name: x})[0]
            pred_id = int(np.array(pred).reshape(-1)[0])
            result[name] = rev.get(name, {}).get(pred_id, pred_id)
        except Exception as e:
            # Show which model failed
            raise HTTPException(status_code=500, detail=f"Error generating prediction for {name}: {str(e)}")

    return {"recommendation": result}