# lodify-r3f

3DモデルのLOD（Level of Detail）化をブラウザ上でリアルタイムに確認できるデモアプリケーションです。

## 概要

GLBファイルを読み込み、Three.jsの `SimplifyModifier` を使ってポリゴン削減を行い、元のモデルとLOD化済みモデルを並べて比較表示します。

## デモ

https://nagata-minoru.github.io/lodify-r3f

## 技術スタック

- React 18 + TypeScript
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) — Three.js の React バインディング
- [@react-three/drei](https://github.com/pmndrs/drei) — 3D ヘルパーコンポーネント集
- Three.js `SimplifyModifier` — ポリゴン削減

## 機能

- GLB形式の3Dモデルを読み込み
- 指定した削減率（`simModRatio`）でポリゴンを段階的に削減
- 元モデルとLOD化済みモデルを左右に並べて比較
- ワイヤーフレーム表示オプション
- 高さ自動スケール調整

## セットアップ

```bash
npm install
npm start
```

[http://localhost:3000](http://localhost:3000) で起動します。

## テスト

```bash
# 一回だけ実行して終了
CI=true npm test

# ウォッチモード（ファイル変更を監視して自動実行）
npm test
```

ウォッチモードの主なキー操作:

| キー | 動作 |
|------|------|
| `a` | 全テストを実行 |
| `f` | 失敗したテストだけ再実行 |
| `q` | 終了 |
| `p` | ファイル名で絞り込み |
| `t` | テスト名で絞り込み |

### テストの内容

`src/MyGltfLoader.test.ts` — `MyGltfLoader` 関数のユニットテスト

- `gltf` と `simModObj` を含む結果を返すこと
- `simModObj` の子に `Mesh` が含まれること
- `onProgress` コールバックが 0〜100 の範囲で呼ばれること
- `onProgress` を渡さなくてもエラーにならないこと

## ビルド & デプロイ

```bash
# プロダクションビルド
npm run build

# GitHub Pages へデプロイ
npm run deploy
```

## `MyGltfLoader` の使い方

```typescript
MyGltfLoader({
  filePath: "model.glb",   // public/ 以下のファイルパス
  height: 1.5,             // モデルの高さ（省略時はリサイズなし）
  simModRatio: 0.01,       // ポリゴン削減率 0〜1（小さいほど削減量が多い）
  shadows: true,           // 影の有効化
  isWireFrame: true,       // ワイヤーフレーム表示
  maxIteration: 10,        // 1回の処理で削減する最大面数の上限ステップ数
})
```
