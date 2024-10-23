

// Proxy for Infura IPFS API
app.post('/ipfs/add', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path; // Path to the uploaded file

  // fs.createReadStream(filePath)

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT
  });
});