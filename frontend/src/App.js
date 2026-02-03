import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegLog from './Components/Login/RegLog.jsx';

function App() {
  return (
    <Routes>
      <Route path="/reglog" element={<RegLog />} />
    </Routes>
  );
}

export default App;
