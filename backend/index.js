const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const app = express();
const { createServer } = require('node:http');
const { Pool } = require('pg');
const port = 3000;

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres', 
    host: 'weakspot-agent.calq2guku09t.us-east-1.rds.amazonaws.com', 
    database: 'weakspotAgent', 
    password: '#TeamS1erra', 
    port: 5432, 
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
});

// Test the database connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

// Create users table if it doesn't exist
const createUsersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await pool.query(query);
        console.log('Users table created or already exists');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

// Initialize database
createUsersTable();

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Validate input
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const upload = multer({ dest: "uploads/" });

// Upload + OCR route
app.post("/upload", upload.single("file"), (req, res) => {
    const filePath = req.file.path;

    // Call Python script (converted Jupyter notebook to ocr.py)
    const path = require("path");
    const python = spawn("python", [path.join(__dirname, "ocr.py"), filePath]);


    let data = "";
    python.stdout.on("data", (chunk) => {
        data += chunk.toString();
    });

    python.stderr.on("data", (err) => {
        console.error("Python error:", err.toString());
    });

    python.on("close", async () => {
        try {
            const result = JSON.parse(data); // JSON output from Python

           // Ensure weaknesses is always an array
            const weaknesses = Array.isArray(result.weaknesses)
                ? result.weaknesses
                : [];

            // Save into PostgreSQL
            await pool.query(
                `INSERT INTO results (filename, text, weaknesses) VALUES ($1, $2, $3)`,
                [req.file.originalname, result.text, weaknesses] // <-- pass array directly
            );

            res.json(result);
        } catch (e) {
            console.error("Parsing/DB error:", e);
            res.status(500).json({ error: "Failed to process OCR output" });
        }
    });
});

// Example route (updated)
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
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