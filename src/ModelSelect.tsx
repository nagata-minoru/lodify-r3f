// 選べるモデル(public/ 以下のファイル)
export const MODELS = [{
  filePath: 'human_head.glb', label: '人の頭',
}, {
  filePath: 'Box.glb', label: '箱',
}];

interface IModelSelectProps {
  value: string;      // 選択中のファイルパス
  disabled?: boolean;      // 処理中など、切り替えさせたくないとき true
  onChange: (filePath: string) => void;
}

export const ModelSelect = ({ value, disabled, onChange }: IModelSelectProps) => {
  return (
    <label className="model-select">
      モデル
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {MODELS.map((model) => (
          <option key={model.filePath} value={model.filePath}>
            {model.label} ({model.filePath})
          </option>
        ))}
      </select>
    </label>
  );
};
