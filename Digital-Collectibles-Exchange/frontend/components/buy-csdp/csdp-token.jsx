import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  csdpAddress,
} from "../../config/networkAddress";
import CSDPAbi from "../../abi/CSDP.json";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import BtnMain from "../../subcomponents/btns/BtnMain";
import { AiOutlineArrowUp, } from "react-icons/ai";
import Input from "./Input";


export default function CSDPToken() {
  const router = useRouter();

  const [_, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0.0);
  const [csdpTokenAmount, setCsdpTokenAmount] = useState(0);
  const [priceInEther, setPriceInEther] = useState(0);
  const [isPurchasing, setisPurchasing] = useState(false);

  const loadCSDPBalance = async () => {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    await provider.send("eth_requestAccounts", []); // Prompts user to connect wallet
    const address = await signer.getAddress();
    const CSDPTokenContract = new ethers.Contract(
      csdpAddress,
      CSDPAbi.abi,
      provider
    );
    let currentBalance = await CSDPTokenContract.balanceOf(address);
    currentBalance = currentBalance / (10 ** 18);
    console.log(currentBalance);
    setCurrentBalance(currentBalance);
    setLoading(false);
  };

  const buyCSDP = async () => {
    setisPurchasing(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const CSDPTokenContract = new ethers.Contract(
      csdpAddress,
      CSDPAbi.abi,
      signer
    );

    CSDPTokenContract.on("Transfer", (f, t, value) => {
      value = (value / (10 ** 18));
      setCurrentBalance(currentBalance+value);
    });

    const etherPriceInUint = ethers.utils.parseUnits(`${priceInEther}`, "ether");

    const transaction = await CSDPTokenContract.sendToken(
      { value: etherPriceInUint }   // sending ether to contract to get a token
    );
    await transaction.wait();
    setisPurchasing(false);
  };

  useEffect(() => {
    loadCSDPBalance();
  }, []);

  return (
    <div>
      <h1>Buy CSDP using Ether</h1>
      <h3>Current balance: {currentBalance} CSDP</h3>
      <div>
        <Input
          id="csdp-amount"
          placeholder="input upto 15 decimal places"
          label="Token Amount"
          value={csdpTokenAmount}
          onChange={(e) => {
            setCsdpTokenAmount(e.target.value);
            setPriceInEther((e.target.value/1000));
          }}
        />
        <Input
            id="csdp-price-in-ether"
            placeholder="e.g 1/2/3..."
            label="Ether Amount"
            value={priceInEther}
            onChange={(e) => {
              setPriceInEther(e.target.value);
              setCsdpTokenAmount(e.target.value*1000);
            }}
        />
        {!isPurchasing && <BtnMain
          text="Buy Now"
          icon={<AiOutlineArrowUp className="text-2xl" />}
          className="text-lg w-full"
          onClick={() => buyCSDP()}
        />}
      </div>
    </div>
  );
}
