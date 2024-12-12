import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from "ethers";

export default function NFTPage() {
  const { tokenId } = useParams(); // Extract the tokenId from the URL
  const [data, setData] = useState(null);
  const [currAddress, setCurrAddress] = useState(null);
  const [message, setMessage] = useState("");

  const fetchNFTData = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      const contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        provider
      );

      const tokenURI = GetIpfsUrlFromPinata(await contract.tokenURI(tokenId));
      const listedToken = await contract.getListedTokenForId(tokenId);
      const meta = (await axios.get(tokenURI)).data;

      const item = {
        price: ethers.formatUnits(listedToken.price.toString(), "ether"),
        tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        desc: meta.desc,
      };

      setData(item);
      setCurrAddress(address);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    }
  };

  useEffect(() => {
    fetchNFTData();
  }, [tokenId]);

  const buyNFT = async () => {
    if (!data) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );

      const salePrice = ethers.parseUnits(data.price, "ether");
      const transaction = await contract.executeSale(tokenId, { value: salePrice });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      setMessage("");
      fetchNFTData(); // Refresh data after purchase
    } catch (error) {
      console.error("Purchase Error:", error);
      alert("There was an error with the purchase.");
    }
  };

  if (!data) {
    return <div className="text-center text-white">Loading NFT data...</div>;
  }

  const { image, name, desc, price, owner, seller } = data;

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="flex ml-20 mt-20">
        <img src={GetIpfsUrlFromPinata(image)} alt={name} className="w-2/5" />

        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {name}</div>
          <div>Description: {desc}</div>
          <div>Price: <span>{price} ETH</span></div>
          <div>Owner: <span className="text-sm">{owner}</span></div>
          <div>Seller: <span className="text-sm">{seller}</span></div>

          <div>
            {currAddress && currAddress !== owner && currAddress !== seller ? (
              <button
                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={buyNFT}
              >
                Buy this NFT
              </button>
            ) : (
              <div className="text-emerald-700">You are the owner of this NFT</div>
            )}
          </div>

          {message && <div className="text-green text-center mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
}
