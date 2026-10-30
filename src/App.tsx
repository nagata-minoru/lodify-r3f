import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { LoadingOverlay } from './LoadingOverlay';
import { TestGLTFComponent } from './TestGLTFComponent';

export const App = () => {
  const [progress, setProgress] = useState<number | null>(null);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <TestGLTFComponent onProgressChange={setProgress} />
      </Canvas>
      <LoadingOverlay progress={progress} />
    </div>
  );
};
