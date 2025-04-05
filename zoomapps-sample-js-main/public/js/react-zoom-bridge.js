/**
 * Bridge script to integrate Zoom SDK with the React application
 */
(function() {
  // Wait for both Zoom SDK and React app to load
  window.addEventListener('load', async () => {
    try {
      // Initialize Zoom App SDK
      const { ZoomSdk } = window;
      
      // Configure the SDK
      const configResponse = await fetch('/api/zoom/config');
      const config = await configResponse.json();
      
      // Initialize the client
      const client = await ZoomSdk.createClient(config.sdkKey, config.signature, config.userId);
      
      // Get user information
      const userResponse = await fetch('/api/zoom/user');
      const userData = await userResponse.json();
      
      // Store user data for the React app
      window.zoomUserData = userData;
      
      // Dispatch event for React app to pick up
      const zoomInitEvent = new CustomEvent('zoomInitialized', { 
        detail: { 
          isZoom: true,
          userData: userData
        } 
      });
      window.dispatchEvent(zoomInitEvent);
      
      console.log('Zoom SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Zoom SDK:', error);
    }
  });
})();