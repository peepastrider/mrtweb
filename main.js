const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');

const app = express();
const port = 4500;

// Database connection
const db = new sqlite3.Database('database.db', (err) =>{
    if (err) {
        console.error('Error connecting to the database.');
    }
    else{
        console.log('Opened connection to the database.');
    }
});

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

app.get('/api/cars', (req, res) => {
    const query = 'SELECT * FROM Car';

    db.all(query, (err, rows) =>{
        if (err) {
            console.error(err.message);
            res.status(500).json('Internal Server Error');
            return;
        }
        res.json(rows);
    });
});

// Start server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});


