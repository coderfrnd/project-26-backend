const express = require("express");
const db = require("./db/init");

const app = express();
app.use(express.json());
require("./scrapper/testbook");
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