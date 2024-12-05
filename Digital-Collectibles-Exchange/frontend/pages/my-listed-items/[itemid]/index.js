import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { nftAddress, nftMarketplaceAddress, rpcProviderUrl, csdpAddress } from "../../../config/networkAddress";
import NFTAbi from "../../../abi/NFT.json";
import NFTMarketplaceAbi from "../../../abi/NFTMarketplace.json";
import CSDPAbi from "../../../abi/CSDP.json";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import BtnMain from "../../../subcomponents/btns/BtnMain";
import { AiOutlineArrowRight } from "react-icons/ai";
import NftInfo from "../../../components/nft-info/NftInfo";

export default function ListedNFTItemId() {
  const router = useRouter();
  let { itemid } = router.query;

  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState();
  const [isPurchasing, setisPurchasing] = useState(false);

  const loadNFT = async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpcProviderUrl);
    const nftContract = new ethers.Contract(nftAddress, NFTAbi.abi, provider);
    const nftMarketPlaceContract = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarketplaceAbi.abi,
      provider
    );
    const data = await nftMarketPlaceContract.getParticularItem(
      router.query.itemid
    );
    console.log(data);

    const allData = async () => {
      let convertedPrice = ethers.utils.formatUnits(
        data.price.toString(),
        18
      );
      const tokenUri = await nftContract.tokenURI(data.tokenId);
      const metaData = await axios.get(tokenUri);
      let item = {
        price: convertedPrice,
        itemId: router.query.itemid,
        tokenId: data.tokenId.toNumber(),
        seller: data.seller,
        owner: data.owner,
        image: metaData.data.image,
        name: metaData.data.name,
        description: metaData.data.description,
        sold: data.sold
      };
      console.log(item);
      setNftData(item);
    };
    allData();
    setLoading(false);
  };

  const buyNFT = async (price, itemId) => {
    setLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const nftMarketPlaceContract = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarketplaceAbi.abi,
      signer
    );
    const CSDPTokenContract = new ethers.Contract(
      csdpAddress,
      CSDPAbi.abi,
      signer
    );

    let convertedPrice = ethers.utils.parseUnits(price.toString(), 18);

    // provide allowance of the CSDP to the marketplace contract
    const csdpApprovalTxn = await CSDPTokenContract.approve(
      nftMarketplaceAddress,
      convertedPrice
    );
    await csdpApprovalTxn.wait();

    const transaction = await nftMarketPlaceContract.buyItem(
      nftAddress,
      itemId,
    //   { value: convertedPrice, } // incase of sending the ether
    );
    await transaction.wait();
    await router.push("/my-items");
  };

  useEffect(() => {
    const load = async () => {
      if (router.query.itemid) {
        await loadNFT();
      }
    };
    load();
  }, [itemid]);

  return (
    <div>
      <NftInfo nftData={nftData}>
        {!loading && nftData && !nftData.sold && <BtnMain
          text="Buy Back"
          icon={<AiOutlineArrowRight className="text-2xl" />}
          className="w-full"
          onClick={() => buyNFT(nftData.price.toString(), nftData.itemId)}
        />}
      </NftInfo>
    </div>
  );
}
