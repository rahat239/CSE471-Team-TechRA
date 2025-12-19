const path = require("path");
const fs = require("fs");
const ort = require("onnxruntime-node");

// --- Load encoders ---
let encoders;
try {
    const encodersPath = path.join(__dirname, "../../ml/models/encoders.json");
    encoders = JSON.parse(fs.readFileSync(encodersPath, "utf8"));
    console.log("Encoders loaded!");
} catch (err) {
    console.error("Failed to load encoders:", err.message);
}

// --- Load ONNX models ---
let sessionPC, sessionBrand, sessionCPU, sessionGPU, sessionRAM, sessionStorage;
(async () => {
    try {
        console.log("Loading models...");
        sessionPC = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/recommended_pc_recommendation_model.onnx"));
        sessionBrand = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/recommended_brand_recommendation_model.onnx"));
        sessionCPU = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/CPU_recommendation_model.onnx"));
        sessionGPU = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/GPU_recommendation_model.onnx"));
        sessionRAM = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/RAM_recommendation_model.onnx"));
        sessionStorage = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/Storage_recommendation_model.onnx"));

        console.log("All models loaded!");
    } catch (err) {
        console.error("Failed to load AI models:", err.message);
    }
})();

// --- Encode input ---
function encodeInput(input) {
    const { budget, work_purpose } = input;
    const safeEncode = (encoder, value) => (!encoder || value == null ? 0 : encoder[value] ?? 0);
    return [budget || 0, safeEncode(encoders.work_purpose, work_purpose)];
}

// --- Helper to create a PC object ---
function buildPCObject(resultPC, resultBrand, resultCPU, resultGPU, resultRAM, resultStorage, price) {
    // Helper function to safely get the label data
    const getLabel = (result, encoder) => {
        if (!result || !result.label || !result.label.data || result.label.data.length === 0) {
            console.error("Invalid result data:", result);
            return "Unknown";  // Return a default value if data is invalid
        }
        const value = Number(result.label.data[0]);
        return Object.keys(encoder).find(key => encoder[key] === value) || "Unknown";
    };

    return {
        pc: getLabel(resultPC, encoders.recommended_pc),
        brand: getLabel(resultBrand, encoders.recommended_brand),
        CPU: getLabel(resultCPU, encoders.CPU),
        GPU: getLabel(resultGPU, encoders.GPU),
        RAM: getLabel(resultRAM, encoders.RAM),
        Storage: getLabel(resultStorage, encoders.Storage),
        price
    };
}

// --- Controller ---
const getRecommendation = async (req, res) => {
    if (!sessionPC || !sessionBrand || !sessionCPU || !sessionGPU || !sessionRAM || !sessionStorage) {
        return res.status(500).json({ error: "Models not loaded yet!" });
    }

    try {
        const { budget, work_purpose } = req.body;

        // Validate input data
        if (!budget || !work_purpose) {
            return res.status(400).json({ error: "Missing required fields: 'budget' and 'work_purpose'" });
        }

        // --- Function to predict a PC for a given budget ---
        const predictPC = async (b) => {
            const inputArray = encodeInput({ budget: b, work_purpose });
            const tensor = new ort.Tensor("float32", Float32Array.from(inputArray), [1, inputArray.length]);
            const feeds = { input: tensor };

            const [rPC, rBrand, rCPU, rGPU, rRAM, rStorage] = await Promise.all([
                sessionPC.run(feeds),
                sessionBrand.run(feeds),
                sessionCPU.run(feeds),
                sessionGPU.run(feeds),
                sessionRAM.run(feeds),
                sessionStorage.run(feeds),
            ]);

            return buildPCObject(rPC, rBrand, rCPU, rGPU, rRAM, rStorage, b);
        };

        // --- Get top pick ---
        const topPick = await predictPC(budget);

        // --- Similar budget PCs within ±5k ---
        const similarBudget = [];
        for (let diff = -5000; diff <= 5000; diff += 1000) {
            const newBudget = budget + diff;
            if (newBudget > 0 && newBudget !== budget) {
                const pc = await predictPC(newBudget);
                // Only add if specs are different
                if (!similarBudget.some(p => JSON.stringify(p) === JSON.stringify(pc))) {
                    similarBudget.push(pc);
                }
            }
        }

        // --- Higher budget PCs (show only 3–5 better spec options) ---
        const higherBudget = [];
        for (let inc of [10000, 20000, 30000, 40000, 50000]) {
            const pc = await predictPC(budget + inc);
            // Only add if specs differ from top pick and existing similarBudget
            if (!higherBudget.some(p => JSON.stringify(p) === JSON.stringify(pc)) &&
                !similarBudget.some(p => JSON.stringify(p) === JSON.stringify(pc)) &&
                JSON.stringify(topPick) !== JSON.stringify(pc)) {
                higherBudget.push(pc);
            }
        }

        return res.json({
            top_pick: topPick,
            similar_budget: similarBudget,
            higher_budget: higherBudget
        });
    } catch (err) {
        console.error("Prediction error:", err);
        return res.status(500).json({ error: "Failed to get recommendation" });
    }
};

module.exports = { getRecommendation };