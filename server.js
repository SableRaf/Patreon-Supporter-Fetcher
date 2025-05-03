const express = require('express');
const path = require('path');
const config = require('./config/config');

const app = express();
const PORT = config.port;

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Serve static files from the "website" directory at root
app.use(express.static(path.join(__dirname, 'app')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
