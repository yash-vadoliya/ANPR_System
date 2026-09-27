import React, { useState } from 'react';
import { CCTV_BRAND_TEMPLATES } from '../../config/cameraTemplates';

export const AddCameraModal = ({ onAddCamera, onClose }) => {
  const [brand, setBrand] = useState('dahua_cpplus');
  const [name, setName] = useState('');
  const [ip, setIp] = useState('192.168.1.108');
  const [user, setUser] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [port, setPort] = useState(554);
  const [isTestWebcam, setIsTestWebcam] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();

    let generatedRtspUrl = '';
    const template = CCTV_BRAND_TEMPLATES[brand];

    if (!isTestWebcam && template) {
      // Generate standard RTSP URL based on camera brand
      generatedRtspUrl = template.mainStream(ip, user, password, port);
    }

    // PRINT RTSP URL IN BROWSER CONSOLE
    console.log('%c[ANPR Camera Connection]', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
    console.log('%cCamera Name: ' + (name || 'Camera 1'), 'color: #10b981;');
    console.log('%cBrand: ' + (isTestWebcam ? 'USB/Laptop Webcam' : template?.name), 'color: #f59e0b;');
    console.log('%cRTSP URL: ' + (isTestWebcam ? 'webcam://local' : generatedRtspUrl), 'color: #ef4444; font-weight: bold;');

    onAddCamera({
      id: `cam_${Date.now()}`,
      name: name || `${template?.name || 'Camera'} - ${ip}`,
      brand: isTestWebcam ? 'Webcam / USB' : template?.name,
      isWebcam: isTestWebcam,
      rtspUrl: generatedRtspUrl
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-body" onSubmit={handleSave}>
        <h3>Connect CCTV Camera</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isTestWebcam}
              onChange={(e) => setIsTestWebcam(e.target.checked)}
            />
            Use Local USB Webcam (Test Mode)
          </label>
        </div>

        {!isTestWebcam && (
          <>
            <label>Camera Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              {Object.entries(CCTV_BRAND_TEMPLATES).map(([key, item]) => (
                <option key={key} value={key}>{item.name}</option>
              ))}
            </select>

            <label>Camera Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Gate Entry" required />

            <label>IP Address</label>
            <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.108" required />

            <label>Username</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} required />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <label>RTSP Port</label>
            <input type="number" value={port} onChange={(e) => setPort(e.target.value)} />
          </>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="save-btn">Connect & Start Stream</button>
        </div>
      </form>
    </div>
  );
};