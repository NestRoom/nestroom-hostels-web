import { useState, useRef, useEffect } from 'react';
import styles from './AttendanceCamera.module.css';

export default function AttendanceCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setLoading(false);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
        setLoading(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    
    // Stop the stream after capturing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const retake = async () => {
    setCapturedImage(null);
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err) {
      setError("Could not restart camera.");
      setLoading(false);
    }
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Identity Verification</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.cameraContainer}>
          {error ? (
            <div className={styles.errorState}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={onClose}>Close & Try Again</button>
            </div>
          ) : (
            <>
              {!capturedImage ? (
                <div className={styles.videoWrapper}>
                  {loading && <div className={styles.loader}>Initializing Camera...</div>}
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={styles.video}
                    style={{ display: loading ? 'none' : 'block' }}
                  />
                  <div className={styles.guide}>
                    <div className={styles.faceFrame}></div>
                    <p>Position your face within the frame</p>
                  </div>
                </div>
              ) : (
                <div className={styles.previewWrapper}>
                  <img src={capturedImage} alt="Captured" className={styles.preview} />
                  <div className={styles.successBadge}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Photo Captured
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          {!capturedImage ? (
            <button 
              className={styles.captureBtn} 
              onClick={takePhoto}
              disabled={loading || !!error}
            >
              <div className={styles.innerCircle}></div>
            </button>
          ) : (
            <div className={styles.actionBtns}>
              <button className={styles.retakeBtn} onClick={retake}>
                Retake Photo
              </button>
              <button className={styles.confirmBtn} onClick={confirm}>
                Use This Photo
              </button>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
