// Login.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../css/login.css';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../config/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Log component mount and navigation info
  useEffect(() => {
    console.log('Login component mounted or updated');
    
    // Clear token if login page is accessed
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    return () => {
      console.log('Login component unmounting');
    };
  }, [location]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      console.log('Login successful, received data:', data);
      
      // Store token and user role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      
      toast.success(`Welcome back, ${data.user.name}!`);
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard2');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the token to your backend for verification
      const response = await axios.post('http://localhost:5000/api/users/google-auth', {
        credential: credentialResponse.credential
      });
      
      // Handle successful login
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userName', response.data.user.name);
      
      toast.success(`Welcome, ${response.data.user.name}!`);
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard2');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">Inventory Management System</h3>
            </div>
            <div className="card-body p-4">
              <h4 className="text-center mb-4">Welcome Back</h4>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <button 
                    type="button"
                    className="input-group-text"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <div>
                    <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </span>
                  ) : (
                    <><FaSignInAlt className="me-2" /> Login</>
                  )}
                </button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </form>
              
              <div className="text-center mt-3">
                <p className="text-muted mb-2">Or log in with</p>
                <div className="d-flex justify-content-center mb-3">
                  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      size="large"
                      theme="filled_blue"
                      shape="rectangular"
                      logo_alignment="center"
                      text="signin_with"
                    />
                  </GoogleOAuthProvider>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <span>Don't have an account?</span>
                <button
                  className="btn btn-outline-primary ms-2"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </div>
            </div>
            <div className="card-footer text-center py-3 bg-light">
              <div className="small">
                &copy; {new Date().getFullYear()} Inventory Management System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
