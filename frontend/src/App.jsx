import './App.css';
import MarketPlace from "./components/Marketplace";
import NFTPage from "./components/NFTpage";
import Profile from "./components/Profile";
import CreateNFT from "./components/CreateNFT";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<MarketPlace/>}/>
        <Route path='/nftPage' element={<NFTPage/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/CreateNFT' element={<CreateNFT/>}/>
      </Routes>
    </Router>
  )
}

export default App
