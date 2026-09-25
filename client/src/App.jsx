import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import CreateReport from './pages/CreateReport';
import ReportDetails from './pages/ReportDetails';
import AdminDashboard from './pages/AdminDashboard';

function DashboardRoute() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/reports/new" element={<CreateReport />} />
      <Route path="/reports/:id/edit" element={<CreateReport />} />
      <Route path="/reports/:id" element={<ReportDetails />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
