const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const imageAnalyzeRoute = require("./routes/imageAnalyzeRoute.js");
const videoAnalyzeRoute = require("./routes/videoAnalyzeRoute.js");



const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  //frontend will be added

];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use("/api/analyze-image", imageAnalyzeRoute);
app.use("/api/analyze-video", videoAnalyzeRoute);

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString()});
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
