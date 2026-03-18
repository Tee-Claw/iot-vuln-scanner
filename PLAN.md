# IoT Vulnerability Scanner - Project Plan

## Overview
A tool to discover and scan IoT devices on local networks AND the public internet using Shodan API.

## Features

### Phase 1: Network Discovery
- [x] Local network scanning (Nmap integration)
- [x] Public IP/domain scanning via Shodan
- Device fingerprinting
- MAC address vendor lookup

### Phase 2: Vulnerability Scanning
- [x] Shodan vulnerability data
- Port scanning
- Service version detection
- CVE matching

### Phase 3: CVE Integration
- CVE database lookup
- Vulnerability severity scoring
- Remediation recommendations

### Phase 4: Reporting
- Web dashboard
- PDF reports
- Export results

## Supported Targets

### Local Network
- CIDR ranges: `192.168.1.0/24`
- Private IPs: `192.168.1.1`, `10.0.0.1`

### Public Internet
- Public IPs: `8.8.8.8`, `1.1.1.1`
- Domains: `scanme.shodan.io`, `google.com`
- Uses Shodan API for enrichment

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │Dashboard│  │ Scans   │  │ Devices │  │ Settings   │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘ │
│       └────────────┴────────────┴──────────────┘        │
│                            │                             │
│                     ┌──────▼──────┐                      │
│                     │  REST API   │                      │
│                     └──────┬──────┘                      │
└────────────────────────────┼──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                   BACKEND (NestJS)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Scan Module │  │ Device Module │  │Report Module │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                            │                             │
│              ┌─────────────┴─────────────┐               │
│              │    Scanner Service      │                │
│              │  (Shodan + Local)       │                │
│              └─────────────┬─────────────┘               │
└────────────────────────────┼──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                    EXTERNAL APIS                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │ Shodan  │  │ DNS     │  │ Nmap    │                  │
│  │ API     │  │ Google  │  │ (local) │                  │
│  └─────────┘  └─────────┘  └─────────┘                  │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** NestJS + TypeScript
- **Scanner:** Nmap (local) + Shodan API (public)
- **Deployment:** Docker + GCP Cloud Run

## API Endpoints

- `POST /api/scans` - Start a new scan
- `GET /api/scans` - List all scans
- `GET /api/scans/:id` - Get scan details
- `PUT /api/scans/shodan` - Configure Shodan API key

## Usage

### Configure Shodan
Get a free API key from https://shodan.io and configure via:
1. Settings button in dashboard
2. Or set `SHODAN_API_KEY` in .env

### Scan Targets
- **Local:** `192.168.1.0/24`
- **Public IP:** `8.8.8.8`
- **Domain:** `scanme.shodan.io`

## Security Considerations
- Authentication required for API
- Rate limiting on scan endpoints
- Network isolation for local scanning
- Encrypted storage of API keys
