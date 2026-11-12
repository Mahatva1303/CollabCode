
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const workspaceRoutes = require('./routes/workspaceRoutes');
const codingActivityRoutes = require('./routes/codingActivityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.CLIENT_URL
    ].filter(Boolean)
}));

app.use(express.json());

// Workspace API routes
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/coding-activity', codingActivityRoutes);

// Health check API
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'CollabCode backend is running!'
    });
});

// Start Express API server only
async function startServers() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express backend
        app.listen(PORT, () => {
            console.log(
                `CollabCode backend running on port ${PORT}`
            );
        });

    } catch (error) {
        console.error('Failed to start CollabCode backend:', error);
        process.exit(1);
    }
}

startServers();
