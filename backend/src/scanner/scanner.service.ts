import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DiscoveredDevice {
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

export interface ScanResult {
  id: string;
  target: string;
  type: 'local' | 'shodan' | 'external';
  status: 'pending' | 'running' | 'completed' | 'failed';
  devices: DiscoveredDevice[];
  startedAt: Date;
  completedAt?: Date;
}

@Injectable()
export class ScannerService {
  private scans: Map<string, ScanResult> = new Map();
  private shodanApiKey: string;

  constructor(private configService: ConfigService) {
    this.shodanApiKey = this.configService.get<string>('SHODAN_API_KEY') || '';
  }

  /**
   * Set Shodan API key
   */
  setShodanKey(apiKey: string): void {
    this.shodanApiKey = apiKey;
  }

  /**
   * Determine scan type based on target
   */
  private determineScanType(target: string): 'local' | 'shodan' | 'external' {
    // Private IP ranges (local network)
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^localhost$/,
    ];
    
    for (const pattern of privateIpPatterns) {
      if (pattern.test(target)) {
        return 'local';
      }
    }

    // If no Shodan key, treat as external (nmap)
    if (!this.shodanApiKey) {
      return 'external';
    }

    // Everything else (public IPs, domains) - use Shodan
    return 'shodan';
  }

  /**
   * Query Shodan for a target (IP or domain)
   */
  private async queryShodan(target: string): Promise<DiscoveredDevice | null> {
    if (!this.shodanApiKey) {
      throw new Error('Shodan API key not configured');
    }

    try {
      // First resolve domain to IP if needed
      let ip = target;
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(target)) {
        // It's a domain, we need to resolve it
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${target}&type=A`);
        const dnsData = await dnsResponse.json();
        if (dnsData.answer && dnsData.answer[0]) {
          ip = dnsData.answer[0].data;
        } else {
          return null;
        }
      }

      // Query Shodan
      const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${this.shodanApiKey}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No data in Shodan - still return basic info
          return {
            ip,
            hostname: target !== ip ? target : undefined,
            deviceType: 'Unknown',
            tags: ['no-shodan-data'],
          };
        }
        throw new Error(`Shodan API error: ${response.status}`);
      }

      const data = await response.json();

      const device: DiscoveredDevice = {
        ip: data.ip_str || ip,
        hostname: data.hostnames?.[0] || (target !== ip ? target : undefined),
        country: data.country_name,
        city: data.city,
        isp: data.isp,
        openPorts: data.ports || [],
        protocols: data.transport ? [data.transport] : [],
        tags: data.tags || [],
      };

      // Extract vulnerabilities
      if (data.vulns) {
        device.vulnerabilities = Object.keys(data.vulns);
      }

      // Determine device type from tags or services
      if (data.tags?.length > 0) {
        const tagMap: Record<string, string> = {
          'webcam': 'Camera',
          'router': 'Router',
          'printer': 'Printer',
          'scada': 'SCADA',
          'iot': 'IoT',
          'ics': 'ICS',
          'database': 'Database',
          'web': 'Web Server',
        };
        
        for (const tag of data.tags) {
          if (tagMap[tag.toLowerCase()]) {
            device.deviceType = tagMap[tag.toLowerCase()];
            break;
          }
        }
      }

      return device;
    } catch (error) {
      console.error('Shodan query error:', error);
      return null;
    }
  }

  /**
   * Scan local network (placeholder - requires Nmap)
   */
  private async scanLocalNetwork(network: string): Promise<DiscoveredDevice[]> {
    console.log(`Local network scan: ${network}`);
    
    // Placeholder - in production, integrate with Nmap
    return [
      {
        ip: network.replace('/24', '.1'),
        deviceType: 'Router',
        openPorts: [80, 443],
      },
    ];
  }

  /**
   * Start a vulnerability scan on a target
   */
  async startScan(target: string): Promise<ScanResult> {
    const scanId = `scan-${Date.now()}`;
    const scanType = this.determineScanType(target);
    
    const scan: ScanResult = {
      id: scanId,
      target,
      type: scanType,
      status: 'running',
      devices: [],
      startedAt: new Date(),
    };
    
    this.scans.set(scanId, scan);
    
    // Run scan asynchronously
    this.runScan(scanId, target, scanType);
    
    return scan;
  }

  /**
   * Get scan results by ID
   */
  getScanResult(scanId: string): ScanResult | undefined {
    return this.scans.get(scanId);
  }

  /**
   * Get all scans
   */
  getAllScans(): ScanResult[] {
    return Array.from(this.scans.values()).sort((a, b) => 
      b.startedAt.getTime() - a.startedAt.getTime()
    );
  }

  /**
   * Configure Shodan API key
   */
  configureShodan(apiKey: string): void {
    this.shodanApiKey = apiKey;
  }

  private async runScan(scanId: string, target: string, scanType: 'local' | 'shodan' | 'external'): Promise<void> {
    try {
      const scan = this.scans.get(scanId);
      if (!scan) return;

      let devices: DiscoveredDevice[] = [];

      switch (scanType) {
        case 'shodan':
          const device = await this.queryShodan(target);
          if (device) {
            devices = [device];
          }
          break;
          
        case 'local':
          devices = await this.scanLocalNetwork(target);
          break;
          
        case 'external':
          // External IP scan without Shodan - basic info only
          devices = [{
            ip: target,
            deviceType: 'Unknown',
            tags: ['external-scan'],
          }];
          break;
      }

      // Update scan with results
      scan.devices = devices;
      scan.status = 'completed';
      scan.completedAt = new Date();
      
      this.scans.set(scanId, scan);
    } catch (error) {
      const scan = this.scans.get(scanId);
      if (scan) {
        scan.status = 'failed';
        this.scans.set(scanId, scan);
      }
    }
  }
}
