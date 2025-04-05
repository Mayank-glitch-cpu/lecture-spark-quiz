import express from 'express';
import cors from 'cors';
import * as cryptoJS from 'crypto-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Vite build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
}

// API endpoint to generate Zoom meeting signature
app.post('/api/zoom-signature', (req, res) => {
  // Get request body parameters
  const { meetingNumber, role } = req.body;

  // Verify required parameters are present
  if (!meetingNumber) {
    return res.status(400).json({ error: 'Meeting number is required' });
  }

  try {
    // Get Zoom API Key and API Secret from environment variables
    const apiKey = process.env.ZOOM_SDK_KEY;
    const apiSecret = process.env.ZOOM_SDK_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Zoom API credentials not configured' });
    }

    // Generate signature
    const timestamp = new Date().getTime() - 30000; // Subtract 30 seconds to avoid time sync issues
    const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64');
    const hash = cryptoJS.HmacSHA256(msg, apiSecret);
    const signature = Buffer.from(hash.toString(cryptoJS.enc.Hex)).toString('base64');

    // Return the signature
    return res.json({
      signature: signature,
      apiKey: apiKey,
      meetingNumber: meetingNumber,
      role: role
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
});

// Simplified catch-all route to avoid path-to-regexp issues
app.get('/', (req, res) => {
  res.json({ message: 'API server running. Frontend is served by Vite dev server.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API endpoint available at: http://localhost:${PORT}/api/zoom-signature`);
});