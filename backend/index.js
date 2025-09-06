const express = require('express');
const app = express();
const { createServer } = require('node:http');
const { Pool } = require('pg'); // Import PostgreSQL client
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres', 
    host: 'weakspot-agent.calq2guku09t.us-east-1.rds.amazonaws.com', 
    database: 'weakspotAgent', 
    password: '#TeamS1erra', 
    port: 5432, 
    ssl: {
        rejectUnauthorized: false, // Disable strict SSL validation
    },
    connectionTimeoutMillis: 30000, // Increase timeout to 30 seconds
     idleTimeoutMillis: 30000, // Set idle timeout to 30 seconds
});

// Test the database connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

// Example route
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); // Example query
        res.send(`Database time: ${result.rows[0].now}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error querying the database');
    }
});

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});