import { Link,useLocation } from 'react-router-dom';
// import '../css/userDashboard.css';

const Sidebar = () => {

  const location = useLocation();


  const isActive =(path)=> {
    return location.pathname === path;
  }

  return (
   <>
   <div className="sidebar bg-light p-3">
          <h5 className="mb-4">Navigation</h5>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link to="/dashboard2" className={`nav-link text-dark ${isActive('/dashboard2') ? 'active' : ''}`}>My Orders</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/alerts" className={`nav-link text-dark ${isActive('/alerts') ? 'active' : ''}`}>Low Stock Alerts</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/Settings" className={`nav-link text-dark ${isActive('/Settings') ? 'active' : ''}`}>Settings</Link>
            </li>
          </ul>
        </div>
   </>
  );
};

export default Sidebar;
