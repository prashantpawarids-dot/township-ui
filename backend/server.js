// filepath: backend/server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const landownerPath = req.query.photoPath; // Retrieve the landowner from the query parameters
            const newLandOwnerId = req.query.newLandOwnerId;
            const uploadPath = path.join(__dirname, landownerPath, newLandOwnerId);

            // Log the paths for debugging
            console.log('Landowner Path:', landownerPath);
            console.log('New Land Owner ID:', newLandOwnerId);
            console.log('Upload Path:', uploadPath);

            // Create the folder if it doesn't exist
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
                console.log('Directory created:', uploadPath);
            } else {
                console.log('Directory already exists:', uploadPath);
            }

            cb(null, uploadPath);
        } catch (error) {
            console.error('Error in destination callback:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            const filename = `${req.query.newLandOwnerId}.jpg`;
            console.log('Generated Filename:', filename);
            cb(null, filename); // Save the file with the newLandOwnerId as the name
        } catch (error) {
            console.error('Error in filename callback:', error);
            cb(error);
        }
    },
});

const upload = multer({ storage });

// Endpoint to handle photo upload
app.post('/upload-photo', upload.single('file'), (req, res) => {
    try {
        // debugger
        const photoPath = req.query.photoPath; // Retrieve the photoPath from the query parameters
        console.log('Photo Path:', photoPath); // Log the photoPath for debugging

        res.status(200).json({ message: 'Photo uploaded successfully' });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Error uploading photo' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
