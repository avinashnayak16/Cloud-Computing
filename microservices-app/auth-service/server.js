// auth-service/server.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Mock user database
const users = [
  { id: 1, username: 'admin', password: '$2b$10$8K1p/a0dRaYqfg5gvGJqyOWIQcbZY9v5/XxGFQnGrU6Lf3fRhAa6C', role: 'admin' }, // password: admin123
  { id: 2, username: 'user', password: '$2b$10$8K1p/a0dRaYqfg5gvGJqyOWIQcbZY9v5/XxGFQnGrU6Lf3fRhAa6C', role: 'user' }    // password: admin123
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    service: 'auth-service', 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token validation endpoint
app.post('/validate', (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
});