const express = require("express");
const cors = require("cors"); // Add this import
const app = express();

app.use(cors()); // Add this middleware - same as your auth service
app.use(express.json()); // Good practice to add this too

app.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);
});

app.listen(5002, () => console.log("User service running on port 5002"));
