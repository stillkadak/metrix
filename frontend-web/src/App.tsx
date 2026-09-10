import type { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanHistory from './pages/ScanHistory';
import ScanDetailPage from './pages/ScanDetail';
import Reports from './pages/Reports';
import ProductsPage from './pages/Products';
import ViolationsPage from './pages/Violations';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import AppLayout from './components/common/AppLayout';
import { useAppSelector } from './store/hooks';

function RequireAuth({ children }: { children: ReactElement }) {
  const token = useAppSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan/new" element={<NewScan />} />
          <Route path="/scans" element={<ScanHistory />} />
          <Route path="/history" element={<Navigate to="/scans" replace />} />
          <Route path="/scans/:scanId" element={<ScanDetailPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/violations" element={<ViolationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
