import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Logout from './components/Auth/Logout';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserDashboard from './components/User/UserDashboard';
import AddProduct from './components/Admin/AddProduct';
import Sales from './components/Admin/Sales';
import Orders from './components/Admin/Orders';
import Settings from './components/User/Settings';
import LowStockAlerts from './components/User/LowStockAlerts';
import './index.css';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/dashboard2" element={<UserDashboard />} />
            <Route path="/alerts" element={<LowStockAlerts />} />
            <Route path="/Settings" element={<Settings />} />
          </Route>

          {/* Fallback route - redirects to login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
