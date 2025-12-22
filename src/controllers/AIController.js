const path = require("path");
const fs = require("fs");
const ort = require("onnxruntime-node");

// ---------- Load encoders ----------
let encoders = null;
try {
    const encodersPath = path.join(__dirname, "../../ml/models/encoders.json");
    encoders = JSON.parse(fs.readFileSync(encodersPath, "utf8"));
    console.log("Encoders loaded:", Object.keys(encoders));
} catch (err) {
    console.error("Failed to load encoders:", err);
}

// ---------- Load ONNX models ----------
const modelPaths = {
    recommended_pc: "recommended_pc_recommendation_model.onnx",
    recommended_brand: "recommended_brand_recommendation_model.onnx",
    CPU: "CPU_recommendation_model.onnx",
    GPU: "GPU_recommendation_model.onnx",
    RAM: "RAM_recommendation_model.onnx",
    Storage: "Storage_recommendation_model.onnx",
};

const sessions = {};
let modelsReady = false;

(async () => {
    try {
        console.log("Loading ONNX models...");
        for (const [key, file] of Object.entries(modelPaths)) {
            const p = path.join(__dirname, "../../ml/models", file);
            if (!fs.existsSync(p)) {
                throw new Error(`Model file missing: ${p}`);
            }
            sessions[key] = await ort.InferenceSession.create(p);
            console.log(`Loaded: ${key} (${file})`);
        }
        modelsReady = true;
        console.log("All models loaded!");
    } catch (err) {
        console.error("Failed to load AI models:", err);
        modelsReady = false;
    }
})();

// ---------- Helpers ----------
function encodeInput({ budget, work_purpose }) {
    if (!encoders) throw new Error("Encoders not loaded");

    const b = Number(budget);
    if (!Number.isFinite(b)) throw new Error("budget must be a number");

    const wpMap = encoders.work_purpose || {};
    const wp = work_purpose != null ? String(work_purpose) : "";
    const wpId = wpMap[wp];

    if (wpId === undefined) {
        throw new Error(`Unknown work_purpose: ${wp}`);
    }

    return [b, Number(wpId)];
}

// onnxruntime-node: session.run() returns object {outputName: Tensor, ...}
// Don’t assume result.label exists.
function getPredId(runOutput) {
    if (!runOutput || typeof runOutput !== "object") {
        throw new Error("Invalid run output");
    }
    const firstKey = Object.keys(runOutput)[0];
    if (!firstKey) throw new Error("No outputs returned by model");

    const tensor = runOutput[firstKey];
    if (!tensor || !tensor.data || tensor.data.length === 0) {
        throw new Error(`Empty tensor output (key=${firstKey})`);
    }
    return Number(tensor.data[0]);
}

function decodeLabel(encoderMap, id) {
    if (!encoderMap) return "Unknown";
    const found = Object.keys(encoderMap).find((k) => Number(encoderMap[k]) === Number(id));
    return found || "Unknown";
}

function buildPCObject(preds, price) {
    return {
        pc: decodeLabel(encoders.recommended_pc, preds.recommended_pc),
        brand: decodeLabel(encoders.recommended_brand, preds.recommended_brand),
        CPU: decodeLabel(encoders.CPU, preds.CPU),
        GPU: decodeLabel(encoders.GPU, preds.GPU),
        RAM: decodeLabel(encoders.RAM, preds.RAM),
        Storage: decodeLabel(encoders.Storage, preds.Storage),
        price,
    };
}

// ---------- Controller ----------
const getRecommendation = async (req, res) => {
    try {
        if (!modelsReady) {
            return res.status(503).json({ error: "Models not loaded yet (server starting)!" });
        }
        if (!encoders) {
            return res.status(500).json({ error: "Encoders not loaded" });
        }

        const { budget, work_purpose } = req.body;

        if (budget === undefined || work_purpose === undefined) {
            return res.status(400).json({ error: "Missing required fields: budget, work_purpose" });
        }

        const predictPC = async (b) => {
            const inputArray = encodeInput({ budget: b, work_purpose });

            // Use the real input name from the model (don’t hardcode "input")
            const inputName = sessions.CPU.inputNames[0]; // all your models share same input schema
            const tensor = new ort.Tensor("float32", Float32Array.from(inputArray), [1, inputArray.length]);
            const feeds = { [inputName]: tensor };

            const out = {};
            for (const key of Object.keys(modelPaths)) {
                const runOutput = await sessions[key].run(feeds);
                out[key] = getPredId(runOutput);
            }
            return buildPCObject(out, b);
        };

        const b0 = Number(budget);
        const topPick = await predictPC(b0);

        const similar_budget = [];
        for (let diff = -5000; diff <= 5000; diff += 1000) {
            const newBudget = b0 + diff;
            if (newBudget > 0 && newBudget !== b0) {
                const pc = await predictPC(newBudget);
                if (!similar_budget.some((p) => JSON.stringify(p) === JSON.stringify(pc))) {
                    similar_budget.push(pc);
                }
            }
        }

        const higher_budget = [];
        for (const inc of [10000, 20000, 30000, 40000, 50000]) {
            const pc = await predictPC(b0 + inc);
            if (
                JSON.stringify(pc) !== JSON.stringify(topPick) &&
                !similar_budget.some((p) => JSON.stringify(p) === JSON.stringify(pc)) &&
                !higher_budget.some((p) => JSON.stringify(p) === JSON.stringify(pc))
            ) {
                higher_budget.push(pc);
            }
        }

        return res.json({ top_pick: topPick, similar_budget, higher_budget });
    } catch (err) {
        console.error("Prediction error:", err);
        return res.status(500).json({
            error: "Failed to get recommendation",
            details: err.message, // helpful on Render logs
        });
    }
};

module.exports = { getRecommendation };