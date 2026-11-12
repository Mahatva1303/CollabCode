
const mongoose = require('mongoose');

const codingActivitySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },

        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },

        filePath: {
            type: String,
            default: '',
        },

        activityType: {
            type: String,
            enum: ['code_edit', 'file_create', 'file_delete'],
            required: true,
        },

        sessionId: {
            type: String,
            required: true,
        },

        date: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Efficiently retrieve a user's activity by date.
codingActivitySchema.index({
    userId: 1,
    date: 1,
});

module.exports = mongoose.model('CodingActivity', codingActivitySchema);
