const express = require('express');
const path = require('path');
const config = require('./config/config');

const app = express();
const PORT = config.port;
const DATA_DIR = config.dataDir;

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'app')));

app.use('/list', express.static(path.join(__dirname, 'app', 'views', 'tierList')));
    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
