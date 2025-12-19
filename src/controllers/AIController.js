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
    console.error(" Failed to load encoders:", err.message);
}

// --- Load ONNX models ---
let sessionPC, sessionBrand, sessionCPU, sessionGPU, sessionRAM, sessionStorage;
(async () => {
    try {
        sessionPC = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/recommended_pc_recommendation_model.onnx"));
        sessionBrand = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/recommended_brand_recommendation_model.onnx"));
        sessionCPU = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/CPU_recommendation_model.onnx"));
        sessionGPU = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/GPU_recommendation_model.onnx"));
        sessionRAM = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/RAM_recommendation_model.onnx"));
        sessionStorage = await ort.InferenceSession.create(path.join(__dirname, "../../ml/models/Storage_recommendation_model.onnx"));

        console.log("All models loaded!");
    } catch (err) {
        console.error(" Failed to load AI models:", err.message);
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
    return {
        pc: Object.keys(encoders.recommended_pc).find(key => encoders.recommended_pc[key] === Number(resultPC.label.data[0])),
        brand: Object.keys(encoders.recommended_brand).find(key => encoders.recommended_brand[key] === Number(resultBrand.label.data[0])),
        CPU: Object.keys(encoders.CPU).find(key => encoders.CPU[key] === Number(resultCPU.label.data[0])),
        GPU: Object.keys(encoders.GPU).find(key => encoders.GPU[key] === Number(resultGPU.label.data[0])),
        RAM: Object.keys(encoders.RAM).find(key => encoders.RAM[key] === Number(resultRAM.label.data[0])),
        Storage: Object.keys(encoders.Storage).find(key => encoders.Storage[key] === Number(resultStorage.label.data[0])),
        price
    };
}

// --- Controller ---
const getRecommendation = async (req, res) => {
    if (!sessionPC || !sessionBrand) {
        return res.status(500).json({ error: "Models not loaded yet!" });
    }

    try {
        const { budget, work_purpose } = req.body;

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