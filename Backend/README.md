# Digital Collectible Exchange

The **Digital Collectible Exchange** is a Node.js Express-based API that facilitates seamless interactions with smart contracts for NFTs. It enables users to buy, sell, and create their own NFTs, manage wallets, check their CSDP token balance, and resell NFTs.

---

## Table of Contents
1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [API Documentation](#api-documentation)
5. [Testing](#testing)
6. [Contributing](#contributing)
7. [Team](#team)
8. [License](#license)

---

## Features
- **NFT Creation**: Users can mint their own NFTs.
- **NFT Transactions**: Users can buy, sell, and resell NFTs.
- **Wallet Management**: Users can access their wallet to view CSDP token balances.

---

## Prerequisites
Before setting up the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) (v6.x or later)
- [Postman](https://www.postman.com/) (for API testing)

---

## Installation
Follow these steps to set up the application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/digital-collectible-exchange.git

2. Navigate to the Project Directory
    ```bash
    cd Backend

3. Install dependencies:
    ```bash
   npm install

4. Create a .env file and add the necessary environment variables (e.g., API keys, database connection).
    
5. Need to have a MongoDB(either a docker image or local db) running and keep the DB connectin URL in the .env file so the index.js file can use it.


6. Start the application:
    ```bash
   npm run start

# API Documentation

Full API details are available in the Swagger:
[Swagger Documentation](https://app.swaggerhub.com/apis/2023SL93045/NftMarketplace/1.0.0) <br />
Can be accessed locally in [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

# API Use Cases 
![Screenshot 2024-12-22 173547](https://github.com/user-attachments/assets/a92189e7-abc0-447c-929a-e334665d0569)

![Screenshot 2024-12-22 173604](https://github.com/user-attachments/assets/7af61b20-872b-4020-890d-79c92bc7c487)


# Architecture
![Screenshot 2024-12-22 173716](https://github.com/user-attachments/assets/6740e2c1-4471-42d7-bf5c-b4ab6308a61a)


# Testing

Use the provided Postman collection to test all endpoints:

1. Import the `postman-collection.json` file from the root of the repository.
2. Set up the necessary environment variables in Postman.
3. Execute the requests to verify functionality.

# Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch for your feature/bugfix.
3. Commit and push your changes.
4. Submit a pull request for review.

# Team

- [Chandan Kumar Shaw](https://linkedin.com/in/chandan-kumar-shaw-9a08a519a)
- [Deepak Kumar Sah](https://linkedin.com/in/deepak-kumar-sah-79b1b4203)
- [Prashant](https://www.linkedin.com/in/prashant-bk)
- [Shoib Ansari](https://www.linkedin.com/in/shoib-ansari-dev/)

# License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

