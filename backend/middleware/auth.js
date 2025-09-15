const { createClerkClient } = require('@clerk/clerk-sdk-node');

// Initialize Clerk client with secret key only
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'No session token provided',
      });
    }

    // Verify the session token using Clerk's built-in verification
    const verifiedToken = await clerk.verifyToken(sessionToken);

    if (!verifiedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token',
      });
    }

    // Add user information to request object
    req.auth = {
      userId: verifiedToken.sub,
      sessionId: verifiedToken.sid,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = {
  requireAuth,
};
