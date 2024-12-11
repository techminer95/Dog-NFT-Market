import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Marketplace from "../Marketplace.json";
import axios from "axios";
import { ethers } from "ethers";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [data, setData] = useState([]);
    const [address, setAddress] = useState("0x");
    const [totalPrice, setTotalPrice] = useState("0");
    const [balanceInEther, setBalanceInEther] = useState("");

    useEffect(() => {
        getProfile();
    }, []); // Runs only once on component mount

    const getProfile = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Request user accounts and set the first account
            const accounts = await provider.send("eth_requestAccounts", []);
            const userAddress = accounts[0];
            setAddress(userAddress);

            // Fetch wallet balance
            const balance = await provider.getBalance(userAddress);
            setBalanceInEther(ethers.formatEther(balance));

            // Initialize contract
            const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, provider);

            // Fetch user NFTs
            const myNFTs = await contract.getMyNFTs();
            let sumPrice = 0;

            // Fetch metadata for each NFT
            const items = await Promise.all(
                myNFTs.map(async (nft) => {
                    const tokenURI = await contract.tokenURI(nft.tokenId);
                    const meta = (await axios.get(tokenURI)).data;

                    const price = ethers.formatUnits(nft.price.toString(), "ether");
                    sumPrice += parseFloat(price);

                    return {
                        price,
                        tokenId: nft.tokenId,
                        seller: nft.seller,
                        owner: nft.owner,
                        image: meta.image,
                        name: meta.name,
                        desc: meta.desc,
                    };
                })
            );

            setData(items);
            setTotalPrice(sumPrice.toFixed(3)); // Format to 3 decimal places
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    return (
        <div className="profileClass" style={{ minHeight: "100vh" }}>
            <Navbar />
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Wallet Value</h2>
                        {balanceInEther} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.length > 0 ? (
                            data.map((value, index) => (
                                <NFTTile data={value} key={index} />
                            ))
                        ) : (
                            <div className="mt-10 text-xl">Oops, No NFT data to display (Are you logged in?)</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
