import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { CameraTile } from './components/CameraTile';
import { AddCameraModal } from './components/AddCameraModal';
import { initANPR } from './services/anprEngine';
import './app.css';

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isLoggedIn') === 'true'
  );

  // Load cameras from localStorage so they remain saved until the user explicitly deletes them
  const [cameras, setCameras] = useState(() => {
    const saved = localStorage.getItem('cctv_cameras');
    return saved ? JSON.parse(saved) : [];
  });

  const [detectedPlates, setDetectedPlates] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('cctv_cameras', JSON.stringify(cameras));
  }, [cameras]);

  useEffect(() => {
    if (isAuthenticated) {
      initANPR();
    }
  }, [isAuthenticated]);

  const handleAddCamera = (newCam) => {
    setCameras((prev) => [...prev, newCam]);
  };

  const handleDeleteCamera = (cameraId) => {
    setCameras((prev) => prev.filter((c) => c.id !== cameraId));
  };

  const handlePlateDetected = (plateData) => {
    setDetectedPlates((prev) => {
      if (prev.length > 0 && prev[0].plateNumber === plateData.plateNumber) {
        return prev;
      }
      return [plateData, ...prev.slice(0, 49)];
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Calculate layout: full-size if 1 camera, grid if multiple
  const gridClass =
    cameras.length === 1
      ? 'camera-grid single-camera'
      : cameras.length === 2
        ? 'camera-grid two-cameras'
        : 'camera-grid multi-cameras';

  return (
    <div className="app-container">
      <header className="topbar">
        <h2>Smart ANPR Surveillance Desktop System</h2>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add Camera
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className={gridClass}>
          {cameras.length === 0 ? (
            <div className="empty-prompt">
              No cameras active. Click <strong>"+ Add Camera"</strong> to add an RTSP feed.
            </div>
          ) : (
            cameras.map((cam) => (
              <CameraTile
                key={cam.id}
                camera={cam}
                onPlateDetected={handlePlateDetected}
                onDeleteCamera={handleDeleteCamera}
              />
            ))
          )}
        </div>

        <aside className="sidebar-log">
          <h3>Detected License Plates</h3>
          <div className="log-list">
            {detectedPlates.length === 0 ? (
              <p className="no-plates">No vehicle plates scanned yet</p>
            ) : (
              detectedPlates.map((item, idx) => (
                <div key={idx} className="log-item">
                  <div className="log-plate">{item.plateNumber}</div>
                  <div className="log-details">
                    <span>{item.type}</span> • <span>{item.cameraName}</span> • <span>{item.detectedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {showModal && (
        <AddCameraModal
          onAddCamera={handleAddCamera}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};