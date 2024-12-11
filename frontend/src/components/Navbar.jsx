import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Navbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(()=>{
    if(typeof window.ethereum === "undefined"){
      setError("MetaMask is not installed. Please install it to use this feature.");
      return;
    }
  })
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      if(!isConnected){
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setCurrentAddress(accounts[0]);
        setError(accounts[0]);
        setIsConnected(true);
      }
      else{
        setCurrentAddress(null);
        setError("Disconnected successfully");
        setIsConnected(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  return (
    <div>
      <nav className="w-screen">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
            <Link to="/" className="font-bold text-xl">
              Pet NFT Marketplace
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold mr-10 text-lg">
              <NavItem to="/" label="Marketplace" isActive={location.pathname === "/"} />
              <NavItem to="/CreateNFT" label="List My NFT" isActive={location.pathname === "/sellNFT"} />
              <NavItem to="/profile" label="Profile" isActive={location.pathname === "/profile"} />
              <li>
                <button
                  className={`enableEthereumButton ${
                    isConnected ? "bg-red-500 hover:bg-red-700" : "bg-blue-500 hover:bg-blue-700"
                  } text-white font-bold py-2 px-4 rounded text-sm`}
                  onClick={connectWallet}
                >
                  {isConnected ? "Disconnect" : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="text-white font-bold text-right mr-10 text-sm">
        {currentAddress}
        {error}
      </div>
    </div>
  );
}

// Reusable navigation item component
const NavItem = ({ to, label, isActive }) => (
  <li className={`${isActive ? "border-b-2" : ""} hover:border-b-2 p-2`}>
    <Link to={to}>{label}</Link>
  </li>
);

export default Navbar;
