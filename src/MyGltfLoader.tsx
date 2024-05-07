import {
  Mesh,
  Object3D,
  BufferGeometry,
  Material,
  DoubleSide,
  BufferAttribute,
  Box3,
  MeshStandardMaterial,
  MathUtils,
  Euler
} from "three";

import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier";

export interface IGLTFLoaderProps {
  filePath: string;      // ファイルパス
  height?: number;      // 変更したい高さ
  simModRatio?: number;      // ポリゴンの削減率(0 ~ 1) デフォルト0.5
  shadows?: boolean;       // 影をつけるか
  isWireFrame?: boolean;       // ワイヤーフレームにするか
  rotation?: Euler;       // 回転する場合に指定 デフォルトで 1/2πをX軸で回転
  maxIteration?: number;      // 一度に削減する数
  onCallback?: (e?: any) => void;
}

// 親コンポーネントに返す値
export interface IGLTFLoadData {
  gltf: GLTF;
  simModObj: Object3D;
}

interface IIterativeModParam {
  decimationFaceCount: number; // 削減したい三角形の数
  geometry: BufferGeometry; // ジオメトリ
  updateCallback?: (geometry: BufferGeometry) => void;
}

export const MyGltfLoader = async (props: IGLTFLoaderProps): Promise<IGLTFLoadData> => {

  /**
   * 初期値
   */
  var myMesh = new Mesh();
  const material = new MeshStandardMaterial({ wireframe: true, color: 0xff0000 });
  material.flatShading = true
  material.side = DoubleSide;
  const modifier = new SimplifyModifier();
  const MAX_FACE_COUNT_PER_ITERATION = props.maxIteration ? props.maxIteration : 2500; // １度に処理する最大削減数

  /**
   *　ベース：https://github.com/AndrewSink/3D-Low-Poly-Generator/tree/main
   * @param params
   */
  const iterativeModifier = (params: IIterativeModParam): BufferGeometry => {
    let modifierInProgress = true;
    let modifierProgressPercentage = 0;
    // 三角面数のカウント
    let startingFaceCount = params.geometry.attributes.position.count;
    // 現在の三角面数
    let currentFaceCount = startingFaceCount;
    // 変更後の三角面数
    let targetFaceCount = startingFaceCount - params.decimationFaceCount;
    let totalFacesToDecimate = startingFaceCount - targetFaceCount;
    let remainingFacesToDecimate = currentFaceCount - targetFaceCount;

    let iterationFaceCount = currentFaceCount - MAX_FACE_COUNT_PER_ITERATION;

    let simplifiedGeometry = params.geometry.clone();
    while (iterationFaceCount > targetFaceCount) {
      simplifiedGeometry = modifier.modify(simplifiedGeometry, MAX_FACE_COUNT_PER_ITERATION);
      if (params.updateCallback) params.updateCallback(simplifiedGeometry);
      currentFaceCount = simplifiedGeometry.attributes.position.count;
      iterationFaceCount = currentFaceCount - MAX_FACE_COUNT_PER_ITERATION;
      remainingFacesToDecimate = currentFaceCount - targetFaceCount;
      modifierProgressPercentage = Math.floor(((totalFacesToDecimate - remainingFacesToDecimate) / totalFacesToDecimate) * 100);
    }

    try {
      let tmpGeo = simplifiedGeometry.clone();
      tmpGeo = modifier.modify(tmpGeo, currentFaceCount - targetFaceCount);
      if (tmpGeo.drawRange.count === Infinity) {
        console.log("(Three.js) No Next Vertex Error: \n頂点検出エラーのため飛ばします");
      }
      else simplifiedGeometry = tmpGeo
    }
    catch (e) { }

    if (params.updateCallback) params.updateCallback(simplifiedGeometry);
    modifierProgressPercentage = 100;
    modifierInProgress = false;

    return simplifiedGeometry;
  }

  /**
   * ジオメトリの統合
   * @param geometry1
   * @param geometry2
   * @returns
   */
  const mergeBufferGeometry = (geometry1: BufferGeometry, geometry2: BufferGeometry): BufferGeometry => {
    // 頂点属性のオフセット
    var offset = geometry1.attributes.position.count;

    // 頂点属性を結合する
    var positions1 = geometry1.attributes.position.array;
    var positions2 = geometry2.attributes.position.array;
    var mergedPositions = new Float32Array(positions1.length + positions2.length);
    mergedPositions.set(positions1, 0);
    mergedPositions.set(positions2, positions1.length);

    // 法線を結合する
    var normals1 = geometry1.attributes.normal.array;
    var normals2 = geometry2.attributes.normal.array;
    var mergedNormals = new Float32Array(normals1.length + normals2.length);
    mergedNormals.set(normals1, 0);
    mergedNormals.set(normals2, normals1.length);

    // UVを結合する
    var uvs1 = geometry1.attributes.uv.array;
    var uvs2 = geometry2.attributes.uv.array;
    var mergedUVs = new Float32Array(uvs1.length + uvs2.length);
    mergedUVs.set(uvs1, 0);
    mergedUVs.set(uvs2, uvs1.length);

    // マージ済みの頂点属性を新しいバッファジオメトリに設定する
    var mergedGeometry = new BufferGeometry();
    mergedGeometry.setAttribute('position', new BufferAttribute(mergedPositions, 3));
    mergedGeometry.setAttribute('normal', new BufferAttribute(mergedNormals, 3));
    mergedGeometry.setAttribute('uv', new BufferAttribute(mergedUVs, 2));

    // インデックスを結合する
    var indices1 = (geometry1.index as BufferAttribute).array;
    var indices2 = (geometry2.index as BufferAttribute).array;
    var mergedIndices = new (indices1.length > 65535 ? Uint32Array : Uint16Array)(indices1.length + indices2.length);
    mergedIndices.set(indices1, 0);
    for (var i = 0; i < indices2.length; i++) {
      mergedIndices[indices1.length + i] = indices2[i] + offset;
    }

    // マージ済みのインデックスを新しいバッファジオメトリに設定する
    mergedGeometry.setIndex(new BufferAttribute(mergedIndices, 1));

    return mergedGeometry;
  }


  return new Promise((resolve) => {

    const loader = new GLTFLoader();
    let geometry: BufferGeometry;
    loader.load(
      props.filePath,
      async (gltf: GLTF) => {
        // ジオメトリの取得処理
        let mat: Material[] = [];
        console.log("GLTFモデルの中身を確認");
        console.log(gltf.scene);

        gltf.scene.traverse((node: Object3D | Mesh) => {
          if ((node as Mesh).isMesh && node instanceof Mesh) {
            const mesh: Mesh = node.clone();
            if (props.isWireFrame) node.material = material;// 強制敵にWireFrameに変換
            else {
              if (node.material) {
                if (node.material instanceof Material) {
                  mat.push(node.material.clone())
                }
                else if (node.material instanceof Array) {
                  node.material.map(m => mat.push(m.clone()));
                }
              }
            };
            if (!geometry) {
              geometry = mesh.geometry.clone();
              geometry.uuid = MathUtils.generateUUID(); //別のUUIDとして生成
            }
            else {
              geometry = mergeBufferGeometry(geometry, mesh.geometry.clone());
            }
            node.castShadow = props.shadows ? true : false;
            node.receiveShadow = props.shadows ? true : false;
          }
        });

        let bbox = new Box3().setFromObject(gltf.scene.clone());
        let baseHeight = bbox.max.y - bbox.min.y;
        if (props.height) {
          // 高さが入力されていれば、その高さに合うようにリサイズする
          const nh = baseHeight;
          const ns = props.height / nh;
          console.log("デフォルトサイズ: ", nh, "スケールサイズ: ", ns);
          gltf.scene.scale.multiplyScalar(ns);
          bbox = new Box3().setFromObject(gltf.scene.clone());
          baseHeight = bbox.max.y - bbox.min.y;
          console.log("リサイズ後の高さサイズ: ", baseHeight)
        }

        // 空のMeshにセットする
        if (props.isWireFrame) {
          myMesh.material = material;
        }
        else {
          // 元のマテリアルデータを適応させる
          myMesh.material = mat;
          // ※ジオメトリを統合しているので、正しいマテリアルを付与できない。どうすればいいか。

        }
        myMesh.geometry = geometry;
        var tempGeometry = new Mesh();
        tempGeometry.geometry = geometry;
        geometry.computeVertexNormals();
        myMesh.geometry.center();
        if (props.rotation) {
          myMesh.rotation.copy(props.rotation);
        }
        else {
          myMesh.rotation.x = 90 * Math.PI / 180;
        }
        myMesh.geometry.computeBoundingBox();
        tempGeometry.position.copy(myMesh.position);

        tempGeometry.geometry = modifier.modify(geometry, 0);
        myMesh.geometry = modifier.modify(geometry, 0);
        console.log('変換前:頂点数:', ((myMesh.geometry.attributes.position.count * 6) - 12));
        console.log('変換前:三角数:', ((myMesh.geometry.attributes.position.count * 6) - 12) / 3);

        const simModRate = props.simModRatio ? props.simModRatio : 0.5;
        const count = Math.floor(myMesh.geometry.attributes.position.count * simModRate);
        console.log("削減ポリゴン数: ", count);
        const newGeometory = iterativeModifier({
          decimationFaceCount: myMesh.geometry.attributes.position.count * simModRate,
          geometry: myMesh.geometry
        });
        myMesh.geometry = newGeometory;
        console.log('変換後:頂点数:', ((newGeometory.attributes.position.count * 6) - 12));
        console.log('変換後:三角数:', ((newGeometory.attributes.position.count * 6) - 12) / 3);

        const conbox = new Box3().setFromObject(myMesh);
        console.log("conbox", conbox);
        const conHeight = conbox.max.y - conbox.min.y;
        console.log("[高さ差分確認] ポリゴン削減前モデルの高さ: ", baseHeight, " ポリゴン削減後モデルの高さ：", conHeight);

        // 高さを合わせる
        myMesh.scale.multiplyScalar(baseHeight / conHeight);
        myMesh.position.y = ((bbox.max.y - bbox.min.y) / 2);

        // SimpiferModifierで自動LODを実施
        let simModObj = new Object3D();
        simModObj.add(myMesh);

        console.log("正常にモデルのロードが完了しました。");

        return resolve(
          {
            gltf: gltf,
            simModObj: simModObj
          }
        )
      },
      (xhr: any) => {
        // ロード率を計算してCallbackで返す　後日記述
      },
      (err: any) => {
        console.error("3Dモデルロード中にエラーが出ました");
        throw "[モデルロードエラー]モデルのパスや設定を確認してください。";
      }
    );
  });
}
