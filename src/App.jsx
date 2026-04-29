import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import MapPage from './pages/mapPage';
import Report from './pages/Report';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;