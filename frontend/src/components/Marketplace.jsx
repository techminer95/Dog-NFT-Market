import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useEffect, useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import {ethers} from "ethers";

export default function Marketplace() {
const [data, updateData] = useState([]);
useEffect(()=>{
    getAllNFTs();
},[])

const getAllNFTs = async () =>{
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = provider.getSigner();
    //Pull the deployed contract instance
    const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, provider)
    //create an NFT Token
    const transaction = await contract.getAllNFTs();

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        var tokenURI = await contract.tokenURI(i.tokenId);
        console.log("getting this tokenUri", tokenURI);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.formatUnits(i.price.toString(), 'ether');
        let item = {
            price,
            tokenId: i.tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            desc: meta.desc,
        }
        return item;
    }))
    updateData(items);
}

return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Top NFTs
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                })}
            </div>
        </div>            
    </div>
);

}