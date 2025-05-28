import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active nav item based on current path
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">
        <a className="navbar-brand" href="#">Inventory Management</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} 
                to="/dashboard"
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/add-product') ? 'active' : ''}`} 
                to="/add-product"
              >
                Purchase
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/sales') ? 'active' : ''}`} 
                to="/sales"
              >
                Sales
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/orders') ? 'active' : ''}`} 
                to="/orders"
              >
                Orders
              </Link>
            </li>
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn btn-outline-light ms-3"
                title="Logout"
              >
                <FiLogOut />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 