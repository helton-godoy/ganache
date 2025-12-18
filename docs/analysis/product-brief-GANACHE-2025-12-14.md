---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['/root/GANACHE/docs/analysis/brainstorming-session-2025-12-14.md']
workflowType: 'product-brief'
lastStep: 1
project_name: 'GANACHE'
user_name: 'Helton'
date: '2025-12-14'
---

# Product Brief: GANACHE

**Date:** 2025-12-14
**Author:** Helton

---

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

GANACHE NAS is a high-availability network storage solution designed to democratize enterprise-grade resilience without the need for specialized proprietary hardware. By leveraging the stability of the Debian ecosystem and a smart "Dual Mode" architecture, GANACHE allows administrators of varying skill levels to deploy robust configurations—from simple ZFS pools to complex HA clusters—using standard hardware. Its native integration with Proxmox Backup Server positions it as a strategic component for modern virtualized environments, prioritizing data safety, flexibility, and user guidance over rigid hardware requirements.

---

## Core Vision

### Problem Statement

Small to medium enterprises and IT administrators face a critical gap in storage solutions: proprietary HA systems are prohibitively expensive and rigid, while "DIY" open-source solutions are complex, risky to configure, and often lack safety rails. This forces non-expert administrators ("Admin Júnior") into a zone of anxiety where a single misconfiguration can lead to data loss or service downtime.

### Problem Impact

- **High Cost/Barrier:** True HA usually requires expensive, specific hardware controllers (downtime cost vs hardware cost).
- **Cognitive Overload:** Complex setups (DRBD, Pacemaker, ZFS) require deep Linux knowledge, increasing the risk of human error.
- **Ecosystem Isolation:** Appliance-based OSs often lock users out of standard package repositories, limiting flexibility and updates.

### Why Existing Solutions Fall Short

- **TrueNAS/Appliances:** Excellent but often push users toward specific hardware for HA or lock down the OS, preventing standard Debian package management.
- **Generic Linux:** Gives total freedom but offers zero guidance ("Safety Gates"), leaving the user prone to critical architecture errors (e.g., using hardware RAID with ZFS).

### Proposed Solution

**GANACHE NAS** provides a "Guided Open Experience". It combines a rigorous backend (Type-Safe System Integration) that enforces architectural safety with a transparent frontend (React) that educates the user.

- **Dual Mode Strategy:** Automatically supports Legacy Hardware (Hardware RAID + DRBD) and Modern Hardware (HBA + Native ZFS).
- **Smart Wizard:** Proactively scans hardware and recommends the safest configuration, abstracting the complexity of HA setup.

### Key Differentiators

1. **HA on Commodity Hardware:** Native High Availability implementation (DRBD/Pacemaker) that works on standard servers, supported by flexible fencing (Software Watchdog/IPMI) rather than requiring specialized SAS interconnects.
2. **Debian Ecosystem Compatibility:** Built on standard Debian, ensuring access to the vast repository of packages, continuous security updates, and a familiar environment for sysadmins.
3. **Proxmox Native Integration:** Designed to plug-and-play with Proxmox Backup Server workflows, optimizing it for virtualized infrastructure protection.

## Target Users

### Primary Users

**"Lucas" - The Junior SysAdmin / Generalist IT**

- **Role:** Sole IT administrator for a SME or branch office. Handles everything from printers to servers.
- **Context:** Under constant time pressure. Has basic Linux knowledge but is intimidated by complex clustering commands (`drbdadm`, `corosync`).
- **Motivation:** Wants to ensure the file server never goes down (backup is his lifeline) but fears breaking the configuration.
- **Success Vision:** Installing a redundant storage cluster in under 30 minutes without ever opening the terminal, feeling like a "Senior Architect".

### Secondary Users

**"Roberto" - The MSP Senior Consultant**

- **Role:** manages infrastructure for 20+ clients.
- **Context:** Needs a repeatable, standard solution. Hates proprietary hardware "black boxes" because spare parts are hard to find quickly.
- **Motivation:** Fast deployment, easy remote troubleshooting, and using standard Proxmox workflows.
- **Value:** "GANACHE lets me charge for HA solutions using standard Dell servers I already have in stock."

**"Silvia" - The CIO / Business Owner**

- **Role:** Budget owner and decision maker.
- **Context:** Tired of increasing licensing fees from big storage vendors and hardware vendor lock-in.
- **Motivation:** Reducing CAPEX (hardware costs) and OPEX (licensing), while ensuring Business Continuity (HA).
- **Value:** " Enterprise reliability without the Enterprise price tag."

### User Journey (Primary: Lucas)

1. **Discovery:** Lucas is asked to set up a resilient file server for the Finance department. He finds GANACHE via Proxmox forums or GitHub.
2. **Onboarding (The "Aha!" Moment):** He boots the ISO on two old Dell R730 servers. The Wizard immediately detects the PERC controllers and says: *"Legacy Hardware Detected. Recommended: Compatibility Mode (HA Cluster)"*. He realizes he doesn't need to buy new HBA cards.
3. **Core Usage:** He sets up the cluster. The dashboard shows "Healthy". He integrates it with Proxmox Backup Server.
4. **Success:** A drive fails a month later. The system alerts him, handles the degradation gracefully, and guides him through the disk replacement. He feels competent and in control.

## Success Metrics

### Business Objectives

1. **Market Disruption (TCO):** Achieve ≥ 50% Total Cost of Ownership reduction compared to proprietary solutions (Dell Unity/TrueNAS Enterprise) over 3 years, driven by licensing and hardware flexibility.
2. **Operational Velocity (Time-to-Value):** Enable non-specialist administrators to go "from box to backup target" in ≤ 30 minutes, drastically reducing deployment costs for MSPs.
3. **User Trust (Reliability):** Achieve Zero Accidental Data Loss incidents due to misconfiguration during the pilot phase, validating the "Safety Gates" architecture.

### Key Performance Indicators

**1. Setup & Deployment Speed (The "Lucas" Metric)**

- **Target:** ≤ 30 Minutes Total Time (Install -> RAID -> Cluster -> Healthy).
- **Measurement:** Telemetry logs from the Wizard start to "Cluster Healthy" state.

**2. User Satisfaction Index (The "Quality" Metric)**

- **Target:** ≥ 4.5/5.0 CSAT Score.
- **Composition:** Weighted average of Ease of Use (25%), Support Quality (20%), and Reliability (10%).
- **Validation:** Implementation survey question: *"How easy was it to configure the system?"*

**3. TCO Reduction (The "Silvia" Metric)**

- **Target:** ≥ 50% Savings vs Enterprise Standard.
- **Formula:** `((TCO_Competitor - TCO_GANACHE) / TCO_Competitor) * 100`
- **Scope:** Includes Licensing (0 for Ganache), Support, and Hardware savings (using Commodity vs Proprietary).

### Monitoring Indicators (Health Check)

- **Support Load:** ≤ 2 tickets/month per system (indicating self-healing/clarity).

- **System Uptime:** ≥ 99.9% availability during pilot.

## MVP Scope

### Core Features (The "Must Haves")

1. **Smart Installation Wizard:**
    - Auto-detection of RAID Controllers vs HBAs.
    - "Recommendation Engine" (Legacy Mode vs Native Mode).
    - Basic Network Setup (Bonding/VLANs).
2. **High-Availability Manager:**
    - Automated DRBD/Pacemaker configuration for 2-node clusters.
    - Quorum/Fence device configuration UI (IPMI/Watchdog).
    - "Split-Brain" auto-recovery for simple cases.
3. **Storage Management:**
    - ZFS Pool creation (Simple UI).
    - SMB/NFS Share creation with Proxmox-optimized presets.
4. **Dashboard & Monitoring:**
    - Traffic Light Health Status (Cluster, Disk, Network).
    - Email Alerts for critical failures (Disk Dead, Node Down).

### Out of Scope for MVP (v1.0)

1. **Multi-site Async Replication:** Complex to manage and test; deferred to v2.0 for Enterprise tier.
2. **Advanced Active Directory Integration:** Users will manage permissions locally or strictly via IP ACLs for MVP.
3. **Web-based File Browser:** Users manage files via SMB/NFS clients, not the Web UI.
4. **S3/Object Storage Gateway:** Focus is on Block/File storage for now.

### MVP Success Criteria

1. **The "30-Minute Rule":** A user can install, cluster, and mount an SMB share in < 30 mins.
2. **Zero Panic:** System successfully blocks a user from creating a ZFS Native pool on a Hardware RAID card.
3. **Proxmox Verified:** Successfully used as a backup target for a Proxmox cluster for 1 week without disconnection.

### Future Vision

- **v1.5:** Active Directory / LDAP support.
- **v2.0:** Multi-site Replication (Async DR) and Cloud Sync.
- **v3.0:** "Ganache Central" - Cloud dashboard to manage multiple Ganache instances (MSP Feature).
