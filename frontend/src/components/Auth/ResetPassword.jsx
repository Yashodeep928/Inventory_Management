import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import '../css/login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/');
    }
  }, [token, navigate]);

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
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/users/reset-password', {
        token,
        newPassword
      });
      
      toast.success('Password has been reset successfully');
      setResetComplete(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password');
      toast.error('Password reset failed');
      setLoading(false);
    }
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
              <h4 className="text-center mb-4">Reset Your Password</h4>
              
              {!resetComplete ? (
                <>
                  <p className="text-center mb-4">
                    Please enter your new password below.
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                      <span className="input-group-text"><FaLock /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
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
                        placeholder="Confirm New Password"
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
                    {error && <div className="alert alert-danger mb-3">{error}</div>}
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting Password...
                        </span>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="alert alert-success">
                    Your password has been reset successfully!
                  </div>
                  <p>
                    You will be redirected to the login page in a few seconds...
                  </p>
                </div>
              )}
              
              <div className="d-flex justify-content-center mt-4">
                <Link to="/" className="text-decoration-none">
                  <FaArrowLeft className="me-2" /> Back to Login
                </Link>
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

export default ResetPassword; 