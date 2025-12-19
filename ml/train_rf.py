import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
import json
import os
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
DATA_PATH = "data/pc_dataset.csv"
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# --- Load dataset ---
df = pd.read_csv(DATA_PATH)

# --- Features & targets ---
X = df[["budget", "work_purpose"]]  # only user inputs
y = df[["CPU", "GPU", "RAM", "Storage", "recommended_pc", "recommended_brand"]]

# --- Encode categorical features ---
encoders = {}

for col in X.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = {v: int(le.transform([v])[0]) for v in le.classes_}

# --- Encode targets ---
for target_col in y.columns:
    le = LabelEncoder()
    y[target_col] = le.fit_transform(y[target_col])
    encoders[target_col] = {v: int(le.transform([v])[0]) for v in le.classes_}

# --- Train multi-output classifier ---
model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
model.fit(X, y)

# --- Save encoders ---
with open(os.path.join(MODEL_DIR, "encoders.json"), "w") as f:
    json.dump(encoders, f, default=convert_numpy, indent=4)
print("Encoders saved!")

# --- Export each output to ONNX ---
initial_type = [("input", FloatTensorType([None, X.shape[1]]))]  # now shape = 2
for i, target_col in enumerate(y.columns):
    onnx_model = convert_sklearn(
        model.estimators_[i],
        initial_types=initial_type,
        options={id(model.estimators_[i]): {'zipmap': False}}
    )
    model_file = os.path.join(MODEL_DIR, f"{target_col}_recommendation_model.onnx")
    with open(model_file, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"{target_col} ONNX model saved!")

print("Training complete!")