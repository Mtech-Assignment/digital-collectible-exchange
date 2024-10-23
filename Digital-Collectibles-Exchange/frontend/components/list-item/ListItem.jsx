import React, { useState } from "react";
import { PinataSDK } from "pinata-web3";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketplaceAddress, csdpAddress } from "../../config/networkAddress";
import NFTAbi from "../../abi/NFT.json";
import CSDPAbi from "../../abi/CSDP.json";
import NFTMarketplaceAbi from "../../abi/NFTMarketplace.json";
import Input from "../../subcomponents/inputs/Input";
import { AiOutlineArrowUp } from "react-icons/ai";
import BtnMain from "../../subcomponents/btns/BtnMain";


export default function ListItem() {
  const router = useRouter();
  const [isListing, setisListing] = useState(false);
  const [file, setFile] = useState();
  const [formData, setFormData] = useState({
    price: "",
    name: "",
    description: "",
  });
  const pinata = new PinataSDK({
    pinataJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYzBlNTNjMi0yM2RiLTQyMjEtOTUxZS0zYjdmZTIxZTExOGIiLCJlbWFpbCI6InNoYXdjaGFuZGFua3VtYXIyMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWU0MGE0MmJkNjA5MTQ1OGY0OGUiLCJzY29wZWRLZXlTZWNyZXQiOiI2OTVkMmJmNzg1YWZiMGRhMjQ4ODIxNWE2OWQ1Y2Y5MjBlYTFlZjRkZDk4YTRkNzdiMDFhZWJhNjM1OWQwZTkwIiwiZXhwIjoxNzYwNzc4NzE4fQ.n6u4TWVS73UDMRhYuVajB4GC1ZOojjZrMkw1TypD948'
  });
  const pinataGateway = 'ivory-worried-badger-965.mypinata.cloud';

  // Onchange of image file
  const onChange = async (e) => {
    const fileData = e.target.files[0];
    if (!fileData) {
      console.error("No file selected!");
      return;
    }
    try {
      const uploadedFileResponse = await pinata.upload.file(fileData);
      console.log(uploadedFileResponse);
      const url = `https://${pinataGateway}/ipfs/${uploadedFileResponse.IpfsHash}`;
      setFile(url);
    } catch (error) {
        console.log(
          "Error in onChange function , You are in catch of ListItem component ",
          error
        );
    }
  }

  // Main function to list an item. First it mint an NFT and then List an nft.
  const createItem = async (url) => {
    console.log("Token metadata url: ", url);
    setisListing(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      nftAddress,
      NFTAbi.abi,
      signer
    );
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

    let transaction = await nftContract.mintToken(url);
    let tx = await transaction.wait();
    console.log("Token minted Successfully");
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    let convertedPrice = ethers.utils.parseUnits(formData.price, 18); // convert ether to wei
    console.log("ConvertedPrice", convertedPrice);
    const listingPrice = await nftMarketPlaceContract.getListingPrice();
    listingPrice = await listingPrice.toString();
    console.log("Listing Price", listingPrice);

    const csdpApprovalTxn = await CSDPTokenContract.approve(
      nftMarketplaceAddress,
      listingPrice
    );
    await csdpApprovalTxn.wait();
    console.log("Approval complete");
    // let listingTx = await nftMarketPlaceContract.listItem(
    //   nftAddress,
    //   tokenId,
    //   convertedPrice,
    //   { value: listingPrice }
    // );
    console.log("Listitem complete");
    let listingTx = await nftMarketPlaceContract.listItem(
      nftAddress,
      tokenId,
      convertedPrice
    );
    await listingTx.wait();

    setisListing(false);
    router.push("/");
  };

  const listAnItem = async () => {
    setisListing(true)
    const { name, price, description } = formData;
    if (!name || !price || !description || !file) {
      console.log("Some field are missing");
      setisListing(false)
      return;
    }

    try {
      const uploadedJsonResponse = await pinata.upload.json({ name, description, price, image: file });
      // if (uploadedJsonResponse.isDuplicate) {
      //   throw new error("Listing Duplicate NFT not allowed in marketplace");
      // }
      const url = `https://${pinataGateway}/ipfs/${uploadedJsonResponse.IpfsHash}`;
      createItem(url);
    } catch (error) {
      console.log(
        "Error in listAnItem function , You are in catch of listAnItem function ",
        error
      );
      setisListing(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="md:w-3/6">
        <form action="">
          <Input
            id="name"
            placeholder="e.g.Monkey"
            label="Name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </form>
        <Input
          id="description"
          placeholder="e.g.This is most unique monkey in the world."
          label="Description"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <Input
          id="price"
          placeholder="e.g.10 (In CSDP)"
          label="Price"
          onChange={(e) => {
            console.log(formData.price);
            setFormData({ ...formData, price: e.target.value });
            console.log(formData);
          }}
        />
        <Input
          id="file"
          placeholder="Choose image file"
          label="NFT Image"
          type="file"
          onChange={onChange}
        />
        <div className="">
          {file && (
            <img
              className="rounded-xl mt-4 mb-10 w-96"
              src={file}
              alt="Choosen image"
            />
          )}
        </div>
          <BtnMain
            text="List NFT"
            icon={<AiOutlineArrowUp className="text-2xl" />}
            className="w-full text-lg"
            onClick={listAnItem}
            disabled={isListing}
          />
      </div>
    </div>
  );
}
