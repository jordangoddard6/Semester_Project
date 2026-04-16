import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import FlightDetail from './pages/FlightDetail';
import MyFlights from './pages/MyFlights';
import RidesForOthers from './pages/RidesForOthers';
import GateTimer from './pages/GateTimer';

export default function App() {
  return (
    <ToastProvider>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flight/:id" element={<FlightDetail />} />
        <Route path="/my-flights" element={<MyFlights />} />
        <Route path="/my-pickups" element={<RidesForOthers />} />
        <Route path="/gate-timer" element={<GateTimer />} />
      </Routes>
    </div>
    </ToastProvider>
  );
}
