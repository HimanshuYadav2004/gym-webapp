import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import AddMember from './pages/AddMember';
import DueMembers from './pages/DueMembers';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import CheckIn from './pages/CheckIn';
import RenewLicense from './pages/RenewLicense';
import PendingApproval from './pages/PendingApproval';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGyms from './pages/admin/AdminGyms';
import AdminGymDetail from './pages/admin/AdminGymDetail';
import Layout from './components/Layout';
import SuperAdminLayout from './components/SuperAdminLayout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  if (user.isSuperAdmin) return <Navigate to="/admin/dashboard" />;
  if (user.licenseStatus === 'pending' || user.licenseStatus === 'rejected') {
    return <Navigate to="/pending-approval" />;
  }
  return <Navigate to="/dashboard" />;
};

const SuperAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!user.isSuperAdmin) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/checkin/:gymOwnerId" element={<CheckIn />} />
          <Route path="/renew" element={<ProtectedRoute><RenewLicense /></ProtectedRoute>} />
          <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="members/add" element={<AddMember />} />
            <Route path="members/:id" element={<MemberDetails />} />
            <Route path="due-members" element={<DueMembers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          <Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/gyms" element={<AdminGyms />} />
            <Route path="admin/gyms/:id" element={<AdminGymDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
