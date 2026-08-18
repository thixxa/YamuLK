import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import Explore from './pages/Explore';
import DestinationDetail from './pages/DestinationDetail';
import TripPlanner from './pages/TripPlanner';
import Budget from './pages/Budget';
import RoutePlanner from './pages/RoutePlanner';
import Weather from './pages/Weather';
import SavedTrips from './pages/SavedTrips';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/planner" element={<TripPlanner />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/route" element={<RoutePlanner />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/saved" element={<SavedTrips />} />
        <Route path="/profile" element={<Profile />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
