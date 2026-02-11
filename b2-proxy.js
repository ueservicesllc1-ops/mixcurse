const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json({ limit: '5gb' })); // Increase limit for large file uploads
app.use(express.urlencoded({ limit: '5gb', extended: true })); // Add URL encoded support

// Serve static files from root directory (for production)
const path = require('path');
app.use(express.static(path.join(__dirname, '/')));

// B2 Configuration
const B2_KEY_ID = '005c2b526be0baa000000000f';
const B2_APPLICATION_KEY = 'K0051CrlFQOcyjlNZyFVI3spGLFhxk4';
const B2_BUCKET_ID = 'cc12bbd592366bde909b0a1a';
const B2_BUCKET_NAME = 'cc12bbd592366bde909b0a1a'; // Use bucket ID as name for now

// Cache for auth token
let authToken = null;
let apiUrl = null;
let bucketName = null;

// Get B2 auth token
async function getB2Auth() {
    try {
        const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(B2_KEY_ID + ':' + B2_APPLICATION_KEY).toString('base64')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Auth failed: ${response.status}`);
        }

        const data = await response.json();
        authToken = data.authorizationToken;
        apiUrl = data.apiUrl;

        return { authToken, apiUrl };
    } catch (error) {
        throw new Error(`B2 Auth error: ${error.message}`);
    }
}

// Get bucket name
async function getBucketName() {
    try {
        if (!authToken || !apiUrl) {
            await getB2Auth();
        }

        const response = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: 'c2b526be0baa'
            })
        });

        if (!response.ok) {
            throw new Error(`List buckets failed: ${response.status}`);
        }

        const data = await response.json();
        const bucket = data.buckets.find(b => b.bucketId === B2_BUCKET_ID);

        if (bucket) {
            bucketName = bucket.bucketName;
            console.log('📦 Bucket name found:', bucketName);
            return bucketName;
        } else {
            throw new Error('Bucket not found');
        }
    } catch (error) {
        throw new Error(`Bucket name error: ${error.message}`);
    }
}

// Get upload URL
async function getUploadUrl() {
    try {
        if (!authToken || !apiUrl) {
            await getB2Auth();
        }

        const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bucketId: B2_BUCKET_ID
            })
        });

        if (!response.ok) {
            throw new Error(`Upload URL failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Upload URL error: ${error.message}`);
    }
}

// Test B2 connection
app.get('/test', async (req, res) => {
    try {
        const auth = await getB2Auth();
        const uploadUrl = await getUploadUrl();

        res.json({
            success: true,
            message: 'B2 connection successful',
            auth: { apiUrl: auth.apiUrl },
            upload: { uploadUrl: uploadUrl.uploadUrl }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get upload URL endpoint
app.get('/upload-url', async (req, res) => {
    try {
        const uploadData = await getUploadUrl();
        res.json({
            success: true,
            data: uploadData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download file endpoint (proxy to avoid CORS issues)
app.get('/download', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter is required'
            });
        }

        console.log('📥 Download request received:');
        console.log('  - URL:', url);

        // Fetch the file from B2
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }

        // Get the file buffer
        const fileBuffer = await response.buffer();
        console.log('  - File size:', fileBuffer.length, 'bytes (', (fileBuffer.length / 1024 / 1024).toFixed(2), 'MB)');

        // Set appropriate headers
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const contentDisposition = response.headers.get('content-disposition') || 'attachment';

        res.set({
            'Content-Type': contentType,
            'Content-Length': fileBuffer.length,
            'Content-Disposition': contentDisposition,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Send the file
        res.send(fileBuffer);
        console.log('✅ File downloaded successfully');

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'B2 Proxy Server is running',
        timestamp: new Date().toISOString()
    });
});

// Upload file endpoint
app.post('/upload', async (req, res) => {
    try {
        const { fileName, fileData, contentType } = req.body;

        console.log('📁 Upload request received:');
        console.log('  - File name:', fileName);
        console.log('  - Content type:', contentType);
        console.log('  - Base64 data length:', fileData ? fileData.length : 'undefined');

        if (!fileName || !fileData) {
            return res.status(400).json({
                success: false,
                error: 'fileName and fileData are required'
            });
        }

        // Handle single file upload
        return await handleSingleUpload(req, res);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Handle single file upload (backward compatibility)
async function handleSingleUpload(req, res) {
    const { fileName, fileData, contentType } = req.body;

    // Get upload URL
    const uploadData = await getUploadUrl();

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');
    console.log('  - Buffer size:', fileBuffer.length, 'bytes (', (fileBuffer.length / 1024 / 1024).toFixed(2), 'MB)');

    // Sanitize filename for B2 (remove special characters)
    const sanitizedFileName = fileName.replace(/[^\w\-_\.]/g, '_');
    console.log('  - Sanitized filename:', sanitizedFileName);

    // Calculate SHA1
    const crypto = require('crypto');
    const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');
    console.log('  - SHA1 hash:', sha1);

    // Upload to B2
    const response = await fetch(uploadData.uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': uploadData.authorizationToken,
            'X-Bz-File-Name': sanitizedFileName,
            'X-Bz-Content-Type': contentType || 'application/octet-stream',
            'X-Bz-Content-Sha1': sha1,
            'Content-Length': fileBuffer.length.toString(),
            'Content-Type': contentType || 'application/octet-stream'
        },
        body: fileBuffer
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('  - B2 upload response:', result);
    console.log('  - Uploaded file size from B2:', result.size || 'unknown');

    // Use the real bucket name "mixercur"
    const bucketNameForUrl = 'mixercur';

    // Construct the correct B2 download URL using the real bucket name
    const downloadUrl = `https://f005.backblazeb2.com/file/${bucketNameForUrl}/${sanitizedFileName}`;
    console.log('  - Constructed download URL:', downloadUrl);

    res.json({
        success: true,
        data: {
            ...result,
            downloadUrl: downloadUrl,
            fileName: sanitizedFileName,
            originalFileName: fileName
        }
    });
}


app.listen(PORT, () => {
    console.log(`🚀 B2 Proxy Server running on http://localhost:${PORT}`);
    console.log(`📁 Ready to handle B2 uploads!`);
});
