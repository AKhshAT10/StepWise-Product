export default function StatusIndicator({ status, loading }) {
  if (loading) {
    return (
      <div className="status-indicator status-loading">
        <span className="status-dot" />
        <span className="status-text">Checking status...</span>
      </div>
    );
  }

  const isOnline = status?.models_loaded;

  return (
    <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}>
      <span className="status-dot" />
      <span className="status-text">
        {isOnline ? 'All models online' : 'Backend offline'}
      </span>
    </div>
  );
}
