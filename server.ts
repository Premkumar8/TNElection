import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "survey.db"));

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    gender TEXT NOT NULL,
    ageCategory TEXT NOT NULL,
    district TEXT NOT NULL,
    lastVoted TEXT NOT NULL,
    thisTimeVote TEXT NOT NULL,
    whoWillWin TEXT NOT NULL,
    mlaWork TEXT NOT NULL,
    expectedChanges TEXT NOT NULL,
    additionalNotes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/survey", (req, res) => {
    try {
      const {
        name,
        area,
        gender,
        ageCategory,
        district,
        lastVoted,
        thisTimeVote,
        whoWillWin,
        mlaWork,
        expectedChanges,
        additionalNotes,
      } = req.body;

      // Basic validation
      if (!name || !area || !gender || !ageCategory || !district) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const stmt = db.prepare(`
        INSERT INTO surveys (
          name, area, gender, ageCategory, district, lastVoted, thisTimeVote, whoWillWin, mlaWork, expectedChanges, additionalNotes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        name,
        area,
        gender,
        ageCategory,
        district,
        lastVoted,
        thisTimeVote,
        whoWillWin,
        mlaWork,
        expectedChanges,
        additionalNotes
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      console.error("Error saving survey:", error);
      res.status(500).json({ error: "Failed to save survey" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    // Simple hardcoded admin credentials
    if (email === "admin@example.com" && password === "admin123") {
      res.json({ success: true, token: "admin-token-123" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/reports", (req, res) => {
    try {
      const totalSurveys = db.prepare("SELECT COUNT(*) as count FROM surveys").get() as { count: number };
      
      const byGender = db.prepare("SELECT gender as name, COUNT(*) as value FROM surveys GROUP BY gender").all();
      const byAge = db.prepare("SELECT ageCategory as name, COUNT(*) as value FROM surveys GROUP BY ageCategory").all();
      const byDistrict = db.prepare("SELECT district as name, COUNT(*) as value FROM surveys GROUP BY district").all();
      const byParty = db.prepare("SELECT thisTimeVote as name, COUNT(*) as value FROM surveys GROUP BY thisTimeVote").all();
      const winPrediction = db.prepare("SELECT whoWillWin as name, COUNT(*) as value FROM surveys GROUP BY whoWillWin").all();

      res.json({
        totalSurveys: totalSurveys.count,
        byGender,
        byAge,
        byDistrict,
        byParty,
        winPrediction
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
