const express = require("express");
const multer = require("multer");
const path = require("path");
const analyzeVideoController = require("../controllers/analyzeVideoController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `video_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } 
});

router.post("/", upload.single("video"), analyzeVideoController);

module.exports = router;
