import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';
import {
  Activity,
  Layers,
  Sliders,
  Cpu,
  Sun,
  Moon,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Dna,
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pcm_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pcm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const pingServer = async () => {
    const start = performance.now();
    try {
      const response = await checkHealth();
      const end = performance.now();
      setHealth(response.data);
      setLatency(Math.round(end - start));
    } catch {
      setHealth(null);
      setLatency(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pingServer();
    const interval = setInterval(pingServer, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', label: 'Overview', icon: Layers },
    { path: '/assessment', label: 'Patient Assessment', icon: Activity },
    { path: '/sandbox', label: 'Stage Lab', icon: Sliders },
    { path: '/models', label: 'Model Benchmarks', icon: Cpu },
  ];

  return (
    <div className="app-layout">
      {/* Ambient background lighting glow */}
      <div className="ambient-glow" />

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <div className="logo-icon-wrapper">
              <Dna size={22} className="spin-slow" />
            </div>
            <div className="logo-text-block">
              <span className="logo-brand">PrecisionCare AD</span>
              <span className="logo-sub">ADNI Staged Cascade v2.4</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="main-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Health Status Pill */}
            <div className="status-pill" title="Live connection to FastAPI backend">
              <span
                className={`status-beacon ${
                  loading ? 'loading' : health?.status === 'healthy' ? 'online' : 'offline'
                }`}
              />
              <span className="status-text">
                {loading
                  ? 'Connecting...'
                  : health?.status === 'healthy'
                  ? `API Online${latency ? ` (${latency}ms)` : ''}`
                  : 'Backend Offline'}
              </span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">{children}</main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-badges">
            <span className="badge-tag">FastAPI ML Core</span>
            <span className="badge-tag">XGBoost Cascade Ensembles</span>
            <span className="badge-tag">ADNI 1/2/GO Multi-Cohort</span>
            <span className="badge-tag">ARIA Safety Gate Protocol</span>
          </div>
          <p className="footer-disclaimer">
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            <strong>Research & Clinical Decision Support System.</strong> This tool provides probabilistic
            risk stratifications based on machine learning models trained on Alzheimer's Disease Neuroimaging Initiative (ADNI) data.
            It is not intended to replace comprehensive clinical, neurological, or radiological evaluation.
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Precision Care Model • Cascade Screening Protocol • v2.4.0
          </div>
        </div>
      </footer>
    </div>
  );
}
