import { useState, useEffect } from 'react';
import './index.css';

interface Device {
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  deviceType?: string;
  openPorts?: number[];
  protocols?: string[];
  isp?: string;
  country?: string;
  city?: string;
  tags?: string[];
  vulnerabilities?: string[];
}

interface Scan {
  id: string;
  target: string;
  type: 'local' | 'shodan' | 'external';
  status: 'pending' | 'running' | 'completed' | 'failed';
  devices: Device[];
  startedAt: string;
  completedAt?: string;
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [target, setTarget] = useState('scanme.shodan.io');
  const [loading, setLoading] = useState(false);
  const [shodanKey, setShodanKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scans`);
      if (res.ok) {
        const data = await res.json();
        setScans(data);
        // Update devices from latest completed scan
        const latestCompleted = data.find((s: Scan) => s.status === 'completed');
        if (latestCompleted) {
          setDevices(latestCompleted.devices);
        }
      }
    } catch (err) {
      console.error('Failed to fetch scans:', err);
    }
  };

  const startScan = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      setTimeout(fetchScans, 2000);
    } catch (err) {
      console.error('Failed to start scan:', err);
    }
    setLoading(false);
  };

  const configureShodan = async () => {
    try {
      await fetch(`${API_URL}/api/scans/shodan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: shodanKey }),
      });
      setShodanKey('');
      setShowSettings(false);
      alert('Shodan API key configured');
    } catch (err) {
      console.error('Failed to configure Shodan:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1>IoT Vulnerability Scanner</h1>
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Shodan API"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0-.33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V5a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9"/>
            </svg>
          </button>
        </div>
        <p className="header-subtitle">Discover IoT devices across local networks and the public internet</p>
      </header>

      {showSettings && (
        <section className="settings-section">
          <div className="section-header">
            <span className="section-title">Shodan API Configuration</span>
          </div>
          <div className="settings-panel">
            <p className="settings-desc">
              Enter your Shodan API key to enable internet-wide scanning. 
              Get a free key at <a href="https://shodan.io" target="_blank" rel="noopener">shodan.io</a>
            </p>
            <div className="settings-form">
              <input
                type="password"
                value={shodanKey}
                onChange={(e) => setShodanKey(e.target.value)}
                placeholder="Shodan API key"
              />
              <button onClick={configureShodan}>Save</button>
            </div>
          </div>
        </section>
      )}

      <section className="scan-section">
        <div className="section-header">
          <span className="section-title">New Scan</span>
          <span className="scan-type-hint">Supports IPs, domains, and CIDR ranges</span>
        </div>
        <div className="scan-panel">
          <div className="scan-form">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter IP, domain, or CIDR (e.g., 8.8.8.8, scanme.shodan.io, 192.168.1.0/24)"
            />
            <button onClick={startScan} disabled={loading}>
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
          <p className="scan-hint">
            Examples: <code>scanme.shodan.io</code> • <code>8.8.8.8</code> • <code>192.168.1.0/24</code>
          </p>
        </div>
      </section>

      <section className="devices-section">
        <div className="section-header">
          <span className="section-title">Discovered Devices</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {devices.length} {devices.length === 1 ? 'device' : 'devices'}
          </span>
        </div>
        
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p className="empty-title">No devices discovered</p>
            <p className="empty-text">Enter a target above to scan for IoT vulnerabilities</p>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device, idx) => (
              <div key={idx} className="device-card">
                <div className="device-header">
                  <span className="device-title">{device.hostname || device.ip}</span>
                  <span className="device-type">{device.deviceType || 'Unknown'}</span>
                </div>
                <div className="device-details">
                  <div className="device-detail">
                    <span className="device-label">IP Address</span>
                    <span className="device-value">{device.ip}</span>
                  </div>
                  <div className="device-detail">
                    <span className="device-label">Location</span>
                    <span className="device-value">{device.city || device.country || 'Unknown'}</span>
                  </div>
                  <div className="device-detail">
                    <span className="device-label">ISP</span>
                    <span className="device-value">{device.isp || 'Unknown'}</span>
                  </div>
                  <div className="device-detail">
                    <span className="device-label">Open Ports</span>
                    <span className="device-value">
                      {device.openPorts?.length > 0 ? device.openPorts.join(', ') : 'None'}
                    </span>
                  </div>
                  {device.vulnerabilities && device.vulnerabilities.length > 0 && (
                    <div className="device-detail vuln">
                      <span className="device-label">Vulnerabilities</span>
                      <span className="device-value vuln-value">
                        {device.vulnerabilities.length} found
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="scans-section">
        <div className="section-header">
          <span className="section-title">Scan History</span>
        </div>
        
        {scans.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <p className="empty-text">No scan history</p>
          </div>
        ) : (
          <div className="scans-list">
            {scans.map((scan) => (
              <div key={scan.id} className="scan-row">
                <div className="scan-row-main">
                  <span className="scan-target">{scan.target}</span>
                  <div className="scan-badges">
                    <span className={`scan-status-pill ${scan.status}`}>
                      <span className="scan-status-dot"></span>
                      {scan.status}
                    </span>
                    <span className="scan-type-pill">{scan.type}</span>
                    <span className="scan-count-pill">
                      {scan.devices.length} {scan.devices.length === 1 ? 'device' : 'devices'}
                    </span>
                  </div>
                </div>
                <div className="scan-meta-right">
                  <span className="scan-time">{formatDate(scan.startedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
