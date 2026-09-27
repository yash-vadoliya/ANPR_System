import React, { useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [cameras, setCameras] = useState();
  const [activeDetaction, setActiveDetaction] = useState();
  const [isDetecting, setIsDetacting] = useState();

  const updateCameraDetaction = (cameraId, predictions) => {
    setActiveDetaction((prev) => ({
      ...prev,
      [cameraId]: predictions
    }));
  };

  return (
    <GlobalStateContext.provider
      value={{
        cameras, setCameras, activeDetaction, setActiveDetaction, isDetecting, setIsDetacting
      }}
    >
      {children}
    </GlobalStateContext.provider>
  )
}

export const useGlobalState = () => useContext(GlobalStateContext);

