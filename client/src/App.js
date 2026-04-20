import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, AdminAuthContext } from './context/AdminAuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import DashboardLayout from './components/DashboardLayout';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ReportIssue from './pages/student/ReportIssue';
import MyReports from './pages/student/MyReports';
import Profile from './pages/student/Profile';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ManageReports from './pages/staff/ManageReports';
import ApproveReports from './pages/staff/ApproveReports';
import SustainabilityAnalytics from './pages/staff/SustainabilityAnalytics';
import MonthlyUsage from './pages/staff/MonthlyUsage';
import AddMonthlyUsage from './pages/staff/AddMonthlyUsage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AllReports from './pages/admin/AllReports';
import DatabaseManagement from './pages/admin/DatabaseManagement';
import SystemSettings from './pages/admin/SystemSettings';
import AddAdmin from './pages/admin/AddAdmin';
import UserLogin from './pages/admin/UserLogin';
import MonthlyUsageTracker from './pages/admin/MonthlyUsageTracker';
import BlockAssignment from './pages/admin/BlockAssignment';
import LoginQrCode from './pages/admin/LoginQrCode';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';

const ProtectedRoute = ({ children, allowedTypes }) => {
  const { user, loading } = useAuth();
  const { admin } = useContext(AdminAuthContext);

  if (loading) return <div className="flex vh-100 align-items-center justify-center">Loading...</div>;
  
  // High Priority: System Admin can access ANY protected route
  if (admin) return children;

  // If standard user is logged in, enforce their role
  if (user) {
    if (allowedTypes && !allowedTypes.includes(user.user_type)) return <Navigate to="/home" replace />;
    return children;
  }

  return <Navigate to="/login" replace />;
};

const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useContext(AdminAuthContext);
  const { user } = useAuth();

  if (loading) return <div className="flex vh-100 align-items-center justify-center">Loading...</div>;
  
  // Allow if admin
  if (admin) return children;
  
  return <Navigate to="/login" replace />;
};

const DashboardRedirect = () => {
  const { user, loading: userLoading } = useAuth();
  const { admin, loading: adminLoading } = useContext(AdminAuthContext);

  if (userLoading || adminLoading) return <div className="flex vh-100 align-items-center justify-center">Loading...</div>;

  // 1. Prioritize explicit user sessions
  if (user) {
    switch (user.user_type) {
      case 'student': return <Navigate to="/student/dashboard" replace />;
      case 'staff': return <Navigate to="/staff/dashboard" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  // 2. Default to admin dashboard if no user session is active (since admin is auto-logged in)
  if (admin) return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'glass-card text-small fw-bold border-0 shadow-lg',
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: 'var(--eco-text)',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px'
              },
              success: {
                iconTheme: { primary: 'var(--eco-primary)', secondary: 'white' }
              }
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<DashboardRedirect />} />
            <Route path="/" element={<DashboardRedirect />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedTypes={['student']}><DashboardLayout><StudentDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/report" element={<ProtectedRoute allowedTypes={['student']}><DashboardLayout><ReportIssue /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/my-reports" element={<ProtectedRoute allowedTypes={['student']}><DashboardLayout><MyReports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedTypes={['student']}><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedTypes={['staff']}><DashboardLayout><StaffDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/staff/manage-reports" element={<ProtectedRoute allowedTypes={['staff']}><DashboardLayout><ManageReports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/staff/approve-reports" element={<ProtectedRoute allowedTypes={['staff']}><DashboardLayout><ApproveReports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/staff/analytics" element={<ProtectedRoute allowedTypes={['staff']}><DashboardLayout><SustainabilityAnalytics /></DashboardLayout></ProtectedRoute>} />
            <Route path="/staff/monthly-usage" element={<ProtectedRoute allowedTypes={['staff']}><DashboardLayout><MonthlyUsage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/staff/add-usage" element={<ProtectedRoute allowedTypes={['staff']}><DashboardLayout><AddMonthlyUsage /></DashboardLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/manage-users" element={<ProtectedAdminRoute><DashboardLayout><UserManagement /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/all-reports" element={<ProtectedAdminRoute><DashboardLayout><AllReports /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/system-settings" element={<ProtectedAdminRoute><DashboardLayout><SystemSettings /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/database" element={<ProtectedAdminRoute><DashboardLayout><DatabaseManagement /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/add-admin" element={<ProtectedAdminRoute><DashboardLayout><AddAdmin /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/user-login" element={<ProtectedAdminRoute><DashboardLayout><UserLogin /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/usage-tracker" element={<ProtectedAdminRoute><DashboardLayout><MonthlyUsageTracker /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/block-assignments" element={<ProtectedAdminRoute><DashboardLayout><BlockAssignment /></DashboardLayout></ProtectedAdminRoute>} />
            <Route path="/admin/login-qr" element={<ProtectedAdminRoute><DashboardLayout><LoginQrCode /></DashboardLayout></ProtectedAdminRoute>} />

            {/* Redirects */}
            <Route path="/student" element={<Navigate to="/student/dashboard" />} />
            <Route path="/staff" element={<Navigate to="/staff/dashboard" />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
