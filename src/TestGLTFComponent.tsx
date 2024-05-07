import { useEffect, useState } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { MyGltfLoader } from "./MyGltfLoader";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Object3D } from "three";

export const TestGLTFComponent = () => {
  const [gltf, setGLTF] = useState<GLTF>();
  const [lowObj, setLowObj] = useState<Object3D>();
  useEffect(() => {
    (async () => {
      // const filePath = "human_head.glb";
      const filePath = "Box.glb";
      const loadGlbModel = await MyGltfLoader({
        filePath: filePath,
        height: 1.5,
        simModRatio: 0.9,
        shadows: true,
        isWireFrame: true
      });
      setGLTF(loadGlbModel.gltf);
      setLowObj(loadGlbModel.simModObj);
    })()
  }, [])
  return (
    <>
      {gltf &&
        <mesh position={[-1, -1, 0]}>
          <primitive object={gltf.scene} />
        </mesh>
      }
      {lowObj &&
        <mesh position={[1, -1, 0]}>
          <primitive object={lowObj} />
        </mesh>
      }
      <OrbitControls/>
      <Environment preset="dawn" background blur={0.7} />
      <directionalLight position={[100, 100, 100]} intensity={0.8} castShadow />
    </>
  );
}
