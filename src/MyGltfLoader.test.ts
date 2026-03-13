import { BufferGeometry, BufferAttribute, Mesh, Object3D } from 'three';
import { MyGltfLoader } from './MyGltfLoader';

// 簡易ジオメトリ（9頂点・3三角形）
function makeGeometry(): BufferGeometry {
  const geo = new BufferGeometry();
  const positions = new Float32Array([
    0, 0, 0,  1, 0, 0,  0, 1, 0,
    0, 0, 1,  1, 1, 0,  1, 0, 1,
    0, 1, 1,  1, 1, 1,  0.5, 0.5, 0.5,
  ]);
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('normal', new BufferAttribute(new Float32Array(9 * 3), 3));
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(9 * 2), 2));
  geo.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8]), 1));
  return geo;
}

function mockMakeGltf() {
  const scene = new Object3D();
  scene.add(new Mesh(makeGeometry()));
  return {
    scene,
    animations: [],
    cameras: [],
    asset: { version: '2.0' },
    scenes: [],
    userData: {},
    parser: {} as any,
  };
}

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: class {
    load(_path: string, onLoad: Function) {
      onLoad(mockMakeGltf());
    }
  },
}));

jest.mock('three/examples/jsm/modifiers/SimplifyModifier', () => ({
  SimplifyModifier: class {
    modify(geo: BufferGeometry) {
      return geo.clone();
    }
  },
}));

describe('MyGltfLoader', () => {
  test('gltf と simModObj を含む結果を返す', async () => {
    const result = await MyGltfLoader({ filePath: 'test.glb' });
    expect(result.gltf).toBeDefined();
    expect(result.simModObj).toBeInstanceOf(Object3D);
  });

  test('simModObj の子に Mesh が含まれる', async () => {
    const result = await MyGltfLoader({ filePath: 'test.glb' });
    expect(result.simModObj.children.length).toBeGreaterThan(0);
    expect(result.simModObj.children[0]).toBeInstanceOf(Mesh);
  });

  test('onProgress コールバックが呼ばれ、値が 0〜100 の範囲', async () => {
    const onProgress = jest.fn();
    await MyGltfLoader({ filePath: 'test.glb', onProgress });
    expect(onProgress).toHaveBeenCalled();
    for (const [value] of onProgress.mock.calls) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  test('onProgress を渡さなくてもエラーにならない', async () => {
    await expect(MyGltfLoader({ filePath: 'test.glb' })).resolves.toBeDefined();
  });
});
