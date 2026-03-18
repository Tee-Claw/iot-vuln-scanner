import { useState, useEffect } from 'react';

interface Device {
  id: string;
  ip: string;
  mac: string;
  hostname?: string;
  vendor?: string;
  deviceType?: string;
  openPorts: number[];
}

interface Scan {
  id: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  devices: Device[];
  startedAt: string;
  completedAt?: string;
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [target, setTarget] = useState('192.168.1.0/24');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchDevices();
    fetchScans();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/devices`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scans`);
      if (res.ok) {
        const data = await res.json();
        setScans(data);
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
      setTimeout(fetchScans, 1000);
    } catch (err) {
      console.error('Failed to start scan:', err);
    }
    setLoading(false);
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1>IoT Vulnerability Scanner</h1>
        </div>
        <p className="header-subtitle">Discover internet-connected IoT assets and review scan findings</p>
      </header>

      <section className="scan-section">
        <div className="section-header">
          <span className="section-title">New Scan</span>
        </div>
        <div className="scan-panel">
          <div className="scan-form">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter target (CIDR, IP, or hostname)"
            />
            <button onClick={startScan} disabled={loading}>
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
          <p className="scan-hint">Accepted formats: 192.168.1.0/24, 192.168.1.1, hostname.local</p>
        </div>
      </section>

      <section className="devices-section">
        <div className="section-header">
          <span className="section-title">Discovered Devices</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {devices.length} device/devices
          </span>
        </div>
        
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p className="empty-title">No devices discovered</p>
            <p className="empty-text">Run a scan to discover IoT devices on your network</p>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device) => (
              <div key={device.id} className="device-card">
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
                    <span className="device-label">MAC Address</span>
                    <span className="device-value">{device.mac}</span>
                  </div>
                  <div className="device-detail">
                    <span className="device-label">Vendor</span>
                    <span className="device-value">{device.vendor || 'Unknown'}</span>
                  </div>
                  <div className="device-detail">
                    <span className="device-label">Open Ports</span>
                    <span className="device-value">
                      {device.openPorts?.length > 0 ? device.openPorts.join(', ') : 'None'}
                    </span>
                  </div>
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
            <p className="empty-text">No scans yet</p>
          </div>
        ) : (
          <div className="scans-list">
            {scans.map((scan) => (
              <div key={scan.id} className="scan-card">
                <div className="scan-info">
                  <span className="scan-target">{scan.target}</span>
                </div>
                <div className="scan-meta">
                  <span className={`scan-status ${scan.status}`}>
                    {scan.status}
                  </span>
                  <span className="scan-count">
                    {scan.devices.length} device{scan.devices.length !== 1 ? 's' : ''}
                  </span>
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
