import './App.css';
import { Routes, Route } from 'react-router-dom';
import Reg from './Components/Reg/Reg.jsx';
import Login from './Components/Login/Login.jsx';
import Feed from './Components/Feed/Feed.jsx';
import Product from './Components/Product/Product.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Reg />} />
      <Route path="/login" element={<Login />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/product" element={<Product />} />
    </Routes>
  );
}

export default App;
