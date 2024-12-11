import Navbar from "./Navbar";
import { useState } from "react";
import { ethers } from "ethers";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';

export default function SellNFT() {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [message, setMessage] = useState('');
    const [fileURL, setFileURL] = useState(null);
    function resetForm() {
        setName("");
        setDesc("");
        setPrice(0);
        setFileURL("");
    }

    // Function to upload NFT metadata to IPFS
    async function uploadMetadataToIPFS() {
        // Ensure all fields are filled
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
    }

    // Function to list NFT on the marketplace
    async function listNFT() {
        try {
            // Set loading message
            setMessage("Uploading files... please don't click anything!");

            // Upload the image to IPFS
            const fileResponse = await uploadFileToIPFS(image);
            if (!fileResponse.success) {
                throw new Error("Failed to upload file to IPFS");
            }

            setFileURL(fileResponse.pinataURL);

            // Upload metadata to IPFS
            const metadataURL = await uploadMetadataToIPFS();
            if (!metadataURL) return;

            console.log("Metadata URL:", metadataURL);

            // Interact with the smart contract
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            
            // Convert price to Wei
            const priceInWei = ethers.utils.parseEther("1.0");
            // Fetch listing price
            const listingPrice = (await contract.getListPrice()).toString();

            // Create token and list it on the marketplace
            const transaction = await contract.createToken(metadataURL, priceInWei, { value: listingPrice });
            await transaction.wait();

            // Notify the user and reset the form
            alert("Successfully listed your NFT!");
            resetForm();
            setMessage("");

            // Redirect to the home page
            window.location.replace("/");
        } catch (error) {
            console.error("Error during NFT listing:", error);
            setMessage("An error occurred during NFT listing. Please try again.");
        }
    }

return (
    <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10">
            <div className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
                <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2">NFT Name</label>
                    <input onChange={(e) => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563"></input>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" >NFT Description</label>
                    <textarea onChange={(e) => setDesc(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection"></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2">Price (in ETH)</label>
                    <input onChange={(e) => setPrice(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01"></input>
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" >Upload Image (&lt;500 KB)</label>
                    <input type={"file"} onChange={(e) => setImage(e.target.files[0])}></input>
                </div>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                <button onClick={listNFT} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg" id="list-button">
                    List NFT
                </button>
            </div>
        </div>
    </div>
)
}