const path = require("path");
const fs = require("fs");
const ort = require("onnxruntime-node");

// --- Load encoders ---
let encoders = null;
try {
    const encodersPath = path.join(__dirname, "../../ml/models/encoders.json");
    encoders = JSON.parse(fs.readFileSync(encodersPath, "utf8"));
    console.log(" Encoders loaded:", encodersPath);
} catch (err) {
    console.error("Failed to load encoders:", err.message);
}

// --- Load ONNX models ---
let sessionPC, sessionBrand, sessionCPU, sessionGPU, sessionRAM, sessionStorage;

async function loadModels() {
    try {
        console.log("🔄 Loading ONNX models...");

        const base = path.join(__dirname, "../../ml/models");
        sessionPC = await ort.InferenceSession.create(path.join(base, "recommended_pc_recommendation_model.onnx"));
        sessionBrand = await ort.InferenceSession.create(path.join(base, "recommended_brand_recommendation_model.onnx"));
        sessionCPU = await ort.InferenceSession.create(path.join(base, "CPU_recommendation_model.onnx"));
        sessionGPU = await ort.InferenceSession.create(path.join(base, "GPU_recommendation_model.onnx"));
        sessionRAM = await ort.InferenceSession.create(path.join(base, "RAM_recommendation_model.onnx"));
        sessionStorage = await ort.InferenceSession.create(path.join(base, "Storage_recommendation_model.onnx"));

        console.log("✅ All models loaded!");
        console.log("PC inputNames:", sessionPC.inputNames, "outputNames:", sessionPC.outputNames);
    } catch (err) {
        console.error("❌ Failed to load AI models:", err);
    }
}
loadModels();

// --- helpers ---
function safeEncode(encoder, value) {
    if (!encoder || value == null) return 0;
    return encoder[value] ?? 0;
}

function encodeInput({ budget, work_purpose }) {
    // Make sure budget is numeric float32
    const b = Number(budget);
    const wp = safeEncode(encoders?.work_purpose, work_purpose);
    return [Number.isFinite(b) ? b : 0, wp];
}

/**
 * skl2onnx classifiers usually return:
 * { output_label: Tensor, output_probability: ... }
 * so we must NOT assume result.label exists.
 */
function extractPredictedId(runOutput) {
    if (!runOutput || typeof runOutput !== "object") return null;

    // Pick the first tensor-like output (often "output_label")
    const firstKey = Object.keys(runOutput)[0];
    const tensor = runOutput[firstKey];

    if (!tensor || !tensor.data || tensor.data.length === 0) return null;
    return Number(tensor.data[0]);
}

function decodeLabel(encoderMap, predId) {
    if (!encoderMap || predId == null) return "Unknown";
    // encoderMap is like { "Gaming PC": 0, "Workstation": 1 }
    return Object.keys(encoderMap).find((k) => Number(encoderMap[k]) === Number(predId)) || "Unknown";
}

function buildPCObject(rPC, rBrand, rCPU, rGPU, rRAM, rStorage, price) {
    const idPC = extractPredictedId(rPC);
    const idBrand = extractPredictedId(rBrand);
    const idCPU = extractPredictedId(rCPU);
    const idGPU = extractPredictedId(rGPU);
    const idRAM = extractPredictedId(rRAM);
    const idStorage = extractPredictedId(rStorage);

    return {
        pc: decodeLabel(encoders?.recommended_pc, idPC),
        brand: decodeLabel(encoders?.recommended_brand, idBrand),
        CPU: decodeLabel(encoders?.CPU, idCPU),
        GPU: decodeLabel(encoders?.GPU, idGPU),
        RAM: decodeLabel(encoders?.RAM, idRAM),
        Storage: decodeLabel(encoders?.Storage, idStorage),
        price,
    };
}

// --- Controller ---
const getRecommendation = async (req, res) => {
    try {
        // Validate that everything is loaded
        if (!encoders) return res.status(500).json({ error: "Encoders not loaded" });
        if (!sessionPC || !sessionBrand || !sessionCPU || !sessionGPU || !sessionRAM || !sessionStorage) {
            return res.status(500).json({ error: "Models not loaded yet!" });
        }

        let { budget, work_purpose } = req.body;

        // Validate request
        budget = Number(budget);
        if (!Number.isFinite(budget) || budget <= 0) {
            return res.status(400).json({ error: "Invalid 'budget' (must be a positive number)" });
        }
        if (!work_purpose) {
            return res.status(400).json({ error: "Missing required field: 'work_purpose'" });
        }
        if (!encoders.work_purpose || encoders.work_purpose[work_purpose] == null) {
            return res.status(400).json({
                error: `Unknown work_purpose: ${work_purpose}`,
                allowed: Object.keys(encoders.work_purpose || {}),
            });
        }

        // Use the real ONNX input name (DO NOT hardcode "input")
        const inputName = sessionPC.inputNames[0];

        const predictPC = async (b) => {
            const inputArray = encodeInput({ budget: b, work_purpose });
            const tensor = new ort.Tensor("float32", Float32Array.from(inputArray), [1, inputArray.length]);

            const feeds = { [inputName]: tensor };

            // Run all models
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

        const topPick = await predictPC(budget);

        // Similar budget
        const similarBudget = [];
        for (let diff = -5000; diff <= 5000; diff += 1000) {
            const newBudget = budget + diff;
            if (newBudget > 0 && newBudget !== budget) {
                const pc = await predictPC(newBudget);
                if (!similarBudget.some((p) => JSON.stringify(p) === JSON.stringify(pc))) {
                    similarBudget.push(pc);
                }
            }
        }

        // Higher budget options
        const higherBudget = [];
        for (const inc of [10000, 20000, 30000, 40000, 50000]) {
            const pc = await predictPC(budget + inc);
            if (
                !higherBudget.some((p) => JSON.stringify(p) === JSON.stringify(pc)) &&
                !similarBudget.some((p) => JSON.stringify(p) === JSON.stringify(pc)) &&
                JSON.stringify(topPick) !== JSON.stringify(pc)
            ) {
                higherBudget.push(pc);
            }
        }

        return res.json({ top_pick: topPick, similar_budget: similarBudget, higher_budget: higherBudget });
    } catch (err) {
        console.error(" Prediction error:", err);
        return res.status(500).json({
            error: "Failed to get recommendation",
            details: err?.message || String(err),
        });
    }
};

module.exports = { getRecommendation };