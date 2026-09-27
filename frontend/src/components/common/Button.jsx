import { useState } from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
}) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `btn btn-${variant} btn-${size}`;
  const stateClasses = [
    disabled || loading ? 'btn-disabled' : '',
    fullWidth ? 'btn-full-width' : '',
    isPressed ? 'btn-pressed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={`${baseClasses} ${stateClasses}`}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  );
}
