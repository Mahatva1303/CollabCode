
const express = require('express');
const mongoose = require('mongoose');

const CodingActivity = require('../models/CodingActivity');
const Workspace = require('../models/Workspace');
const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

// Record coding activity
router.post('/', authenticateUser, async (req, res) => {
    try {
        const {
            workspaceId,
            filePath = '',
            activityType,
            sessionId,
            date,
        } = req.body;

        if (
            !workspaceId ||
            !mongoose.Types.ObjectId.isValid(workspaceId) ||
            !sessionId ||
            !date ||
            !['code_edit', 'file_create', 'file_delete'].includes(activityType)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coding activity details.',
            });
        }

        // Verify workspace membership
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            'members.userId': req.user.uid,
        });

        if (!workspace) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this workspace.',
            });
        }

        // Viewers cannot record coding activity
        const member = workspace.members.find(
            item => item.userId === req.user.uid
        );

        if (!member || member.role === 'Viewer') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit this workspace.',
            });
        }

        // Avoid duplicate activity for the same session and type
        const existingActivity = await CodingActivity.findOne({
            userId: req.user.uid,
            workspaceId,
            sessionId,
            activityType,
        });

        if (existingActivity) {
            return res.status(200).json({
                success: true,
                message: 'Activity already recorded.',
                activity: existingActivity,
            });
        }

        const activity = await CodingActivity.create({
            userId: req.user.uid,
            workspaceId,
            filePath,
            activityType,
            sessionId,
            date,
        });

        return res.status(201).json({
            success: true,
            activity,
        });

    } catch (error) {
        console.error('Coding activity recording error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not record coding activity.',
        });
    }
});

// Get the logged-in user's coding activity
router.get('/', authenticateUser, async (req, res) => {
    try {
        const activities = await CodingActivity.find({
            userId: req.user.uid,
        })
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            activities,
        });

    } catch (error) {
        console.error('Coding activity fetching error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not fetch coding activity.',
        });
    }
});

module.exports = router;
