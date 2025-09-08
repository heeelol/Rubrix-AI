require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');
const app = express();
const { createServer } = require('node:http');
const { neon } = require('@neondatabase/serverless');
const { analyzeText, generateHomework } = require('./services/analysis');
const analysisRoutes = require('./routes/analysis');
const port = 3000;

// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL);

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/analysis', analysisRoutes);

// Test the database connection
const testConnection = async () => {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('Connected to Neon database:', result[0].now);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

testConnection();

// Create tables if they don't exist
const initializeTables = async () => {
    try {
        // Create users table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Users table created or already exists');

        // Create results table
        await sql`
            CREATE TABLE IF NOT EXISTS results (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                text TEXT,
                weaknesses JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Results table created or already exists');

        // Create user_scores table
        await sql`
            CREATE TABLE IF NOT EXISTS user_scores (
                id SERIAL PRIMARY KEY,
                grammar_score INTEGER,
                vocabulary_score INTEGER,
                writing_score INTEGER,
                spelling_score INTEGER,
                punctuation_score INTEGER,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('User scores table created or already exists');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
};

// Initialize database
initializeTables();

// Register endpoint
app.post('/api/register', async (req, res) => {
    console.log('Register request body:', req.body);
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
        const existingUsers = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const [user] = await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name}, ${email}, ${hashedPassword})
            RETURNING id, name, email, created_at
        `;

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
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

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

// Configure multer for file uploads
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and images (PNG, JPEG) are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// Upload + OCR route
app.post("/upload", upload.single("file"), (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Add appropriate file extension based on mimetype
    const fileExt = req.file.mimetype === 'application/pdf' ? '.pdf' : 
                   req.file.mimetype === 'image/png' ? '.png' : '.jpg';
    const newPath = filePath + fileExt;
    
    try {
        // Rename file to include extension
        fs.renameSync(filePath, newPath);
    } catch (e) {
        console.error('Failed to rename file:', e);
        return res.status(500).json({ error: 'Failed to process uploaded file' });
    }
    

    // Call Python script for OCR and analysis
    const path = require("path");
    const python = spawn("python", [path.join(__dirname, "ocr.py"), newPath]);

    let data = "";
    python.stdout.on("data", (chunk) => {
        data += chunk.toString();
    });

    python.stderr.on("data", (err) => {
        console.error("Python error:", err.toString());
    });

    python.on("close", async (code) => {
        try {
            // Check if Python script exited with an error
            if (code !== 0) {
                throw new Error("OCR process failed");
            }

            // Try to parse the Python output
            const result = JSON.parse(data);

            // Check if Python returned an error
            if (result.error) {
                throw new Error(result.error);
            }

            // Validate OCR output
            if (!result.text || result.text.trim().length === 0) {
                throw new Error("No text was extracted from the document");
            }
            
            // Call LLM analysis service
            const analysisResult = await analyzeText(result.text);
            
            // Extract scores from the response and convert to integers (use default values if undefined)
            const scores = {
                grammar: Math.round((parseFloat(analysisResult.scores?.Grammar) || 0) * 20), // Convert 1-5 scale to 0-100
                vocabulary: Math.round((parseFloat(analysisResult.scores?.Vocabulary) || 0) * 20),
                writing: Math.round((parseFloat(analysisResult.scores?.Writing) || 0) * 20),
                spelling: Math.round((parseFloat(analysisResult.scores?.Spelling) || 0) * 20),
                punctuation: Math.round((parseFloat(analysisResult.scores?.Punctuation) || 0) * 20)
            };
            
            // Generate homework based on weaknesses
            const homework = await generateHomework(scores);
            
            // Ensure homework has a default structure if undefined
            const safeHomework = {
                exercises: homework?.exercises || [{
                    type: 'General',
                    question: 'Practice the areas highlighted in the feedback',
                    explanation: 'Focus on improving your writing based on the analysis',
                    answer: 'N/A',
                    difficulty: 'Medium'
                }]
            };
            
            // Combine results
            const finalResult = {
                text: result.text,
                analysis: {
                    scores: scores,
                    feedback: analysisResult.feedback || 'Analysis complete'
                },
                homework: safeHomework
            };

            // Save into PostgreSQL
            await sql`
                INSERT INTO results (filename, text, weaknesses)
                VALUES (${req.file.originalname}, ${result.text}, ${JSON.stringify(analysisResult.scores)})
            `;

            // Update user scores with parsed scores
            await sql`
                INSERT INTO user_scores (
                    grammar_score, 
                    vocabulary_score, 
                    writing_score, 
                    spelling_score, 
                    punctuation_score
                )
                VALUES (
                    ${scores.grammar},
                    ${scores.vocabulary},
                    ${scores.writing},
                    ${scores.spelling},
                    ${scores.punctuation}
                )
            `;

            // Format homework exercises
            const exercises = safeHomework.exercises || [];
            const formattedHomework = exercises.map((exercise, index) => ({
                id: Date.now() + index, // unique id
                subject: 'English',
                topic: exercise.type || 'General',
                difficulty: exercise.difficulty || 'Medium',
                questions: 1,
                estimatedTime: '5-10 min',
                dueDate: 'Today',
                priority: index === 0 ? 'high' : 'medium',
                description: exercise.question || 'Practice exercise',
                explanation: exercise.explanation || 'Focus on improving your skills',
                answer: exercise.answer || 'N/A'
            }));

            // Send back all the analysis data
            res.json({
                message: 'Analysis completed successfully',
                analysis: {
                    text: result.text,
                    scores: analysisResult.scores,
                    feedback: analysisResult.feedback,
                },
                homework: {
                    exercises: formattedHomework
                }
            });
        } catch (e) {
            console.error("OCR/Analysis error:", e);
            // Clean up the temporary file
            try {
                if (req.file) {
                    fs.existsSync(newPath) && fs.unlinkSync(newPath);
                    fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
                }
            } catch (cleanupError) {
                console.error("Failed to clean up temporary file:", cleanupError);
            }
            // Send appropriate error message
            res.status(500).json({ 
                error: e.message || "Failed to process document",
                details: process.env.NODE_ENV === 'development' ? e.stack : undefined
            });
        }
    });
});

// Example route (updated)
app.get('/', async (req, res) => {
    try {
        const [result] = await sql`SELECT NOW()`;
        res.send(`Database time: ${result.now}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error querying the database');
    }
});

// Get user scores endpoint
app.get('/api/user/scores', async (req, res) => {
    try {
        const scores = await sql`
            SELECT grammar_score, vocabulary_score, writing_score, spelling_score, punctuation_score
            FROM user_scores
            ORDER BY updated_at DESC
            LIMIT 1
        `;

        if (scores.length === 0) {
            return res.json([
                { subject: 'Grammar', score: 0 },
                { subject: 'Vocabulary', score: 0 },
                { subject: 'Writing', score: 0 },
                { subject: 'Spelling', score: 0 },
                { subject: 'Punctuation', score: 0 }
            ]);
        }

        const formattedScores = [
            { subject: 'Grammar', score: scores[0].grammar_score },
            { subject: 'Vocabulary', score: scores[0].vocabulary_score },
            { subject: 'Writing', score: scores[0].writing_score },
            { subject: 'Spelling', score: scores[0].spelling_score },
            { subject: 'Punctuation', score: scores[0].punctuation_score }
        ];

        res.json(formattedScores);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching user scores' });
    }
});

// Debug endpoint to view users (remove in production)
app.get('/api/users', async (req, res) => {
    try {
        const users = await sql`SELECT id, name, email, created_at FROM users`;
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error querying users');
    }
});

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});