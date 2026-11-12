require('dotenv').config();

const connectDB = require('./config/db');
const { startCollaborationServer } = require('./collaboration/collaborationServer');

async function start() {
    try {
        await connectDB();
        await startCollaborationServer();

        console.log('CollabCode collaboration service started successfully!');
    } catch (error) {
        console.error('Failed to start collaboration service:', error);
        process.exit(1);
    }
}

start();