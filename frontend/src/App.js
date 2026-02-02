import './App.css';
import { Routes, Route } from 'react-router-dom';
import Register from './Components/Login/Register.jsx';

function App() {
  return (
    <Routes>
      <Route path="/reg" element={<Register />} />
    </Routes>
  );
}

export default App;
