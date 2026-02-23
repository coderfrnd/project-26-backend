const express = require("express");
const db = require("./db/init");
const cors = require("cors");
const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-26-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
require("./scrapper/testbook");
require("./scrapper/exambee");
require("./scrapper/selection-way");
require("./scrapper/IIT-JEE/unacdemy");
require("./scrapper/IIT-JEE/hardcode-scrap");
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