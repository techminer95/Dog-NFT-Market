import { useEffect, useState } from "react";
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
        const initializeProfile = async () => {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);

                // Request accounts and fetch the first one
                const [userAddress] = await provider.send("eth_requestAccounts", []);
                setAddress(userAddress);

                // Fetch wallet balance
                const balance = await provider.getBalance(userAddress);
                setBalanceInEther(ethers.formatEther(balance));

                // Initialize contract and fetch user NFTs
                const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, provider);
                const myNFTs = await contract.getMyNFTs();

                // Fetch metadata and calculate total price
                const items = await Promise.all(
                    myNFTs.map(async (nft) => {
                        const tokenURI = await contract.tokenURI(nft.tokenId);
                        const { image, name, desc } = (await axios.get(tokenURI)).data;
                        const price = parseFloat(ethers.formatUnits(nft.price.toString(), "ether"));

                        return {
                            price,
                            tokenId: nft.tokenId,
                            seller: nft.seller,
                            owner: nft.owner,
                            image,
                            name,
                            desc,
                        };
                    })
                );

                const totalPrice = items.reduce((sum, item) => sum + item.price, 0).toFixed(3);
                setData(items);
                setTotalPrice(totalPrice);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        initializeProfile();
    }, []);

    return (
        <div className="profileClass" style={{ minHeight: "100vh" }}>
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
                        <h2 className="font-bold">NFT Value</h2>
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
                            data.map((nft, index) => <NFTTile data={nft} key={index} />)
                        ) : (
                            <div className="mt-10 text-xl">
                                Oops, No NFT data to display (Are you logged in?)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}