import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

// Enable CORS for all origins (you can restrict this to specific origins in production)
app.use(
  cors({
    origin: "*", // Update this to your frontend URL in production
    credentials: true,
  })
);

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (CSS, JS, images) from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set up EJS as the view engine and set the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Wikipedia API Proxy route
app.get("/wiki", async (req, res) => {
  const searchTerm = req.query.search || "SMARTPHONE";
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(
    searchTerm
  )}`;

  try {
    const response = await axios.get(url);
    const page = Object.values(response.data.query.pages)[0];
    const extract = page.extract || "No extract found.";
    res.json({ extract });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from Wikipedia." });
  }
});

// Root route to render index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Global error handler to catch all unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
