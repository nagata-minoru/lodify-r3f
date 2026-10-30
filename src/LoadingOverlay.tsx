interface ILoadingOverlayProps {
  progress: number | null; // 進捗(0 ~ 100)。null のときは表示しない
}

export const LoadingOverlay = ({ progress }: ILoadingOverlayProps) => {
  if (progress === null) return null;
  return (
    <div className="loading-overlay">
      <div className="loading-text">処理中...</div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-percent">{progress}%</div>
    </div>
  );
};
