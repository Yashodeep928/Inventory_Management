import Sidebar from '../User/Sidebar';
import Navbar from '../User/Navbar';
import '../css/userDashboard.css';

const Settings = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="main-content flex-grow-1 p-5">

    <h2 className="mb-4">Settings</h2>

    <div className="settings-section mb-5">
      <h4>👤 Profile Settings</h4>
      <form>
        <div className="form-group mb-3">
          <label>Full Name</label>
          <input type="text" className="form-control" placeholder="" />
        </div>
        <div className="form-group mb-3">
          <label>Email</label>
          <input type="email" className="form-control" placeholder="" />
        </div>
        <div className="form-group mb-3">
          <label>Change Password</label>
          <input type="password" className="form-control" placeholder="" />
        </div>
      </form>
    </div>

    <div className="settings-section mb-5">
      <h4>📦 Inventory Preferences</h4>
      <form>
        <div className="form-group mb-3">
          <label>Low Stock Alert Threshold</label>
          <input type="number" className="form-control" placeholder="" />
        </div>
        <div className="form-group mb-3">
          <label>Unit</label>
          <select className="form-control">
            <option>Pieces</option>
            <option>Kilograms</option>
            <option>Liters</option>
          </select>
        </div>
      </form>
    </div>

    <div className="settings-section mb-5">
      <h4>🔔 Notification Settings</h4>
      <form>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" id="lowStockAlert" />
          <label className="form-check-label" htmlFor="lowStockAlert">
            Email me on low stock
          </label>
        </div>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" id="expiryAlert" />
          <label className="form-check-label" htmlFor="expiryAlert">
            Alert me before item expiry
          </label>
        </div>
      </form>
    </div>

    <div className="settings-section mb-5">
      <h4>🔐 Security Settings</h4>
      <form>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" id="2fa" />
          <label className="form-check-label" htmlFor="2fa">
            Enable Two-Factor Authentication
          </label>
        </div>
      </form>
    </div>
        </main>
      </div>
    </div>
  )
}

export default Settings;

