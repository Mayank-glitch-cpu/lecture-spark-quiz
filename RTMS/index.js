// command to run : node index.js

const express = require('express');
const crypto = require('crypto');
const WebSocket = require('ws');
const axios = require('axios');
const { Console } = require('console');

const app = express();
const PORT = 3000;

app.use(express.json());

const ZOOM_SECRET_TOKEN = '6wqz6wMZRS6b0PFL6g7lUQ';
const CLIENT_ID = 'sJHQbEKHTbS80N152Hsruw';
const CLIENT_SECRET = 'ZSrl3pdHBmQ12RuEW7GoF7J0Yv2OwXVM';

// Global aggregated data map for messages
const aggregatedData = new Map();

app.get('/', (req, res) => {
    res.send('Hello, this is the home page!');
});

// Endpoint that returns a random number
app.post('/random', (req, res) => {
    // Generate a random number between 0 and 999
    const randomNumber = Math.floor(Math.random() * 1000);
    res.json({ randomNumber });
});
  
// Listen to the webhook
app.post('/webhook', (req, res) => {
    console.log('Incoming Webhook:', JSON.stringify(req.body, null, 2));
    const { event, payload } = req.body;

    if (event === 'endpoint.url_validation' && payload?.plainToken) {
        const hash = crypto.createHmac('sha256', ZOOM_SECRET_TOKEN)
            .update(payload.plainToken)
            .digest('hex');
        return res.json({ plainToken: payload.plainToken, encryptedToken: hash });
    }

    // Listen to the RTMS started event
    if (event === 'meeting.rtms_started') {
        const { meeting_uuid, rtms_stream_id, server_urls } = payload;
        connectToSignalingWebSocket(meeting_uuid, rtms_stream_id, server_urls);
    }

    if (event === 'meeting.rtms_stopped') {
        console.log('RTMS Stopped:', JSON.stringify(payload, null, 2));
        // For demonstration, print aggregated data as a table for each user:
        aggregatedData.forEach((value) => {
            console.log(`Messages for ${value.user_name} (User ID: ${value.user_id}):`);
            console.table(value.messages);
        });
    }

    res.sendStatus(200);
});

// Generate signature
function generateSignature(clientId, meetingUuid, streamId, secret) {
    const message = `${clientId},${meetingUuid},${streamId}`;
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

// Function to send data to Python endpoint
function sendToPython(transcriptMessage) {
  axios.post('http://localhost:5000/ingest', transcriptMessage)
    .then(() => console.log('📨 Sent to Python'))
    .catch(err => console.error('Error sending to Python:', err.message));
}

function connectToSignalingWebSocket(meetingUuid, streamId, serverUrl) {
    const ws = new WebSocket(serverUrl);

    ws.on('open', () => {
        const signature = generateSignature(CLIENT_ID, meetingUuid, streamId, CLIENT_SECRET);
        const handshake = {
            msg_type: 1,
            protocol_version: 1,
            meeting_uuid: meetingUuid,
            rtms_stream_id: streamId,
            sequence: Math.floor(Math.random() * 1e9),
            signature
        };
        ws.send(JSON.stringify(handshake));
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        console.log('Signaling Message:', JSON.stringify(msg, null, 2));

        if (msg.msg_type === 2 && msg.status_code === 0) {
            const mediaUrl = msg.media_server?.server_urls?.all;
            if (mediaUrl) {
                connectToMediaWebSocket(mediaUrl, meetingUuid, streamId, ws);
            }
        }

        if (msg.msg_type === 12) {
            const keepAliveResponse = {
                msg_type: 13,
                timestamp: msg.timestamp
            };
            console.log('Responding to Signaling KEEP_ALIVE_REQ:', keepAliveResponse);
            ws.send(JSON.stringify(keepAliveResponse));
        }
    });

    ws.on('error', (err) => {
        console.error('Signaling socket error:', err);
    });

    ws.on('close', () => {
        console.log('Signaling socket closed');
    });
}

function connectToMediaWebSocket(mediaUrl, meetingUuid, streamId, signalingSocket) {
    const mediaWs = new WebSocket(mediaUrl, { rejectUnauthorized: false });

    mediaWs.on('open', () => {
        const signature = generateSignature(CLIENT_ID, meetingUuid, streamId, CLIENT_SECRET);
        const handshake = {
            msg_type: 3,
            protocol_version: 1,
            meeting_uuid: meetingUuid,
            rtms_stream_id: streamId,
            signature,
            media_type: 8, // audio = 1 , video = 2 , transcript = 8 , all = 32 
            payload_encryption: false
        };
        mediaWs.send(JSON.stringify(handshake));
    });

    mediaWs.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log('Media JSON Message:', JSON.stringify(msg, null, 2));

            // If the message is a transcript (msg_type 17), send it to Python
            if (msg.msg_type === 17) {
              sendToPython(msg);
            }

            if (msg.msg_type === 4 && msg.status_code === 0) {
                signalingSocket.send(JSON.stringify({
                    msg_type: 7,
                    rtms_stream_id: streamId
                }));
            }

            if (msg.msg_type === 12) {
                mediaWs.send(JSON.stringify({
                    msg_type: 13,
                    timestamp: msg.timestamp
                }));
            }
        } catch (err) {
            console.log(`Received audio packet (${data.length} bytes)`);
            console.log('Raw audio data (base64):', data.toString('base64'));
        }
    });

    mediaWs.on('error', (err) => {
        console.error('Media socket error:', err);
    });

    mediaWs.on('close', () => {
        console.log('Media socket closed');
    });
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
