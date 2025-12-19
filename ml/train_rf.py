import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
import json
import os
import joblib
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# --- Helper for JSON ---
def convert_numpy(o):
    if isinstance(o, (np.int64, np.int32, np.int16, np.int8)):
        return int(o)
    if isinstance(o, (np.float64, np.float32)):
        return float(o)
    return o

# --- Paths ---
BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "models")  # Updated path to point to ai_service/models
os.makedirs(MODEL_DIR, exist_ok=True)

# Debugging: Print paths
print(f"MODEL_DIR: {MODEL_DIR}")
DATA_PATH = "data/pc_dataset.csv"  # Ensure this path is correct or update if necessary
print(f"DATA_PATH: {DATA_PATH}")

# --- Load dataset ---
try:
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded dataset with {len(df)} rows.")
except Exception as e:
    print(f"Error loading dataset: {e}")
    raise

# --- Features & targets ---
X = df[["budget", "work_purpose"]]  # only User inputs
y = df[["CPU", "GPU", "RAM", "Storage", "recommended_pc", "recommended_brand"]]

# --- Encode categorical Features ---
encoders = {}

print("Encoding features...")
for col in X.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = {v: int(le.transform([v])[0]) for v in le.classes_}

# --- Encode targets ---
for target_col in y.columns:
    le = LabelEncoder()
    y[target_col] = le.fit_transform(y[target_col])
    encoders[target_col] = {v: int(le.transform([v])[0]) for v in le.classes_}

print(f"Encoders: {encoders}")

# --- Train multi-output classifier ---
print("Training the models...")
model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
model.fit(X, y)

# --- Save the trained models using joblib ---
try:
    model_path = os.path.join(MODEL_DIR, "ai_pc_suggestion_model.pkl")
    print(f"Saving models to {model_path}...")
    joblib.dump(model, model_path)
    print("Model saved successfully!")
except Exception as e:
    print(f"Error saving models: {e}")
    raise

# --- Save the label encoder using joblib ---
try:
    label_encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
    print(f"Saving label encoder to {label_encoder_path}...")
    joblib.dump(encoders, label_encoder_path)
    print("Label encoder saved successfully!")
except Exception as e:
    print(f"Error saving label encoder: {e}")
    raise

# --- Save the encoders to JSON file ---
encoder_json_path = os.path.join(MODEL_DIR, "encoders.json")
print(f"Saving encoders to: {encoder_json_path}")
try:
    with open(encoder_json_path, "w") as f:
        json.dump(encoders, f, default=convert_numpy, indent=4)
    print(f"Encoders successfully saved to {encoder_json_path}")
except Exception as e:
    print(f"Error saving encoders: {e}")
    raise

# --- Export each output to ONNX ---
initial_type = [("input", FloatTensorType([None, X.shape[1]]))]  # now shape = (None, X.shape[1])

for i, target_col in enumerate(y.columns):
    model_file = os.path.join(MODEL_DIR, f"{target_col}_recommendation_model.onnx")
    print(f"Saving ONNX models for {target_col} to {model_file}")

    try:
        # Convert each model to ONNX format
        onnx_model = convert_sklearn(
            model.estimators_[i],
            initial_types=initial_type  # Ensuring proper tuple formatting
        )
        with open(model_file, "wb") as f:
            f.write(onnx_model.SerializeToString())
        print(f"{target_col} ONNX model saved!")
    except Exception as e:
        print(f"Error saving ONNX models for {target_col}: {e}")