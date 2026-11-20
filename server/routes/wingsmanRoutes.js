
const express = require('express');
const mongoose = require('mongoose');

const Workspace = require('../models/Workspace');
const authenticateUser = require('../middleware/authMiddleware');
const { generateWithGroq, generateInlineCompletion } = require('../services/wingsmanService');

const router = express.Router();

router.post('/chat', authenticateUser, async (req, res) => {
    try {
        const {
            workspaceId,
            messages,
            workspaceContext = '',
            activeFile = '',
            selectedCode = '',
        } = req.body;

        if (!workspaceId || !mongoose.isValidObjectId(workspaceId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid workspace ID is required.',
            });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'A conversation message is required.',
            });
        }

        if (messages.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'Too many conversation messages.',
            });
        }

        const validMessages = messages.every(
            (message) =>
                ['user', 'assistant'].includes(message.role) &&
                typeof message.content === 'string' &&
                message.content.trim().length > 0 &&
                message.content.length <= 10000
        );

        if (!validMessages || messages[messages.length - 1].role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation messages.',
            });
        }

        if (
            typeof workspaceContext !== 'string' ||
            workspaceContext.length > 60000 ||
            typeof activeFile !== 'string' ||
            typeof selectedCode !== 'string' ||
            selectedCode.length > 10000
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or oversized workspace context.',
            });
        }

        // Verify that the logged-in user belongs to this workspace.
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            'members.userId': req.user.uid,
        }).select('_id name');

        if (!workspace) {
            return res.status(403).json({
                success: false,
                message: 'Workspace not found or access denied.',
            });
        }

        const context = `
Workspace: ${workspace.name}
Active file: ${activeFile || 'Not specified'}

Workspace files:
${workspaceContext || 'No workspace files provided.'}

Selected code:
${selectedCode || 'No code selected.'}
`;

        const aiResponse = await generateWithGroq({
    messages: messages.map(({ role, content }) => ({
        role,
        content,
    })),
    workspaceContext: context,
});


console.log('Wingsman raw AI response:', aiResponse);

let parsedResponse;

try {
    const cleanedResponse = aiResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

    parsedResponse = JSON.parse(cleanedResponse);
} catch (error) {
    console.error('Invalid Wingsman JSON response:', error);

    return res.status(502).json({
        success: false,
        message: 'Wingsman returned an invalid response. Please try again.',
    });
}

// Normal chat response
if (
    parsedResponse.type === 'chat' &&
    typeof parsedResponse.message === 'string'
) {
    return res.json({
        success: true,
        type: 'chat',
        reply: parsedResponse.message,
        provider: 'groq',
    });
}

// Code-edit proposal
if (
    parsedResponse.type === 'code_edit' &&
    typeof parsedResponse.message === 'string' &&
    typeof parsedResponse.filePath === 'string' &&
    typeof parsedResponse.code === 'string'
) {
    return res.json({
        success: true,
        type: 'code_edit',
        reply: parsedResponse.message,
        edit: {
            filePath: parsedResponse.filePath,
            code: parsedResponse.code,
        },
        provider: 'groq',
    });
}

return res.status(502).json({
    success: false,
    message: 'Wingsman returned an unsupported response format.',
});

    } catch (error) {
        console.error('Wingsman chat error:', error);

        return res.status(500).json({
            success: false,
            message: 'Wingsman could not generate a response.',
        });
    }
});

// Ghost Writing: Generate inline code completion
router.post('/complete', authenticateUser, async (req, res) => {
    try {
        const {
            workspaceId,
            filePath,
            cursorContext,
            workspaceContext = '',
        } = req.body;

        if (!workspaceId || !mongoose.isValidObjectId(workspaceId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid workspace ID is required.',
            });
        }

        if (
            typeof filePath !== 'string' ||
            !filePath.trim() ||
            filePath.length > 500 ||
            typeof cursorContext !== 'string' ||
            cursorContext.length > 15000 ||
            typeof workspaceContext !== 'string' ||
            workspaceContext.length > 20000
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or oversized completion context.',
            });
        }

        // Verify workspace membership.
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            'members.userId': req.user.uid,
        }).select('_id name');

        if (!workspace) {
            return res.status(403).json({
                success: false,
                message: 'Workspace not found or access denied.',
            });
        }

        const suggestion = await generateInlineCompletion({
            cursorContext,
            filePath,
            workspaceContext: `
Workspace: ${workspace.name}
${workspaceContext}
            `,
        });

        return res.json({
            success: true,
            suggestion,
            provider: 'groq',
        });

    } catch (error) {
        console.error('Wingsman inline completion error:', error);

        return res.status(500).json({
            success: false,
            message: 'Wingsman could not generate a completion.',
        });
    }
});

module.exports = router;
