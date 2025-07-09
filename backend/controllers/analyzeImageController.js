const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

module.exports = (req, res) => {
  const base64Data = req.body.image?.replace(/^data:image\/jpeg;base64,/, "");
  const mode = req.body.mode || "desk";

  if (!base64Data) {
    return res.status(400).json({ error: "No image provided" });
  }

  const filePath = `uploads/webcam_${Date.now()}.jpg`;

  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) return res.status(500).json({ error: "Failed to save image" });

    exec(`python analyze_pose.py ${filePath} ${mode}`, (err, stdout, stderr) => {

  try {
    const result = JSON.parse(stdout);
    res.json(result);
  } catch (e) {
    console.error("Failed to parse output:", stdout);
    console.error("Parse error:", e.message);
    return res.status(500).json({
      error: 'Invalid analysis output',
      raw: stdout.substring(0, 500),
      stderr: stderr,
    });
  }

  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting image file:", err);
    });
  }, 5 * 60 * 1000);
});

  });
};
