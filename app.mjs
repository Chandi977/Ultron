import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // Ensure cors is imported

const app = express();
const port = 3000;

// Enable CORS
app.use(
  cors({
    origin: "*", // You can restrict this to specific origins if needed
    credentials: true,
  })
);

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files like CSS, JS, and images
app.use(express.static(path.join(__dirname, "public")));

// Set view engine and views directory
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

// Root route to render the index.ejs
app.get("/", (req, res) => {
  res.render("index"); // This will render views/index.ejs
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
