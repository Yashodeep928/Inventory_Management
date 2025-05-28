import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import '../css/login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Log the request for debugging
      console.log('Sending request to:', 'http://localhost:5000/api/users/forgot-password');
      console.log('With email:', email);
      
      const { data } = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      
      console.log('Response received:', data);
      toast.success('Password reset instructions sent to your email');
      setEmailSent(true);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset instructions. Please check if the server is running and email is configured correctly.');
      toast.error(err.response?.data?.message || 'Failed to send reset instructions');
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
              <h4 className="text-center mb-4">Forgot Password</h4>
              
              {!emailSent ? (
                <>
                  {/* <div className="alert alert-info mb-4"> */}
                    {/* <FaInfoCircle className="me-2" /> */}
                    {/* <strong>Note:</strong> You need to configure a valid email service in the backend to receive the reset link. */}
                    {/* <ul className="mt-2 mb-0"> */}
                      {/* <li>Set EMAIL_USER and EMAIL_PASSWORD in backend/.env file</li>
                      <li>For Gmail, you may need to use an App Password</li> */}
                    {/* </ul> */}
                  {/* </div> */}
                  <p className="text-center mb-4">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
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
                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Instructions'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="alert alert-success">
                    <h5>Email Sent!</h5>
                    <p>Check your email for password reset instructions</p>
                  </div>
                  <div className="alert alert-warning mt-3">
                    <h5>Email Not Received?</h5>
                    <p>If you don't receive an email:</p>
                    <ol className="text-start">
                      <li>Check your spam folder</li>
                      <li>Verify email configuration in the backend</li>
                      <li>Make sure you used the correct email</li>
                    </ol>
                    <p className="mt-3">
                      <strong>Note for developers:</strong> Check server logs for email sending status.
                    </p>
                  </div>
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

export default ForgotPassword; 