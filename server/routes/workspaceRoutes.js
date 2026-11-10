
const express = require('express');
const Workspace = require('../models/Workspace');
const authenticateUser = require('../middleware/authMiddleware');
const {
    getFirebaseUserByEmail,
} = require('../collaboration/auth');

const router = express.Router();

// Create a workspace

router.post('/', authenticateUser, async (req, res) => {
    try {
        const {
            name,
            description = '',
            tech = ['HTML', 'CSS', 'JavaScript'],
            status = 'Personal',
            icon = '◈',
            template = 'HTML',
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Workspace name is required.',
            });
        }

        const validTemplates = ['HTML', 'React', 'Full Stack'];

        if (!validTemplates.includes(template)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid workspace template.',
            });
        }

        const existingWorkspace = await Workspace.findOne({
            ownerId: req.user.uid,
            name: name.trim(),
        });

        if (existingWorkspace) {
            return res.status(409).json({
                success: false,
                message: 'A workspace with this name already exists.',
            });
        }

        const workspace = await Workspace.create({
            name: name.trim(),
            description,
            tech,
            status,
            icon,
            template,
            ownerId: req.user.uid,
            members: [
                {
                    userId: req.user.uid,
                    email: req.user.email,
                    role: 'Admin',
                },
            ],
        });

        res.status(201).json({
            success: true,
            workspace,
        });
    } catch (error) {
        console.error('Create workspace error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create workspace.',
        });
    }
});


// Get all workspaces accessible to the logged-in user
router.get('/', authenticateUser, async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            'members.userId': req.user.uid,
        }).sort({ updatedAt: -1 });

        res.json({
            success: true,
            workspaces,
        });
    } catch (error) {
        console.error('Workspace fetching error:', error);

        res.status(500).json({
            success: false,
            message: 'Could not fetch workspaces.',
        });
    }
});





// Invite a registered Firebase user to a workspace
router.post('/:workspaceId/members', authenticateUser, async (req, res) => {
    try {
        const { email, role = 'Editor' } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required.',
            });
        }

        if (!['Editor', 'Viewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be Editor or Viewer.',
            });
        }

        // Find workspace and verify ownership
        const workspace = await Workspace.findOne({
            _id: req.params.workspaceId,
            ownerId: req.user.uid,
        });

        if (!workspace) {
            return res.status(403).json({
                success: false,
                message: 'Only the workspace owner can invite members.',
            });
        }

        // Find registered Firebase user
        const invitedUser = await getFirebaseUserByEmail(email);

        // Prevent inviting the owner
        if (invitedUser.uid === req.user.uid) {
            return res.status(400).json({
                success: false,
                message: 'You are already the workspace owner.',
            });
        }

        // Prevent duplicate membership
        const alreadyMember = workspace.members.some(
            member => member.userId === invitedUser.uid
        );

        if (alreadyMember) {
            return res.status(409).json({
                success: false,
                message: 'This user is already a workspace member.',
            });
        }

        workspace.members.push({
            userId: invitedUser.uid,
            email: invitedUser.email || email,
            role,
        });

        await workspace.save();

        res.status(200).json({
            success: true,
            message: 'Workspace member added successfully.',
            member: {
                email: invitedUser.email,
                role,
            },
        });

    } catch (error) {
        console.error('Workspace invitation error:', error);

        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({
                success: false,
                message: 'No registered user found with this email.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Could not invite workspace member.',
        });
    }
});


// Get a particular workspace
router.get('/:workspaceId', authenticateUser, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.workspaceId,
            'members.userId': req.user.uid,
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found or access denied.',
            });
        }

        res.json({
            success: true,
            workspace,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Could not fetch workspace.',
        });
    }
});


// Delete a workspace (owner only)
router.delete('/:workspaceId', authenticateUser, async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.workspaceId,
            ownerId: req.user.uid,
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found or you are not authorized to delete it.',
            });
        }

        await Workspace.deleteOne({
            _id: workspace._id,
        });

        return res.status(200).json({
            success: true,
            message: 'Workspace deleted successfully.',
        });

    } catch (error) {
        console.error('Workspace deletion error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not delete workspace.',
        });
    }
});


module.exports = router;
