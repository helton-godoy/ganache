---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments: 
  - '/root/GANACHE/docs/analysis/product-brief-GANACHE-2025-12-14.md'
  - '/root/GANACHE/docs/analysis/brainstorming-session-2025-12-14.md'
  - '/root/GANACHE/docs/index.md'
  - '/root/GANACHE/docs/project-overview-ganache.md'
  - '/root/GANACHE/docs/architecture/source-tree-analysis.md'
  - '/root/GANACHE/docs/architecture/architecture-backend.md'
  - '/root/GANACHE/docs/architecture/architecture-frontend.md'
  - '/root/GANACHE/docs/architecture/integration-architecture.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 6
workflowType: 'prd'
lastStep: 1
project_name: 'GANACHE'
user_name: 'Helton'
date: '2025-12-14'
---

# Product Requirements Document (PRD)- GANACHE

**Author:** Helton
**Date:** 2025-12-14

**Date:** 2025-12-14

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**Ganache NAS** is a specialized High-Availability Storage Appliance built to solve a critical infrastructure paradox: running modern ZFS-based workloads on legacy enterprise hardware (e.g., Dell PowerEdge 2950 with PERC 6/i) that lacks HBA/Passthrough modules.

Born from the need to utilize existing hardware inventory for robust storage, Ganache implements a **"Pragmatic Architecture"**: it layers ZFS over DRBD (Distributed Replicated Block Device) on top of Hardware RAID volumes. This architecture recovers the data safety lost by the lack of ZFS Self-Heal through synchronous block-level replication (DRBD) and external backup integration (Proxmox Backup Server), governed by a Rust-based middleware that porting the battle-tested logic of TrueNAS Scale to the Proxmox ecosystem.

* **API Pattern:** Dedicated Rust-based **REST API** (Actix-web) to serve the React Frontend, ensuring separation from upstream PBS updates.

## Project Scoping & Phased Development

### MVP Strategy: The "Trustable Appliance"

**Philosophy:** A "Problem-Solving MVP" that prioritizes data safety and compliance.
**Key Architectural Pivot:** Configuration State is managed via a **Git-Driven Backend**, providing native versioning, diffs, and attribution for every system change.

### Phase 1: The "Ganache Appliance" (MVP / v1.0)

**Core Value:** Zero-Touch HA Storage for Legacy Hardware.

* **Infrastructure:**
  * ZFS over DRBD 9 (2-Node HA) on PERC 6/i.
  * Boot Environment Support (GRUB Integration).
  * Smart Hardware Detection (Wizard).
* **Config & Audit Engine (New):**
  * **Git-Backed Config:** All system state (Network, Shares, Users) stored in a local Git repo.
  * **Config Time-Machine:** UI to view "Config Diffs" and Rollback to any previous state.
  * **Attribution:** Commit authors mapped to AD Users/Admins.
  * Visual Audit Manager (Samba Logs).
* **Access:**
  * SMB Shares (AD Integrated).
  * SSH with "Deep Bash Audit".
* **Backup:**
  * Integrated Proxmox Backup Client.

### Phase 2: The "MSP Fleet Manager" (v1.5)

* **Templating Engine:** Import/Export via Git bundle support.
* **Centralized Dashboard:** Fleet health aggregation.

### Phase 3: The "Universal Storage OS" (v2.0)

* **Native ZFS Support** (HBA/JBOD).
* **Native ZFS Support** (HBA/JBOD).
* **Object Storage Gateway.**

### Risk Mitigation Strategy

* **Technical Risk (Git Config):** Use a robust Rust git library (git2/libgit2) to ensure transactional integrity of config writes.
* **Market Risk (Hardware Aging):** Validate performance on standard 10GbE to prove "Life Extension" value concretely.
* **Resource Risk:** Lean on existing Proxmox code (Reuse `proxmox-backup-client`) to reduce dev scope.

## Functional Requirements

### FR Area 1: System Intialization & Lifecycle ("The Wizard")

* FR1: User can trigger "Pragmatic Mode" wizard to automatically configure ZFS-over-DRBD on PERC 6/i controllers.

* FR2: System must auto-tune ZFS ARC size based on detected RAM (16GB vs 32GB) range.
* FR3: User can select a previous Ganache System Version from the GRUB Boot Menu to rollback a failed update (Implementation Note: Must follow TrueNAS Boot Environment logic).

### FR Area 2: Storage & High Availability

* FR4: System can sustain a single-node power loss with <30s failover time (RTO).

* FR5: System must enforce a 90% Hard Quota on the ZFS Pool to prevent CoW lockup.
* FR6: User can create/delete ZFS Datasets for file sharing separation.

### FR Area 3: Configuration & Versioning ("Git Engine")

* FR7: System must record every configuration change (Network, Users, Shares) as a Git commit.

* FR8: Administrator can view a timeline of configuration changes (Who, When, What).
* FR9: Administrator can "Rollback" the system configuration to any previous Git commit from the UI.

### FR Area 4: Compliance & Auditing

* FR10: Auditor Users (Permission Restricted) can search/filter file access logs via the "Visual Audit Manager".

* FR11: System must log all SSH command executions with timestamps and usernames ("Deep Bash Audit").
* FR12: Administrator can enable a "Break-Glass" local admin account for emergency access during AD failure.

### FR Area 5: Access & Integration

* FR13: User can join the appliance to an Active Directory Domain via the UI.

* FR13: User can join the appliance to an Active Directory Domain via the UI.
* FR14: System must map AD Groups to SMB Share Permissions implementing the **TrueNAS NFSv4 ACL logic** to ensure compatibility.

## Non-Functional Requirements (NFRs)

### Performance & Efficiency

* **NFR1 (SMB Throughput):** System must saturate a 1GbE network link (110MB/s) for sequential large file writes (verifying ZFS-over-DRBD overhead is negligible).
* **NFR2 (Boot Time):** Appliance must boot from "Power On" to "Ready" (Shares Accessible) in < 3 minutes on Dell 2950 hardware.
* **NFR3 (Resource Cap):** Middleware + OS must not exceed 4GB RAM usage, leaving remaining RAM for ZFS ARC.

### Reliability & Availability

* **NFR4 (Failover Speed):** High Availability failover (Resource Migration) must complete in < 30 seconds upon primary node failure.
* **NFR5 (Recovery):** A clear "Split Brain" degraded state must be visible in the UI if the cluster interconnect fails.

### Security & Compliance

* **NFR6 (Audit Integrity):** Audit logs must be immutable (User cannot edit them via UI).
* **NFR7 (SSH Session):** All interactive SSH sessions must display a "This system is audited" banner upon login.

### Usability (The "Educational" Metric)

* **NFR8 (Wizard Clarity):** 100% of "Destructive Actions" (Formatting Disks) must require a typed confirmation ("CONFIRM").
* **NFR9 (Error Messages):** Errors must provide a "Human Readable" explanation + a "Technical Code" for the logs.

### What Makes This Special

1. **The "Pragmatic Architecture" (ZFS over DRBD):** Enables ZFS features (Compression, Snapshots, SMB Shadow Copy) on Hardware RAID controllers by offloading redundancy to the network layer (DRBD/Pacemaker), enabling HA on "deprecated" hardware.
2. **TrueNAS Logic / Proxmox Core:** Re-implements critical TrueNAS middleware logic (SMB/NFSv4 ACLs, Active Directory joins) in **Rust**, running on a pristine Debian/Proxmox Backup Server base.
3. **"Backup-First" Design:** Acts as a specialized PBS Client, treating its own storage pool as a backup source that streams incrementally to an external PBS target, compensating for legacy hardware risks.

## Project Classification

**Technical Type:** Infrastructure Appliance (Rust Backend + React UI)
**Domain:** Enterprise Storage / High Availability
**Complexity:** **High** (Kernel-level interactions, Cluster State Machine, Filesystem Engineering)
**Project Context:** Brownfield (Extending Proxmox Backup Server ecosystem)

## Success Criteria

### User Success

1. **Velocity:** "Software Setup in 30 Minutes" (Install → Cluster → Healthy).
2. **Competence (The "Senior Architect" Feeling):** Users report feeling confident to repeat the process.
    * *Metric:* UI includes "Educational Tooltips" explaining the "Why" behind every "What" (e.g., *“We are creating a DRBD resource to replicate blocks synchronously...”*).

### Business Success

1. **Adoption:** 100% detailed conversion of available inventory (All 6 Dell PowerEdge 2950 servers deployed successfully).
2. **Operational Efficiency:** Support load < 2 tickets/week total for the cluster fleet.

### Technical Success

1. **Resilience (RTO):** Service Failover (SMB/IP migration) completed in **< 30 seconds**.
2. **Performance:** Throughput capable of saturating 1GbE links fully, with best-effort optimization for 10GbE (limitations of PERC 6/i acknowledged).

### Measurable Outcomes

* **Adoption Rate:** 6/6 Servers Converted.
* **Deployment Time:** < 30 mins/cluster.
* **Failover Time:** < 30 seconds.

## Product Scope

### MVP - Minimum Viable Product (The "Ganache Appliance")

* **Core:** Hybrid Architecture (Rust Middleware + React UI) on Proxmox 8 base.
* **Storage:** ZFS over DRBD 9 (2-Node HA) for PERC 6/i hardware.
* **Access:** SMB Shares with Active Directory Integration (winbind).
* **Safety:** Smart Wizard with "Safe Config" rails and Educational Explanations.
* **Backup:** Native integration as a Proxmox Backup Client (incremental sends to external PBS).

### Growth Features (Post-MVP)

* **Advanced Networking:** VLAN Management UI, full 10GbE optimization tuning.
* **Multi-Cluster:** Management of multiple Ganache clusters from a single "Center" view.

### Vision (Future)

* **Universal NAS:** Support for HBA/JBOD hardware (Native ZFS) utilizing the same UI, making Ganache the unified OS for both legacy and modern hardware.

## User Journeys

### Journey 1: Lucas & The "Fearless Friday" Deploy (Primary User)

**Persona:** Junior SysAdmin | **Goal:** Zero Data Loss | **Frustration:** Intimidated by HA complexity.
Lucas has a stack of 6 Dell 2950s gathering dust. He's terrified of configuring HA because last time he tried Pacemaker manually, he corrupted a database. He boots Ganache. The **Smart Wizard** instantly detects the PERC 6/i controller, checks the BBU health, and recommends "Pragmatic Mode" (ZFS over DRBD). He clicks "Next", and instead of a black box, he sees **Educational Tooltips** explaining *why* the system is creating a DRBD resource. 25 minutes later, the dashboard turns green. To test it, he physically pulls a network cable. The ping drops for just 10 seconds before the service migrates. He feels like a genius and leaves for the weekend without anxiety.

### Journey 2: Roberto's "Cookie Cutter" Fleet (Secondary User)

**Persona:** MSP Consultant | **Goal:** Standardized Deployments | **Frustration:** Inconsistent client hardware.
Roberto manages 5 dental clinics with varying hardware. He needs a reliable, repeatable storage standard. He uses Ganache's **Config Export** feature to create a "Clinic Standard" template. On a new site, he installs Ganache, uploads the template, and simply joins the local Active Directory. He configures the **Proxmox Backup Client** to stream encrypted backups to his central office. He now has a unified view of all client storage health without VPNing into each site, thanks to the email alerts from the core dashboard.

### Journey 3: Silvia's Budget Review (Business Stakeholder)

**Persona:** CIO/Owner | **Goal:** Reduce CAPEX | **Frustration:** High cost of proprietary SANs.
Silvia is reviewing a $40k quote for a new storage array. She compares it with the Ganache pilot report from Lucas: "0 downtime incidents, $0 hardware cost (reused assets), 100% backup compliance". She realizes Ganache has turned her "e-waste" into enterprise-grade infrastructure. She approves the full rollout and reallocates the $40k savings to hire a much-needed developer.

### Journey Requirements Summary

* **Smart Hardware Detection:** Must identify PERC controllers and BBU status automatically.
* **Educational UI:** Wizards must explain actions, not just perform them (Empowerment).
* **Resilience Testing:** System must handle physical cable pulls gracefully (RTO < 30s).
* **Templating:** Config export/import for rapid MSP deployment.
* **Remote Monitoring:** Email alerts/Dashboard for health status.

## Domain-Specific Requirements

### Healthcare (HIPAA) & Enterprise Compliance Overview

Driven by the "Roberto" (MSP) persona deploying to Dental Clinics, Ganache must support **HIPAA-grade accountability** without forcing high-friction encryption workflows. The system focuses on **Auditability** and **Access Continuity** as its primary compliance pillars.

### Key Domain Concerns

* **Auditability:** Every file access, modification, or deletion must be traceable to a specific user.
* **Access Continuity:** In critical scenarios (e.g., AD Server failure during a patient emergency), local admin access must be guaranteed ("Break-Glass").
* **Usability of Compliance:** Non-technical staff (e.g., Clinic Managers) must be able to read audit logs without CLI skills.

### Compliance Requirements

1. **Samba Full Audit:** System must enable `vfs_full_audit` on SMB shares to track all file operations.
2. **Visual Audit Manager (UX):**
    * **Requirement:** A dedicated UI view that parses raw Samba logs into a human-readable table.
    * **Features:** Filters for "Who", "What", "When", and "File Name".
    * **Access Control:** The Audit UI is a restricted module, visible *only* to users with the specific "Audit Viewer" permission/module active.
1. **Samba Full Audit:** System must enable `vfs_full_audit` on SMB shares to track all file operations.
2. **Visual Audit Manager (UX):**
    * **Requirement:** A dedicated UI view that parses raw Samba logs into a human-readable table.
    * **Features:** Filters for "Who", "What", "When", and "File Name".
    * **Access Control:** The Audit UI is a restricted module, visible *only* to users with the specific "Audit Viewer" permission/module active.
3. **Emergency "Break-Glass" Admin:**
    * **Requirement:** Capability to create/enable a local emergency admin account that bypasses AD authentication, ensuring access to data if the Domain Controller is unreachable.

### Implementation Considerations

* **Audit Log Volume:** The backend must handle log rotation and parsing efficiency (e.g., storing parsed logs in a lightweight local DB like SQLite for the UI to query fast) to avoid performance degradation.
* **Separation of Duties:** The "Audit Viewer" permission should be granular, allowing a distinct auditor role Separate from the "Storage Admin".

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **The "Pragmatic ZFS Stack":** Decoupling ZFS Data Integrity (Checksums) from ZFS Redundancy (Mirror/RAIDZ).
    * *Concept:* Using ZFS purely as a Volume Manager/Filesystem on top of a Network RAID (DRBD), allowing "Illegal" hardware configurations (PERC 6/i) to run safely.
2. **"Box-to-Backup" Appliance Model:** Transforming a general-purpose OS (Debian) into a single-purpose "Backup Target Appliance" via a specialized wizard, effectively creating a "Proxmox Backup Appliance" from scrap parts.

### Market Context

* **Status Quo:** Users typically throw away PERC 6/i servers or run LVM/EXT4 (losing snapshots/checksums).
* **Ganache Innovation:** Brings Enterprise Storage Features (ZFS) to "Obsolete" Hardware.

### Validation Approach

* **The "Cable Pull" Test:** Proving that Network Redundancy (DRBD) saves the data when Local Redundancy (RAID) lies about cache safety.
* **Performance Benchmarking:** Verifying that ZFS-over-DRBD overhead is acceptable for SMB workloads.

```
