const express = require('express');
const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, GET');
        return res.status(200).json({});
    }
    next();
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        res.json({ message: `Hello, ${username}` });
    } else {
        res.status(400).json({ error: 'Missing username or password' });
    }
});

app.listen(3000, () => console.log('Auth service running on port 3000'));