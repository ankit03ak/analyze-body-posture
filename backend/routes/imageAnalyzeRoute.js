const express = require("express");
const router = express.Router();
const analyzeImageController = require("../controllers/analyzeImageController");

router.post("/", analyzeImageController);

module.exports = router;
