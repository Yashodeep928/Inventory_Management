import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <span className="navbar-brand">User Dashboard</span>
        <button
          className="btn btn-outline-light"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
