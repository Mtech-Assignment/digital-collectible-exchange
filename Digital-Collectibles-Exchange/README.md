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
- Using the custom token(**CSDP**) to make any transaction [See the integration details](#integration-of-csdp-marketplace-token-for-trading)
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

## Solidity Unit Testing
We have also added the Unit testing files for the **CSDP** contract and **Marketplace** contract which can be run by creating a new file in the [Remix IDE](https://remix.ethereum.org/) under the **tests/** folder of the created NFT/ERC721 project and then navigating to the **Solidity unit testing** from the left navigation bar and selecting which file to run for the unit test.

## Integration of CSDP (Marketplace Token for Trading)

### Working on frontend side

CSDP token is ERC20 standard implementation, and erc20 is a specification for Ethereum-compatible tokens defined in the [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/erc20). See the implementation [here](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/CSDP.sol) 

Every time a user wants to List, Buy, or Resell NFTs then they need to approve some tokens to the [marketplace contract](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol) so the marketplace contract can debit the **CSDP** token from the user's wallet, to do this we approve the token from the frontend ([See Here](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/frontend/components/list-item/ListItem.jsx#L96)) which will open the metamask wallet to get the user confirmation. This makes sure that the user has approved the marketplace contract and now the marketplace contract account has access to the user's token whichever amount the user has authorized (For e.g In Listing of item in the marketplace it requires 0.25 CSDP so marketplace contract now has access to 0.25 CSDP of user and it can spend that amount on behalf of user)

### Working on smart contract side 

In the [marketplace contract](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol) the [**tradingToken**](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol#L26) is pointing to the CSDP contract which should be previously deployed on some network and using the address of the contract we can access the CSDP contract functions. Pointing to the actual contract is done in the [**constructor**](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol#L29), and now **tradingToken** is pointing to the CSDP contract and using this we can call any function defined in **ERC20** standard including extract functions defined in [CSDP contract](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/CSDP.sol).

In the marketplace contract we are transferring the CSDP amount to seller of the NFT by debiting it from the buyer's wallet. The way it's done is first we check if the user's has approved the required token amount to the marketplace or not (which we are doing in the frontend side), by calling the [**allowance**](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol#L218) method (here **address(this)** represents the current address calling the smart contract function, in this case, marketplace contract, as marketplace contract facilitating the trading so transfer of asset to the buyer and transfer of token to the seller needs to be taken care by the marketplace contract itself), successively we also check if the user has a [required token amount balance](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol#L222) (here **msg.sender** represents the current user who has called the contract function to execute). If either of the above criteria fails we send an appropriate error message to the caller of the function. Finally, we transfer the CSDP from the [buyer wallet account to the marketplace contract account](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol#L227) and at the end of the transaction we transfer the CSDP amount to the seller ([See here](https://github.com/Mtech-Assignment/digital-collectible-exchange/blob/main/Digital-Collectibles-Exchange/smart-contracts/NFTMarketplace.sol#L218)).

### Sequence Diagram of Buy NFT Transaction
[![CSDP-sequence drawio](https://github.com/user-attachments/assets/2db55c8a-aae6-4845-b54f-4ad98ece4beb)
](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=CSDP-sequence.drawio#R%3Cmxfile%3E%3Cdiagram%20name%3D%22Page-1%22%20id%3D%222YBvvXClWsGukQMizWep%22%3E7Vxbb%2BI4FP41SDMPrULuPAJtZ3Y1ne1OZ7TSvpnEQNQkzjgGyv76tWPn5iQlBFJKi1qpyYl9Yny%2BczcdaNPg%2BQsG0fIeudAfqIr7PNBuBqo6VFV1wH4Vd8sppm1ywgJ7rhiUEx69%2F6AgKoK68lwYlwYShHziRWWig8IQOqREAxijTXnYHPnlt0ZgASuERwf4Veo%2FnkuWnGobSk7%2FCr3FMn3zUBFPApAOFoR4CVy0KZC024E2xQgRfhU8T6HPNi%2FdFz7vruFptjAMQ9JmArgf4e1ae15bavQbPf998%2BPr7ZXgsgb%2BSnzggTa%2BwygkMHTFusk23Qz6ESJ2uQr8b94c%2Bl5I7yYRxF4ACcT0iS%2FIDzltsll6BD5GwGFTNxQmlLYkgU%2FvhvSSSo4AOoVNV%2Bi9i1H0E%2BAFJILgIN8HUezNkmUwCobOCsfeGv6AMUcMo6IVYa%2BeZkhgxAhhQikxwfQdjAhBTDYwppeTEG5uXSrt9ANak4Fq%2Fl4xgUxg9iAj0Z0pPPdnqDA7H6ROpUENDNYQE4%2FirGEq%2FYBr6JbmKqUBGK1CtzLCukkYychIxUzfCZ8LJIGULxBRYeEtHSKeqppArVBbXdxuch3IkL4s4N9M0Q6E3i0y1jk06YVA5x5IVatIleFZAFWEqLSTJRiTgXEjoZRiYokWKAR%2BEae1%2BCEJEh8Z8OMq8i%2Fg2mVYWiNON0qAs%2BoAV8WboR0Bb25k3C%2Bi7%2BqvkRO44Xb%2B57%2F27ErVL4B7Q4CrAKktBhsBZ5QtXAavHYjTewOccQHchwJcSxN3DAtXu9oavGnj6ePNwxVBTzC8RH%2FnDN%2BDoj9dfWvRn3mxjW8UXC%2Balq7R38mdsVaTGF8Ad1bO2NgHcJp2YsDp2gVwHwlweq1PfUXAGRfAfSjAGad2qbWl5nuAnyCJfJYeXPKN94vfl6M%2FUz9hvlHvji%2FVvzNCV7O9aYSc9sbcsW5dAPeRAKed2h1rowvgPhTg7FMnHJcO7ocC3MkTjmqCO3YIwi%2FlGXxAvvvfwAz6Dyj2iIdCOmSGCEFBYcDY9xbsAUFSnlELxSOEylJlflizyUbNJg9765O3qMzD0B2zo1j0zvFBHHtOea9SrBY3iSnYy1ukKiTN2wb79eMw9AGh%2BVyJWd3GiKkPzBTlIrAkEchJSIxW2IFiklo4kCXxkc%2FYVBjxz1dhlIgp%2BzjdJVeNOCcrtj3f735WRUjFkShDkg%2FTNBjk%2BXFBkvQXCI1wqLQgrlGVwHNdNlcIWhzcE%2FwGGcC72CfzQHkfVt9oUVDrRxOOjnDVGl2XjfnQ6ghyWVlkPj1jfFjN48fxU0wpd8wTMPTNPRyAxL6rps88peut6eWCXaI5HcNa4vTPA%2FZYkUoBUYTROvHMPvfLd4UZNUwIGrDjoIVCF3stjTioX2jgcZbaxxXgZOp3Mkd0dPWzyzqjdnYwFTWusOpb%2FeqSTA75OAJhSTpZaIt8FoON2T4uZuATj2sV6c%2FnREDKnCrS1RwEnr%2FlUwIUophXf7PnvGrLnirRM6dTcJMroSzjZBkAc9VTZsB5WiRIuCov5RMNafnbixd8IXmQnqqwIR%2BKN%2Bi%2BMWpy4ju7S%2FfRSHaSUm7YNROTwfbKoBLZNXaYjU2x2YmNmrPh4sqejBOLR7Mn9ozGCF644G%2FjFtFIJEpHc6NnJFvAbldxOpLiCAQgfioOTlYlzciXwHGRLSG3gGxYbgPZACWhJWrMbocpp9QaMqKwh4xYtojsobCJ5QUULWPNfqYWso0UskeZAHJbYTBtzUYa1rWmGqZqG5ppWIYyMnKu2wJD0762LFsZafTH1FW9IDsQ5%2BMWhdfIKEhuMygUiWWAinEVJGeOiytyC89VMLTt3ZTs7qplgUaH1eTbdjuyhjhSsL9SrhVrWLKraSzd1fCnQ9B8HsNeLHHm2HNL%2FCtmGqFMeQjEYiKyZKUKELBcNpzFUX08I%2BKhqGU89DEQoeppqJlCwnjzkGhxxulkqXtDb%2FvQxGbUcAZ339BKbzrM%2B0qBVSqqguymwPczJRZa2Uad6VKWiMYBSjHZSbKh2pk7050ZXAJ%2FnvJbJUbmHWU5B8f8h31J4ITlNq4bLy2uqtv7lJGPrNuaXPLsqtsVRj3rtlbV7VeScf8y6ZrKmvYORn3LpFpHKtnbnVZ2ttr%2BQWDw6bMwjC2N6dHKRmcTanH0N4ZayrVm2qNypKUeFmml7asy06HEoMc4bLe6X%2Fqib6UvuuMgmy013dNTa7u%2B49VfE7TFtwpPFjCkh55OlA2YsqO3u3onUz6%2F2M470V0H28IwoduNCzas%2BgXnAOEcj%2Bv6qiGnlGr4PtqA0IGJc2Pdjp3e0FlC54m9OE8RlCWrXKV5i9u%2Bu5KsIS1GJL2WOEr%2BeUW7%2FOUskxDtUIU47KziW7Ypmt2PrTDlA6NZb2Xv%2FELS4izfeKVYVrdPJ76duaF%2BaBOxQXzSnmeHk%2FYWnr2D0bFM%2FUi5rj9P1aux16sNu8zYYxDGc4jvMAraW%2Fp0VuYtktMlqb3uWGKa0yXkjmNDF8gic2780aZ76Qo4DsX1%2B%2BrK6%2F3YQ6s8ob%2FsyGjxTYwzqYbIRYzK11daN%2FalNKPCqGcPYlSPjt0GHslDwgmvdrSwD7frpFXKdVecxumsv8n%2FreCH2BDNikunet5jrYTrxgu1EjPV06yqMThGqUSe0aP2v5FY5TWzUjlU6dyjkkOVV%2B5RmdX%2BohxLHBxHxHQdySGTrh4%2F4A6f2x%2FOmfHs1LQ6H7vREBNkdkNRTLtsOLTDDEf%2FlsJsUUY9XVI6qpqUV81eLSl7lVPOc8ldzeoh63IxagZ8Vor6a56blheLT3xWqQSF4e%2BVh%2FcoQYl3plYkoltJOWVG6h0lE1zJjg7PtAXSv5XQWsQTl2bLeTRbdLkkp7ZrtnTotQzEqcgCFvPzkNrt%2Fw%3D%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E)






