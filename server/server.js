
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { startCollaborationServer } = require('./collaboration/collaborationServer');
const workspaceRoutes = require('./routes/workspaceRoutes');
const codingActivityRoutes = require('./routes/codingActivityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173'
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

// Start both servers
async function startServers() {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Start Express backend
        app.listen(PORT, () => {
            console.log(
                `CollabCode backend running on http://localhost:${PORT}`
            );
        });

        // Start collaboration server
        await startCollaborationServer();

    } catch (error) {
        console.error('Failed to start CollabCode servers:', error);
        process.exit(1);
    }
}

startServers();
