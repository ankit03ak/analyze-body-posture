const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

module.exports = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video file uploaded" });
  }

  const filePath = req.file.path;
  const mode = req.body.mode || "desk";

  const pythonScript = path.resolve(__dirname, "../analyze_pose.py");


  const process = spawn("python", [pythonScript, filePath, mode]);

  let output = "";
  let errorOutput = "";

  process.stdout.on("data", (data) => {
    output += data.toString();
  });

  process.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  process.on("close", (code) => {
  fs.unlink(filePath, () => {});



  if (errorOutput) {
    console.log("⚠️ Python stderr:", errorOutput);
  }

  if (code !== 0) {
    return res.status(500).json({
      error: "Python script failed",
      detail: errorOutput || "Unknown error",
      code: code
    });
  }

  try {
    const parsed = JSON.parse(output);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err.message);
    console.error("⚠️ Raw output:", output);
    res.status(500).json({
      error: "Invalid JSON output from Python script",
      raw: output.substring(0, 500)
    });
  }
});


  process.on("error", (err) => {
    console.error("❌ Process error:", err);
    fs.unlink(filePath, () => {});
    res.status(500).json({
      error: "Failed to start Python process",
      detail: err.message
    });
  });
};
