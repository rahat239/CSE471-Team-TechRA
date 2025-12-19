import json
import os

# Simulated encoder data (from your training script)
encoders = {
    'work_purpose': {'Gaming': 0, 'Office': 1},
    'cpu': {'Intel': 0, 'AMD': 1},
    'ram': {'8GB': 0, '16GB': 1},
    'gpu': {'NVIDIA': 0, 'AMD': 1},
    'storage': {'512GB': 0, '1TB': 1},
    'brand': {'BrandA': 0, 'BrandB': 1},
    'recommended_pc': {'PC1': 0, 'PC2': 1},
    'recommended_brand': {'BrandX': 0, 'BrandY': 1}
}

# Directory where encoders.json will be saved
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Path to save encoders.json
encoder_json_path = os.path.join(MODEL_DIR, "encoders.json")

# Debug: Check if the file path is correct
print(f"Saving encoders to: {encoder_json_path}")

# Try saving the encoders to a JSON file
try:
    with open(encoder_json_path, "w") as f:
        json.dump(encoders, f, indent=4)
    print(f"Encoders successfully saved to {encoder_json_path}")
except Exception as e:
    print(f"Error saving encoders: {str(e)}")