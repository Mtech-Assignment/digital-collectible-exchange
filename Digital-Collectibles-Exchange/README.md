# FullStack-NFT-Marketplace-DApp

Complete Full Stack NFT Marketplace (Decentralized Application) using solidity language, remix ide, and next.js framework for frontend.

**Dashboard**
&nbsp;
<img width="959" alt="image" src="https://github.com/user-attachments/assets/960a6e4c-51b6-45fe-bc70-4e64fc66d204">


&nbsp;
&nbsp;
&nbsp;


**List NFT**
&nbsp;
<img width="958" alt="image" src="https://github.com/user-attachments/assets/182cb5fd-670d-4b25-ba3b-c3436a5c685b">


&nbsp;
&nbsp;
&nbsp;

**Buy NFT**
&nbsp;
<img width="955" alt="image" src="https://github.com/user-attachments/assets/92b64a62-5083-4990-ae50-84225583f535">



&nbsp;
&nbsp;
&nbsp;


## Functionalities :-

- See **All Listed NFTs** without doing Login.
- **Buy a NFT**.
- **List a NFT** just by putting image, name, description, price.
- See your **Owned NFTs** (Your purchased NFTs)
- See **Your Listed NFTs** and NFts you have sold.
- Good UI
- Using the custom token(**CSDP**) to make any transaction
- Buy **CSDP** from the Dapp.

_NFT Marketplace Contract Deployed on **Holesky Test Network**_ -> 0xFF17205b7ada750BD9553A1c9378bE547aaF8d47
_NFT Contract Deployed on **Holesky Test Network**_ -> 0xb99Ce50Eb50dD6276b3A385f845839188cc0c1d0

**_Check It at_** -> Not deployed at **(Deployed on Pinata (IPFS)**

_Check NFT Marketplace Smart Contract At_ -> https://holesky.etherscan.io/address/0xFF17205b7ada750BD9553A1c9378bE547aaF8d47#code

_Check NFT Smart Contract At_ -> https://holesky.etherscan.io/address/0xb99Ce50Eb50dD6276b3A385f845839188cc0c1d0#code

## How to Setup in your local enviroment :-

### Frontend (NPM Should be installed as a prerequisite)

    **Make sure you have metamask wallet installed in the browser as a chrome extension**
    1. cd Digital-Collectibles-Exchange/frontend
    2. npm install
    3. npm run dev
    4. Access the frontend in the localhost:3000 in the browser.
    
    
## Technologies/Frameworks Used :-

### Frontend

1. **Next.js**
2. **Tailwind CSS** (For styling)
3. **ethers.js** For integration of blockchain

## Blockchain

1. **Solidity** (To develop Smart Contract)
2. **Javascript/Typescript** (For deploying scripts)
3. **Openzeppelin** For token specs

## Deployment of smart contract using [Remix IDE](https://remix.ethereum.org/)

1. Create an NFT/ERC721 project in Remix IDE and copy all 3 smart contracts by making a different file.
2. Go to the deploy section in the remix ide from the left navigation bar and select the network you want to deploy the contract.
3. If you want to deploy in any testnet then connect to that testnet first with the wallet and then connect your wallet to the remix ide in this way remix ide will automatically infer the network to which your wallet is connected.
4. At last when the deploy button becomes active then you can deploy the contract to the network connected to the wallet.
5. [Repo](https://github.com/Mtech-Assignment/Smart-contract-deployement-script-remix-) for reference of deployment script auto-generated in the **Remix IDE** 
