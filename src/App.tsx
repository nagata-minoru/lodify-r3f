import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { LoadingOverlay } from './LoadingOverlay';
import { MODELS, ModelSelect } from './ModelSelect';
import { TestGLTFComponent } from './TestGLTFComponent';

export const App = () => {
  const [filePath, setFilePath] = useState(MODELS[0].filePath);
  const [progress, setProgress] = useState<number | null>(null);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <TestGLTFComponent filePath={filePath} onProgressChange={setProgress} />
      </Canvas>
      <ModelSelect value={filePath} disabled={progress !== null} onChange={setFilePath} />
      <LoadingOverlay progress={progress} />
    </div>
  );
};
