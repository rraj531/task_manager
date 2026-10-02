const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const db = require('./db/db'); // Initialize DB connection

// Initialize the Express app
const app = express();

const cors = require('cors');
app.use(cors());

// Middleware to parse JSON data from requests
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Import and use routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Supports /api/register, /api/login, /api/send-otp directly

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Events route (for notifications / system events)
app.get('/api/events', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Events endpoint operational',
        events: []
    });
});

// Health check route for cloud hosting (Render, Railway, Uptime monitors)
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString() 
    });
});

// Another route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// ─── Protected Route (JWT middleware ka test) ─────────────────────────────────
const verifyToken = require('./middleware/authMiddleware');

// Yeh route sirf wahi access kar sakta hai jiske paas valid JWT token hai
app.get('/api/profile', verifyToken, (req, res) => {
    // req.user middleware ne set kiya tha (decoded JWT data)
    res.json({
        message: 'You accessed a PROTECTED route!',
        loggedInUser: req.user
    });
});

// Database check route (for browser)
app.get('/api/db-check', (req, res) => {
    // Hum MySQL se pooch rahe hain ki uske paas kaunsi tables hain
    db.query('SHOW TABLES', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database issue', details: err.message });
        }
        res.json({ 
            status: 'Success!',
            message: 'MySQL is perfectly connected!', 
            tables: results 
        });
    });
});

// Catch-all route: Return index.html for all non-API GET requests (SPA friendly)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server (listen when running directly or on traditional cloud platforms)
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server...');
        server.close(() => {
            console.log('HTTP server closed.');
        });
    });
}

// Export app for Vercel serverless deployments
module.exports = app;


