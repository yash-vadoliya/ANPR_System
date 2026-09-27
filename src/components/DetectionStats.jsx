import React from 'react';
import { useGlobalState } from '../context/GlobalStateContext';

export const DetectionStats = () => {
  const { cameras, activeDetections } = useGlobalState();

  const totalDetections = Object.values(activeDetections).flat();
  const summaryCounts = totalDetections.reduce((acc, curr) => {
    acc[curr.class] = (acc[curr.class] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stats-panel">
      <h3>Active Objects Detected</h3>
      <div className="stats-badges">
        {Object.keys(summaryCounts).length === 0 ? (
          <p className="no-data">No objects in view</p>
        ) : (
          Object.entries(summaryCounts).map(([itemClass, count]) => (
            <div key={itemClass} className="badge">
              <span className="badge-class">{itemClass}</span>
              <span className="badge-count">{count}</span>
            </div>
          ))
        )}
      </div>

      <div className="camera-list">
        <h4>Camera Status</h4>
        {cameras.map((c) => {
          const detected = activeDetections[c.id] || [];
          return (
            <div key={c.id} className="camera-row">
              <span>{c.name}</span>
              <span className="count-pill">{detected.length} items</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};