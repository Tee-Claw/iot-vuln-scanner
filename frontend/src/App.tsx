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
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scans`);
      const data = await res.json();
      setScans(data);
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

  return (
    <div className="app">
      <header>
        <h1>🔐 IoT Vulnerability Scanner</h1>
      </header>

      <main>
        <section className="scan-section">
          <h2>Start New Scan</h2>
          <div className="scan-form">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Network (e.g., 192.168.1.0/24)"
            />
            <button onClick={startScan} disabled={loading}>
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </section>

        <section className="devices-section">
          <h2>Discovered Devices ({devices.length})</h2>
          <div className="devices-grid">
            {devices.length === 0 ? (
              <p className="empty">No devices found. Run a scan to discover devices.</p>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="device-card">
                  <h3>{device.hostname || device.ip}</h3>
                  <p>IP: {device.ip}</p>
                  <p>MAC: {device.mac}</p>
                  <p>Vendor: {device.vendor || 'Unknown'}</p>
                  <p>Type: {device.deviceType || 'Unknown'}</p>
                  <p>Ports: {device.openPorts?.join(', ') || 'None'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="scans-section">
          <h2>Scan History</h2>
          <div className="scans-list">
            {scans.length === 0 ? (
              <p className="empty">No scans yet.</p>
            ) : (
              scans.map((scan) => (
                <div key={scan.id} className={`scan-card ${scan.status}`}>
                  <h3>Target: {scan.target}</h3>
                  <p>Status: {scan.status}</p>
                  <p>Devices found: {scan.devices.length}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
