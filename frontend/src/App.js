import './App.css';
import { Routes, Route } from 'react-router-dom';
import Reg from './Components/Reg/Reg.jsx';
import Login from './Components/Login/Login.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Reg />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
