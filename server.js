const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Google Drive setup
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function getDriveService() {
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: SCOPES,
    });
    const drive = google.drive({ version: 'v3', auth });
    return drive;
}

// Read captions from file
async function getCaptions() {
    try {
        const data = await fs.readFile('captions.txt', 'utf8');
        return data.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
        console.error('Error reading captions:', error);
        return ['Default caption if file not found'];
    }
}

// Get random image from Google Drive folder
async function getRandomImage(folderId) {
    try {
        const drive = await getDriveService();
        
        // List files in the folder
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, webViewLink, thumbnailLink)',
        });

        const files = response.data.files;
        if (files.length === 0) {
            throw new Error('No images found in the folder');
        }

        // Pick random image
        const randomImage = files[Math.floor(Math.random() * files.length)];
        
        // Get direct download link
        const downloadLink = `https://drive.google.com/uc?export=download&id=${randomImage.id}`;
        
        // Get thumbnail/preview link
        const previewLink = `https://drive.google.com/thumbnail?id=${randomImage.id}&sz=w1000`;

        return {
            id: randomImage.id,
            name: randomImage.name,
            downloadLink: downloadLink,
            previewLink: previewLink,
            viewLink: randomImage.webViewLink
        };
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}

// API endpoint to get random image and caption
app.get('/api/random-content', async (req, res) => {
    try {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            return res.status(500).json({ error: 'Folder ID not configured' });
        }

        const [captions, image] = await Promise.all([
            getCaptions(),
            getRandomImage(folderId)
        ]);

        // Select random caption
        const randomCaption = captions[Math.floor(Math.random() * captions.length)];

        res.json({
            image: image,
            caption: randomCaption,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
