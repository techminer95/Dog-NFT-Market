import  { useEffect, useState } from "react";
import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { ethers } from "ethers";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, setAddress] = useState("0x");
    const [totalPrice, setTotalPrice] = useState("0");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    async function getNFTData() {
        try {
            setLoading(true);
            setErrorMessage("");
            // let sumPrice = 0;

            // Connect to Ethereum provider
            const provider1 = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider1.send("eth_requestAccounts", []);
            setAddress(accounts[0]); 
            const provider = new ethers.JsonRpcProvider("http://localhost:8545");
            const signer = await provider.getSigner()
            const balance = await provider.getBalance("ethers.eth");
            setTotalPrice(balance);

            // Pull deployed contract instance
            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

            // Fetch NFTs owned by the user
            const transaction = await contract.getMyNFTs();

            const items = await Promise.all(
                transaction.map(async (i) => {
                    const tokenURI = await contract.tokenURI(i.tokenId);
                    let meta = await axios.get(tokenURI).catch(() => ({}));
                    meta = meta?.data || {};

                    const price = ethers.utils.formatUnits(i.price.toString(), "ether");
                    return {
                        price,
                        tokenId: i.tokenId.toNumber(),
                        seller: i.seller,
                        owner: i.owner,
                        image: meta.image || "",
                        name: meta.name || "Unknown",
                        description: meta.description || "No description available",
                    };
                })
            );

            // sumPrice = items.reduce((acc, item) => acc + parseFloat(item.price), 0);

            updateData(items);
            // setTotalPrice(sumPrice.toFixed(3));
            updateFetched(true);
        } catch (error) {
            console.error("Error fetching NFT data:", error);
            setErrorMessage("Failed to fetch NFT data. Please ensure you are connected to the correct wallet and network.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!dataFetched) {
            getNFTData();
        }
    }, [dataFetched]);

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
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <div className="flex justify-center flex-wrap max-w-screen-xl">
                            {data.map((value, index) => (
                                <NFTTile data={value} key={index} />
                            ))}
                        </div>
                    )}
                    <div className="mt-10 text-xl">
                        {data.length === 0 && !loading && !errorMessage ? "Oops, No NFT data to display (Are you logged in?)" : ""}
                    </div>
                </div>
            </div>
        </div>
    );
}
