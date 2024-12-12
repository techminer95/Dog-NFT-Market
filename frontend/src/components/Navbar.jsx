import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { setCookieFunction, getCookie } from "../utils";

function Navbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    setIsConnected(getCookie("Connect") === "true");
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      if (!isConnected) {
        const accounts = await provider.send("eth_requestAccounts", []);
        const account = accounts[0];

        setCurrentAddress(account);
        setIsConnected(true);
        setCookieFunction("Connect", true);
        setError("");
      } else {
        setCurrentAddress("");
        setIsConnected(false);
        setCookieFunction("Connect", false);
        setError("Disconnected successfully.");
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  return (
    <div>
      <nav className="w-screen">
        <ul className="flex items-center justify-between py-3 bg-transparent text-white pr-5">
          <li className="ml-5 pb-2">
            <Link to="/" className="font-bold text-xl">
              Pet NFT Marketplace
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold text-lg">
              <NavItem to="/" label="Marketplace" />
              <NavItem to="/CreateNFT" label="List My NFT" />
              <NavItem to="/profile" label="Profile" />
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
        {currentAddress && <span>Connected: {currentAddress}</span>}
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </div>
  );
}

// Reusable navigation item component
const NavItem = ({ to, label }) => (
  <li className="hover:border-b-2 p-2">
    <Link to={to}>{label}</Link>
  </li>
);

export default Navbar;