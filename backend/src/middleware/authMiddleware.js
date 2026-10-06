const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase Authentication ID Token
 * Expects header: Authorization: Bearer <firebase-id-token>
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. No authorization token provided in Bearer format.'
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Token missing after Bearer keyword.'
    });
  }

  try {
    // Verify token using Firebase Admin Auth
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification failed:', error.message);
    
    // In development mode, if user is testing with mock Postman token "mock-token-<uid>"
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock-token-')) {
      const mockUid = token.replace('mock-token-', '') || 'test-user-123';
      console.log(`[AuthMiddleware] Development mode: Accepting mock token for user: ${mockUid}`);
      req.user = {
        uid: mockUid,
        email: `${mockUid}@campus.edu`,
        name: 'Test Student'
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired Firebase ID token.',
      error: error.message
    });
  }
};

module.exports = { verifyToken };
