// Require necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS SDK
const dynamodb = new aws.DynamoDB.DocumentClient();
const S3 = new aws.S3();

// Create an Express app
const app = express();
const port = 3001;

// Configure middleware
app.use(bodyParser.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route for uploading media files
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const key = `${uuidv4()}-${file.originalname}`;

  // Upload file to S3
  const params = {
    Bucket: 'mediasharingbucket9595',
    Key: key,
    Body: file.buffer
  };

  S3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload file' });
    } else {
      // Save metadata to DynamoDB
      const metadata = {
        fileId: uuidv4(),
        filename: file.originalname,
        key: key,
        url: data.Location
      };

      const dynamoParams = {
        TableName: 'mediatable9595',
        Item: metadata
      };

      dynamodb.put(dynamoParams, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to save metadata' });
        } else {
          res.json(metadata);
        }
      });
    }
  });
});

// Route for fetching media files and metadata
app.get('/media/:fileId', (req, res) => {
  const fileId = req.params.fileId;

  // Retrieve metadata from DynamoDB
  const dynamoParams = {
    TableName: 'mediatable9595',
    Key: {
      fileId: fileId
    }
  };

  dynamodb.get(dynamoParams, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve metadata' });
    } else {
      if (data.Item) {
        // Redirect to the S3 URL
        res.redirect(data.Item.url);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
