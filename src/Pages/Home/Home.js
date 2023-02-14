import React, { useState,useEffect } from 'react';
import Web3 from 'web3';
import abi from "../../ABI/abi.json"
import { toast } from "react-toastify";
const Home = () => {
    const chainId = 80001;
    const contractAddress="0xb28D6D67D2E9669977beEFC2F85beBA09ce25D6d"
    const web33 = new Web3(
        "https://polygon-mumbai.g.alchemy.com/v2/MXTlA2FpRDF3lP5pMRFjWA8C-o-Khq8b"
      );
    const contract = new web33.eth.Contract(abi, contractAddress);
    const ethereum = window.ethereum;
    const web3 = new Web3(window.ethereum);
    const [accountAddress,setAccountAddress]=useState()
    const [accountBalance,setAccountBalance]=useState()
    const [Count,setCount]=useState()
    const [NextMint,setNextMint]=useState()
    const [URL,SetURL]=useState()
    const connectWallet = async () => {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
        setAccountAddress(accounts[0])
        console.log(accounts[0])
        let balance=await web3.eth.getBalance(accounts[0])
        setAccountBalance(balance);
    }
    window.ethereum.on("accountsChanged", async function() {
        // Time to reload your interface with accounts[0]!
        connectWallet()
        getNextMint();
        getNextMint1()
      });
      console.log(contract)

      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      const mintNow = async () => {
        const currentChainId = await web3.eth.getChainId();
        if (currentChainId != chainId) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: Web3.utils.toHex(chainId),
                    chainName: "Mumbai Testnet",
                    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                    nativeCurrency: {
                      name: "Mumbai Testnet",
                      symbol: "MATIC",
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://polygonscan.com/"],
                  },
                ],
              });
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: Web3.utils.toHex(chainId) }],
              });
        
              console.log(`switched to chainid : ${chainId} succesfully`);
              
            } catch (err) {
              console.log(`cannot connect to this`);
              console.log(err);
            }
          }
        console.log(contractAddress);
    
        try {
          const transactionParameters = {
            to: contractAddress, // Required except during contract publications.
            from: accountAddress, // must match user's active address.
            data: contract.methods._safeMint(accountAddress, Count).encodeABI(),
          };
          const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
          });
          if (txHash) {
            await delay(5000);
            let pollInterval = 4;
            let elapsedTime = 0;
    
            while (elapsedTime < pollInterval) {
              let receipt;
              try {
                receipt = await web3.eth.getTransactionReceipt(txHash);
              } catch (err) {
                console.log("error retrieving transaction receipt: " + err);
              }
              console.log("Print kr bhai", receipt);
              if (receipt) {
                if (receipt.status) {
                  console.log("txHash", txHash);
                  setNextMint(txHash);
                  toast.success("Successfully Minted");
                  console.log("txHash", receipt.status);
                  getImage(Count);
                  getNextMint() 
                  return receipt;
                  
                } else {
                  toast.warning("Transaction reverted");
                  return null;
                }
              } else {
                await delay(5000);
              }
              elapsedTime += 2;
            }
            console.log("transaction failed");
          }
        } catch (err) {
          console.log(err);
          console.log("Eror in sending transactions");
        }
        
      }
      
      const getNextMint = async () => {
        if (contract) {
          
          const Supply = await contract.methods.totalSupply().call();
          setCount(Number(Supply)+1);
          console.log(Number(Supply)+1)
          
        }
      };
      useEffect(() => {
        getNextMint();
        getNextMint1()
      }, [contract, NextMint]);

      const getImage = async (value) => {
        console.log("This value here", value);
        try {
          let data = await fetch(
            `https://gateway.pinata.cloud/ipfs/QmWCR8PEoNjxoGUobhNE4Fw2inEXkuDi197qzcA4kNrWiR/${value}.json`
          );
          data = await data.json();
          SetURL(data.image);
          // console.log(Works fine in getting mage)
        } catch {
          console.log("Error in getImage function in Mint.jsx");
        }
        // console.log(data)
      };
      const getNextMint1 = async () => {
        if (contract) {
          try {
            
            
              const Supply = await contract.methods
                .tokenOfOwnerByIndex(accountAddress, 1)
                .call();
              console.log("yeah its working here in getting NFT by index", Supply);
              if(Number(Supply)!=0)
              {
              getImage(Number(Supply));
              }
            }
           catch (err) {
            console.log(err)
            console.log("error in getting NFTs of Owner ie (getNextMint)");
          }
    
          // setRemaining(TokenURI)
        }
      };
    return (
        <div>
            <button onClick={()=>{connectWallet()}}>Conect Wallet</button>
            
            
            <h2>Wallet address</h2>
            {accountAddress?<p>{accountAddress}</p>:<p>Connect Your Wallet</p>}
            <h3>Balance</h3>
            {accountBalance?<p>{accountBalance}</p>:<p>Connect Your Wallet</p>}
            {accountAddress?<p><button onClick={()=>mintNow()}>Mint Now</button></p>:<p>Connect Your Wallet To Mint</p>}
            <h2>Your NFT here</h2>
            {URL?<img src={URL}></img>:<></>}
        
        </div>
    );
};

export default Home;