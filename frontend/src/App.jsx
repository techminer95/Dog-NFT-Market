import './App.css';
import MarketPlace from "./components/Marketplace";
import Navbar from "./components/Navbar";
import NFTPage from "./components/NFTpage";
import Profile from "./components/Profile";
import SellNFT from "./components/SellNFT";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Navbar/>
        <Route path='/' element={MarketPlace}/>
        <Route path='/nftPage' element={NFTPage}/>
        <Route path='/profile' element={Profile}/>
        <Route path='/SellNFT' element={SellNFT}/>
      </Routes>
    </Router>
  )
}

export default App
