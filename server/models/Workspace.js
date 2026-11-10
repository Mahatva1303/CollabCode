
const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: '',
        },

        tech: {
            type: [String],
            default: ['HTML', 'CSS', 'JavaScript'],
        },

        status: {
            type: String,
            default: 'Personal',
        },

        icon: {
            type: String,
            default: '◈',
        },

        template: {
            type: String,
            enum: ['HTML', 'React', 'Full Stack'],
            default: 'HTML',
        },

        ownerId: {
            type: String,
            required: true,
            index: true,
        },

        members: [
            {
                userId: {
                    type: String,
                    required: true,
                },

                email: {
                    type: String,
                    default: '',
                },

                role: {
                    type: String,
                    enum: ['Admin', 'Editor', 'Viewer'],
                    default: 'Editor',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
