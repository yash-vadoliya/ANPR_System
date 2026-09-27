import React from 'react';
import { useGlobalState } from './context/GlobalStateContext';
import { CameraFeed } from './components/CameraFeed';
import { DetectionStats } from './components/DetectionStats';

export const App = () => {
  const { cameras, isDetecting, setIsDetecting } = useGlobalState();

  return (
    <div className="app-layout">
      <header className="navbar">
        <h2>VisionAI - Surveillance Monitor</h2>
        <div className="controls">
          <button
            className={`btn ${isDetecting ? 'btn-stop' : 'btn-start'}`}
            onClick={() => setIsDetecting(!isDetecting)}
          >
            {isDetecting ? 'Pause Inference' : 'Resume Inference'}
          </button>
        </div>
      </header>

      <main className="content-area">
        <div className="grid-container">
          {cameras.map((camera) => (
            <CameraFeed key={camera.id} camera={camera} />
          ))}
        </div>
        <aside className="sidebar">
          <DetectionStats />
        </aside>
      </main>
    </div>
  );
};