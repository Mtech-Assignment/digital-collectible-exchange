import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Loading from "../../subcomponents/loading/Loading";


export default function Transactions() {

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currentUserAddress, setCurrentUserAddress] = useState("");

  const loadTransactions = async () => {
    setLoading(true);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    await provider.send("eth_requestAccounts", []); // Prompts user to connect wallet
    const address = await signer.getAddress();
    setCurrentUserAddress(address);

    const transactionUrl = `https://api-holesky.etherscan.io/api?module=account&action=txlist&address=${address}&apikey=6C15HE4Y7UM19BFJRHX7TZ8KDXUG7SHVWV&sort=desc&page=1&offset=10`
    const transactionData = await (await fetch(transactionUrl)).json();
    console.log(transactionData, currentUserAddress)

    setTransactions(transactionData.result);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div style={
      {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }
    }>
        <div style={{ position: "relative" }}>
            <h1 style={{fontSize: 40, marginTop: 20, textAlign: "center"}}>Previous Transactions</h1>
            <h3 style={{fontSize: 30, marginTop: 10, textAlign: "center"}}>Address: {currentUserAddress}</h3>
        </div>
        {loading == true ? (
            <Loading />
        ) : (
            <div style={
                {
                    border: "1px solid black",
                    marginTop: 30,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    overflowY: "scroll",
                    marginBottom: 20
                }
            }>
                {transactions?.map((tx, index) =>
                    (
                        <div key={index} style={{marginBottom: 20, marginTop: 20}}>
                            <h1 style={{fontSize: 20}}>BlockNumber: {tx.blockNumber}</h1>
                            <h1 style={{fontSize: 20}}>TimeStamp: {tx.timeStamp}</h1>
                            <h1 style={{fontSize: 20}}>From: {tx.from}</h1>
                            <h1 style={{fontSize: 20}}>To: {tx.to}</h1>
                            <h1 style={{fontSize: 20}}>Value: {tx.value}</h1>
                            <h1 style={{fontSize: 20}}>Gas: {tx.gas}</h1>
                            <h1 style={{fontSize: 20}}>gasPrice: {tx.gasPrice}</h1>
                            <h1 style={{fontSize: 20}}>functionName: {tx.functionName}</h1>
                            <h1 style={{fontSize: 20}}>ContractAddress: {tx.contractAddress}</h1>
                            <h1 style={{fontSize: 20}}>GasUsed: {tx.gasUsed}</h1>
                            <div style={{borderTop: 1, width: 550, height: 2, backgroundColor: "black", marginTop: 20}}></div>
                        </div>
                        
                    )
                )}
            </div>
        )}
    </div>
  );
}
