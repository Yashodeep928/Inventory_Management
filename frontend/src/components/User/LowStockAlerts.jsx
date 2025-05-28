import Sidebar from '../User/Sidebar';
import Navbar from '../User/Navbar';
import '../css/userDashboard.css';

const LowStockAlerts = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="main-content flex-grow-1 p-5">

          <h2 className="mb-4">Low Stock Alerts</h2>

          <div className="alert-settings-section mb-5">
            <h4>⚠️ Alert Settings</h4>
            <form>
              <div className="form-group mb-3">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter minimum stock level"
                />
              </div>

              <div className="form-group mb-3">
                <label>Measurement Unit</label>
                <select className="form-control">
                  <option>Pieces</option>
                  <option>Kilograms</option>
                  <option>Liters</option>
                </select>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enableEmailAlert"
                />
                <label className="form-check-label" htmlFor="enableEmailAlert">
                  Email me when stock goes below threshold
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Save Settings
              </button>
            </form>
          </div>

        </main>
      </div>
    </div>
  );
};

export default LowStockAlerts;
