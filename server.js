import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as view engine
app.set("view engine", "ejs");

// Sample route to render the page
app.get("/", (req, res) => {
  res.render("index", {
    title: "Chatbot UI",
    botName: "MyBot",
    botStatus: "Online",
    messages: [
      { sender: "User", text: "Hello" },
      { sender: "Bot", text: "Hi, how can I help you?" },
    ],
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
