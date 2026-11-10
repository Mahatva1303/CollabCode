
const { verifyFirebaseToken } = require('../collaboration/auth');

async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is required.',
            });
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = await verifyFirebaseToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token.',
        });
    }
}

module.exports = authenticateUser;
