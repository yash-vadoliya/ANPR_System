import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js/dist/hls.js';;
import { loadModel, drawBoundingBoxes } from '../utils/detector';
import { APP_CONFIG } from '../config/appConfig';
import { useGlobalState } from '../context/GlobalStateContext';

export const CameraFeed = ({ camera }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [isDetecting, updateCameraDetaction] = useGlobalState();

  useEffect(() => {
    let hlsInstance = null;

    const video = videoRef.current;

    if (camera.type === 'webcam') {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: false })
        .then((stream) => {
          if (video) video.srcObject = stream;
        })
        .catch((err) => console.error(`Error opening CCTV Cameras : `, err));
    } else if (camera.type === 'hls' && camera.url) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(camera.url)
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = camera.url;
      }
    }
    return () => {
      if (hlsInstance) hlsInstance.destroy();
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camera]);

  useEffect(() => {
    let isCancelled = false;

    const runInference = async () => {
      const model = await loadModel();
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const detectFrame = async () => {
        if (!isCancelled && isDetecting && video && video.readyState === 4 && canvas) {
          if (canvas.width !== videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          const predictions = await model.detact(video);
          const filtered = predictions.filter(
            (p) => p.score >= APP_CONFIG.CONFIDENCE_THRESHOLD
          );
          const ctx = canvas.getContext('2d');
          drawBoundingBoxes(ctx, filtered, canvas.width, canvas.height);
          updateCameraDetaction(camera.id, filtered);

        }

        if (!isCancelled) {
          animationFrameId.current = requestAnimationFrame(detectFrame);
        }
      };
      detectFrame();
    };

    runInference();

    return () => {
      isCancelled = true;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
  }, [camera.id, isDetecting]);

  return (
    <div className="feed-container">
      <div className="feed-header">
        <span className="live-badge">Live</span>
        <span>{camera.name}</span>
      </div>

      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='video-element'
        >
          <canvas ref={canvasRef} className='canvas-overlay' />
        </video>
      </div>
    </div>
  )
}