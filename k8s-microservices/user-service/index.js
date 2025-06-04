const express = require('express');
const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET');
        return res.status(200).json({});
    }
    next();
});

app.get('/users', (req, res) => {
    res.json({ users: [{ id: 1, name: 'User1' }, { id: 2, name: 'User2' }] });
});

app.listen(3000, () => console.log('User service running on port 3000'));