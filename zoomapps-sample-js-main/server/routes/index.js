import express from 'express';
import { handleError, sanitize } from '../helpers/routing.js';
import { contextHeader, getAppContext } from '../helpers/cipher.js';
import { getInstallURL } from '../helpers/zoom-api.js';
import session from '../session.js';

const router = express.Router();

/*
 * Home Page - Zoom App Launch handler
 * this route is used when a user navigates to the deep link
 */
function isContextExpired(context) {
    const currentTime = Date.now();
    return context.exp && context.exp < currentTime;
}

router.get('/', async (req, res, next) => {
    try {
        sanitize(req);
        const header = req.header(contextHeader);
        const context = header && getAppContext(header);
        
        // For development, assume we're always in Zoom if there's no context header
        const isDev = process.env.NODE_ENV === 'development';
        
        if (!context && !isDev) {
            return res.render('index', {
                isZoom: false,
                title: `Hello Browser`,
            });
        }
        
        // In development mode, don't validate context expiration
        if (context && isContextExpired(context) && !isDev) {
            return res.status(401).json({ error: 'Invalid or expired context' });
        }
        
        // Render our React app with Zoom context
        return res.render('index', {
            isZoom: true,
            title: `Lecture Spark Quiz`,
        });
    } catch (e) {
        next(handleError(e));
    }
});

/*
 * Install Route - Install the Zoom App from the Zoom Marketplace
 * this route is used when a user installs the app from the Zoom Client
 */
router.get('/install', session, async (req, res) => {
    const { url, state, verifier } = getInstallURL();
    req.session.state = state;
    req.session.verifier = verifier;
    res.redirect(url.href);
});

// Add a direct route to the React app for development
router.get('/react-app', (req, res) => {
    res.sendFile('index.html', { root: './public/react-app' });
});

export default router;
