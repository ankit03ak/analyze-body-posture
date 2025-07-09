const fs = require("fs");

module.exports = function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.error("❌ File deletion failed:", err);
  });
};
