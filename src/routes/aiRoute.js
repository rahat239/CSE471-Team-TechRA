const express = require("express");
const router = express.Router();
const { getRecommendation } = require("../controllers/AIController");

// POST /api/v1/ai/predict
router.post("/predict", getRecommendation);

module.exports = router;