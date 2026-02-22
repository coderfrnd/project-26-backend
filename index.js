const express = require("express");
const db = require("./db/init");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors({
  // origin: "http://localhost:5173"
  origin:"https://project-26-frontend.vercel.app/"
}))
require("./scrapper/testbook");
require("./scrapper/exambee");
require("./scrapper/selection-way");
// base check
app.get("/", (req, res) => {
  res.send("Backend running");
});

// 👇 CONNECT ROUTES HERE
const freeTestsRoutes = require("./routes/free-test");
app.use("/api", freeTestsRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});