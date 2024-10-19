// server.js
import express from 'express';
import { PinataSDK } from "pinata-web3";
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Initialize multer with the storage option

// Proxy for Infura IPFS API
app.post('/ipfs/add', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

    const filePath = req.file.path; // Path to the uploaded file

    // fs.createReadStream(filePath)

  // Prepare the request to Infura
  const client = create({
    host: 'ipfs.infura.io:5001/api/v0',
    method: 'POST',
    protocol: 'https',
    headers: {
        Authorization: 'Basic ' + "YWQyMTMwZDE3N2U2NGMwNGIxMmRhNWE3YjJjNjRiYzk6cjVZS0pSQytNY3UzUHdQTThNSUl2Yk12Q1RsR0RDbHE2WnJiVURpck5NdFpQSGdkWnZxY0N3"
    },
  });

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT
  });

  client.add(fs.readFileSync(filePath), {
    progress: (prog) => res.json(JSON.parse(prog))
  })
});

// Start the server
app.listen(PORT, () => {
  console.log(`File Upload server running on http://localhost:${PORT}`);
});
