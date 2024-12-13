import { useEffect, useState } from "react";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from "ethers";



export default function Marketplace() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchNFTs = async () => {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, MarketplaceJSON.abi, provider);
                const transaction = await contract.getAllNFTs();

                const items = await Promise.all(transaction.map(async (i) => {
                    const tokenURI = GetIpfsUrlFromPinata(await contract.tokenURI(i.tokenId));
                    const { data: meta } = await axios.get(tokenURI);

                    return {
                        price: ethers.formatUnits(i.price.toString(), "ether"),
                        tokenId: i.tokenId,
                        seller: i.seller,
                        owner: i.owner,
                        image: meta.image,
                        name: meta.name,
                        desc: meta.desc,
                    };
                }));

                setData(items);
            } catch (error) {
                console.error("Error fetching NFTs:", error);
            }
        };

        fetchNFTs();
    }, []);

    return (
        <div>
            <div className="flex flex-col text-center items-center mt-11 text-white mt-20">
                <div className="md:text-xl font-bold text-white font-bold">
                    Top NFTs
                </div>
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
    );
}