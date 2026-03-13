import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import './index.css';
import { TestGLTFComponent } from './TestGLTFComponent';
import reportWebVitals from './reportWebVitals';

const App = () => {
  const [progress, setProgress] = useState<number | null>(null);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <TestGLTFComponent onProgressChange={setProgress} />
      </Canvas>
      {progress !== null && (
        <div className="loading-overlay">
          <div className="loading-text">処理中...</div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-percent">{progress}%</div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
