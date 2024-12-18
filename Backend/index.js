const express = require('express');
const { PinataSDK } = require('pinata-web3');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const routes = require('./routes');
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc')

const swaggerUi =require('swagger-ui-express')
const YAML = require('yamljs');


const swaggerDocument = YAML.load('./swagger.yaml');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes
app.use(cors());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`NFT Marketplace API server running on http://localhost:${PORT}`);
});
