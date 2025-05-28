import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // for navigation
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../config/auth';
import '../css/signup.css'; // import your CSS file

const Signup = () => {
  const navigate = useNavigate(); // React Router hook for navigation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/users/register', { name, email, password });
      toast.success('Registration successful! Please login.');
      navigate('/'); // redirect to login after successful signup
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to sign up');
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
      
      toast.success('Google Sign-up successful!');
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard2');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Google Sign-up failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-up failed');
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
              <h4 className="text-center mb-4">Create an Account</h4>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaUser /></span>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>
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
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                  />
                  <button 
                    type="button"
                    className="input-group-text"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="termsCheck"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="termsCheck">
                    I accept the <a href="#" className="text-decoration-none">Terms of Service</a> and <a href="#" className="text-decoration-none">Privacy Policy</a>
                  </label>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </form>
              
              <div className="text-center mt-3">
                <p className="text-muted mb-2">Or sign up with</p>
                <div className="d-flex justify-content-center mb-3">
                  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      size="large"
                      theme="filled_blue"
                      shape="rectangular"
                      logo_alignment="center"
                      text="signup_with"
                    />
                  </GoogleOAuthProvider>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <span>Already have an account?</span>
                <button
                  className="btn btn-outline-success ms-2"
                  onClick={() => navigate('/')}
                >
                  Go to Login
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

export default Signup;
