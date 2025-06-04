const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    // Check for existing user
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.send("User registered!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send("Invalid credentials");
    }

    res.send("Login successful!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

