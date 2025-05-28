// ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const location = useLocation();
  
  const isAuthenticated = token !== null;
  const hasRequiredRole = !allowedRoles || allowedRoles.includes(userRole);
  
  console.log("ProtectedRoute - Token exists:", !!token);
  console.log("ProtectedRoute - User role:", userRole);
  console.log("ProtectedRoute - Has required role:", hasRequiredRole);
  
  useEffect(() => {
    console.log("ProtectedRoute component mounted");
    return () => {
      console.log("ProtectedRoute component unmounted");
    };
  }, []);
  
  if (!isAuthenticated) {
    console.log("ProtectedRoute - Not authenticated, redirecting to login");
    // Only show toast if we're not already on the login page
    if (location.pathname !== '/') {
      toast.error("Please login to access this page");
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  
  if (!hasRequiredRole) {
    console.log("ProtectedRoute - Not authorized, redirecting to appropriate dashboard");
    toast.error("You don't have permission to access this page");
    
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/MyOrders" replace />;
    }
  }
  
  console.log("ProtectedRoute - Authenticated and authorized, rendering outlet");
  return <Outlet />;
};

export default ProtectedRoute;
