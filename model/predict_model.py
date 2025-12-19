import sys
import pandas as pd
import joblib
import re
from sklearn.preprocessing import LabelEncoder

# Load the model
model = joblib.load('model/ai_pc_suggestion_model.pkl')

# Load the label encoder (if saved separately)
label_encoder = joblib.load('model/label_encoder.pkl')  # Make sure you save this during training

# Function to extract numeric values from RAM and Storage columns
def extract_numeric(value):
    return int(re.sub(r'\D', '', value))

# Command-line arguments: Expecting budget, workPurpose, cpu, ram, gpu, storage, brand
budget = int(sys.argv[1])
workPurpose = sys.argv[2]
cpu = sys.argv[3]
ram = sys.argv[4]
gpu = sys.argv[5]
storage = sys.argv[6]
brand = sys.argv[7]

# Prepare the input data in the same format as during training
data_dict = {
    'Budget (BDT)': budget,
    'Work Purpose': label_encoder.transform([workPurpose])[0],
    'CPU': label_encoder.transform([cpu])[0],
    'RAM': extract_numeric(ram),
    'GPU': label_encoder.transform([gpu])[0],
    'Storage': extract_numeric(storage),
    'Brand': label_encoder.transform([brand])[0]
}

# Convert the input data into a dataframe
input_df = pd.DataFrame([data_dict])

# Make prediction
prediction = model.predict(input_df)

# Print the result (which will be captured in Node.js)
print(prediction[0])
