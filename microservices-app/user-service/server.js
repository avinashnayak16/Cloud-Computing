
// user-service/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

app.use(cors());
app.use(express.json());

// Mock user database
let users = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01' },
  { id: 2, username: 'john_doe', email: 'john@example.com', role: 'user', createdAt: '2024-01-02' },
  { id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'user', createdAt: '2024-01-03' }
];

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Call auth service to validate token
    const response = await axios.post(`${AUTH_SERVICE_URL}/validate`, { token });
    req.user = response.data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    service: 'user-service', 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Get all users
app.get('/users', verifyToken, (req, res) => {
  res.json({
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    })),
    total: users.length
  });
});

// Get user by ID
app.get('/users/:id', verifyToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user });
});

// Create new user
app.post('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { username, email, role } = req.body;
  const newUser = {
    id: users.length + 1,
    username,
    email,
    role: role || 'user',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  users.push(newUser);
  res.status(201).json({ message: 'User created successfully', user: newUser });
});

// Update user
app.put('/users/:id', verifyToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Only admin can update other users, users can update themselves
  if (req.user.role !== 'admin' && req.user.userId !== userId) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  const { username, email, role } = req.body;
  users[userIndex] = { ...users[userIndex], username, email, role };
  
  res.json({ message: 'User updated successfully', user: users[userIndex] });
});

// Delete user
app.delete('/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`👥 User Service running on port ${PORT}`);
});
