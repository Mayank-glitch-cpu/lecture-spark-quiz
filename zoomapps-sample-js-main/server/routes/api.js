import express from 'express';
const router = express.Router();

/**
 * API endpoint to provide Zoom SDK configuration
 */
router.get('/zoom/config', (req, res) => {
  // In a real implementation, these values would come from your environment or auth flow
  res.json({
    sdkKey: process.env.ZOOM_SDK_KEY || 'your-sdk-key',
    signature: process.env.ZOOM_SDK_SIGNATURE || 'your-signature',
    userId: req.session?.user?.id || 'anonymous'
  });
});

/**
 * API endpoint to determine user role and provide user information
 */
router.get('/zoom/user', (req, res) => {
  // Get user information from the session
  const zoomUser = req.session?.user;
  
  let role = 'student'; // Default role is student
  
  // In a real implementation, you would determine the role based on
  // the user's Zoom role or other authentication data
  if (zoomUser?.role === 'host' || zoomUser?.role === 'co-host') {
    role = 'professor';
  }
  
  // If no session data, use mock data for development
  const userData = zoomUser ? {
    id: zoomUser.id,
    name: zoomUser.name || zoomUser.display_name || 'Unknown User',
    role: role,
    email: zoomUser.email || 'unknown@example.com',
  } : {
    id: 'dev-user',
    name: 'Development User',
    role: req.query.role || role, // Allow overriding role via query param for testing
    email: 'dev@example.com',
  };
  
  res.json(userData);
});

export default router;