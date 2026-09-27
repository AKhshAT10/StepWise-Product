export default function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClass = `spinner-${size}`;
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className={`spinner ${sizeClass}`} />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}
