import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { nftAddress, nftMarketplaceAddress } from "../../config/networkAddress";
import NFTAbi from "../../abi/NFT.json";
import NFTMarketplaceAbi from "../../abi/NFTMarketplace.json";
import axios from "axios";
import Web3Modal from "web3modal";
import Card from "../../subcomponents/cards/Card";
import Link from 'next/link';
import Loading from "../../subcomponents/loading/Loading";

export default function MyItems() {
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State for error messages

  // Load NFTs for the connected user
  const loadMyNFTs = async () => {
    setLoading(true);
    const web3Modal = new Web3Modal(); // Create a new instance on each call

    try {
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const nftContract = new ethers.Contract(nftAddress, NFTAbi.abi, signer);
      const nftMarketPlaceContract = new ethers.Contract(
          nftMarketplaceAddress,
          NFTMarketplaceAbi.abi,
          signer
      );

      const data = await nftMarketPlaceContract.getOwnerListedItems();

      const allItems = await Promise.all(
          data?.map(async (i) => {
            let convertedPrice = ethers.utils.formatUnits(i.price.toString(), 18);
            const tokenUri = await nftContract.tokenURI(i.tokenId);
            const metaData = await axios.get(tokenUri);
            return {
              price: convertedPrice,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: metaData.data.image,
              name: metaData.data.name,
              description: metaData.data.description,
            };
          })
      );

      setAllNFTs(allItems);
      setError("");
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setError("Failed to load NFTs. Please check your wallet connection or try again later."); // Set error message
      setAllNFTs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyNFTs();
  }, []);

  return (
      <div>
        {loading ? (
            <Loading />
        ) : (
            <div>
              {error && (
                  <div className="text-red-500 text-center font-semibold mb-4">
                    {error}
                    <button
                        className="ml-2 bg-blue-500 text-white py-1 px-3 rounded"
                        onClick={loadMyNFTs} // Retry loading NFTs
                    >
                      Retry
                    </button>
                  </div>
              )}
              {!error && (
                  <div className="flex flex-row space-x-4 overflow-x-auto">
                    {allNFTs.length ? (
                        allNFTs.map((nft, index) => (
                            <div key={index}>
                              <Card
                                  nft={nft}
                                  url="/my-items/"
                                  onClick={() => buyNFT(nft)}
                              />
                            </div>
                        ))
                    ) : (
                        <div className="text-center font-semibold text-base">
                          No purchase history found.
                          <Link href="/"> Buy now some</Link>
                        </div>
                    )}
                  </div>
              )}
            </div>
        )}
      </div>
  );
}
