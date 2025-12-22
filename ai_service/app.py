from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import json
import os
import numpy as np
import onnxruntime as ort

app = FastAPI()

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "models")

OUTPUTS = ["CPU", "GPU", "RAM", "Storage", "recommended_pc", "recommended_brand"]

encoders = None
rev = None
sessions = {}


class Req(BaseModel):
    budget: float = Field(..., gt=0)
    # ✅ Accept Node's field name: work_purpose
    work_purpose: str = Field(..., alias="workPurpose")

    class Config:
        populate_by_name = True  # allow both "workPurpose" and "work_purpose"


@app.on_event("startup")
def load_everything():
    global encoders, rev, sessions

    enc_path = os.path.join(MODEL_DIR, "encoders.json")
    if not os.path.exists(enc_path):
        raise RuntimeError(f"encoders.json not found at: {enc_path}")

    with open(enc_path, "r") as f:
        encoders = json.load(f)

    # reverse maps: id -> label
    rev = {col: {int(v): k for k, v in mapping.items()} for col, mapping in encoders.items()}

    # load ONNX sessions
    for name in OUTPUTS:
        model_path = os.path.join(MODEL_DIR, f"{name}_recommendation_model.onnx")
        if not os.path.exists(model_path):
            raise RuntimeError(f"Model not found for {name}: {model_path}")

        sessions[name] = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])

    print("✅ Encoders + ONNX models loaded successfully")


@app.get("/health")
def health():
    return {
        "ok": True,
        "models_loaded": all(k in sessions for k in OUTPUTS),
        "model_dir": MODEL_DIR,
    }


@app.post("/predict")
def predict(r: Req):
    if encoders is None or rev is None or not sessions:
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    wp = (r.work_purpose or "").strip()

    if "work_purpose" not in encoders:
        raise HTTPException(status_code=500, detail="encoders.json missing key: work_purpose")

    if wp not in encoders["work_purpose"]:
        raise HTTPException(status_code=400, detail=f"Unknown work_purpose: {wp}")

    x = np.array([[float(r.budget), float(encoders["work_purpose"][wp])]], dtype=np.float32)

    result = {}
    for name, sess in sessions.items():
        try:
            input_name = sess.get_inputs()[0].name
            pred = sess.run(None, {input_name: x})[0]
            pred_id = int(np.array(pred).reshape(-1)[0])
            result[name] = rev[name].get(pred_id, pred_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating prediction for {name}: {str(e)}"
            )

    return {"recommendation": result}