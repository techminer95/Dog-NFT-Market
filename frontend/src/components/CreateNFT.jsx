import { useState } from "react";
import { ethers } from "ethers";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';

export default function SellNFT() {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');

    const resetForm = () => {
        setName("");
        setDesc("");
        setPrice("");
        setImage(null);
    };

    // Upload NFT metadata to IPFS
    const uploadMetadataToIPFS = async (fileURL) => {
        if (!name || !desc || !price || !fileURL) {
            setMessage("Please fill all the fields!");
            return null;
        }

        const nftJSON = {
            name,
            desc,
            price,
            image: fileURL,
        };

        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success) {
                console.log("Uploaded JSON to Pinata: ", response);
                return response.pinataURL;
            } else {
                throw new Error("Failed to upload JSON to Pinata");
            }
        } catch (error) {
            console.error("Error uploading JSON metadata:", error);
            setMessage("Failed to upload metadata to IPFS.");
            return null;
        }
    };

    // List NFT on the marketplace
    const listNFT = async () => {
        try {
            setMessage("Uploading files... please don't click anything!");

            if (!image) {
                throw new Error("No image selected");
            }

            const fileResponse = await uploadFileToIPFS(image);
            if (!fileResponse.success) {
                throw new Error("Failed to upload file to IPFS");
            }

            const metadataURL = await uploadMetadataToIPFS(fileResponse.pinataURL);
            if (!metadataURL) return;

            console.log("Metadata URL:", metadataURL);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);

            const priceInWei = ethers.parseEther(price);
            const listingPrice = (await contract.getListPrice()).toString();

            const transaction = await contract.createToken(metadataURL, priceInWei, { value: listingPrice });
            await transaction.wait();

            alert("Successfully listed your NFT!");
            resetForm();
            setMessage("");
            window.location.replace("/");
        } catch (error) {
            console.error("Error during NFT listing:", error);
            setMessage("An error occurred during NFT listing. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2">NFT Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="text"
                        placeholder="Axie#4563"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2">NFT Description</label>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="5"
                        placeholder="Axie Infinity Collection"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2">Price (in ETH)</label>
                    <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="number"
                        placeholder="Min 0.01 ETH"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2">Upload Image (&lt;500 KB)</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        accept="image/*"
                    />
                </div>
                <div className="text-red-500 text-center mt-4">{message}</div>
                <button
                    onClick={listNFT}
                    className="font-bold mt-6 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
                >
                    List NFT
                </button>
            </div>
        </div>
    );
}