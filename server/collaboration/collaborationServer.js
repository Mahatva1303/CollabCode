
const { Server } = require('@hocuspocus/server');

const { verifyFirebaseToken } = require('./auth');
const Workspace = require('../models/Workspace');

const collaborationServer = new Server({
    port: process.env.PORT || 1234,

    // Verify Firebase identity and workspace membership
    async onAuthenticate({ token, documentName }) {
        // Verify Firebase token
        const decodedToken = await verifyFirebaseToken(token);

        // Extract MongoDB workspace ID from document name
        const match = documentName.match(
            /^workspace-([a-f\d]{24})-file-/
        );

        if (!match) {
            throw new Error('Invalid workspace document name.');
        }

        const workspaceId = match[1];

        // Check whether the user belongs to this workspace
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            'members.userId': decodedToken.uid,
        });

        if (!workspace) {
            throw new Error('You do not have access to this workspace.');
        }

        // Find user's workspace role
        const member = workspace.members.find(
            item => item.userId === decodedToken.uid
        );

        console.log(
            `Authenticated ${decodedToken.email} as ${member.role}`
        );

        return {
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email || null,
                role: member.role,
                workspaceId,
            },
        };
    },

    async onConnect({ documentName }) {
        console.log(`User connected to workspace: ${documentName}`);
    },

    async onChange({ documentName }) {
        console.log(`Workspace updated: ${documentName}`);
    },

    async onDisconnect({ documentName }) {
        console.log(`User disconnected from workspace: ${documentName}`);
    }
});

async function startCollaborationServer() {
    await collaborationServer.listen();

    console.log(
        `Collaboration server running on port ${process.env.PORT || 1234}`
    );
}

module.exports = {
    collaborationServer,
    startCollaborationServer,
};
