---
stepsCompleted: [1, 2]
inputDocuments: 
  - docs/analysis/prd.md
  - docs/architecture.md
  - docs/ux-design-specification.md
---

# GANACHE - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for GANACHE, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can trigger "Compatibility Mode" wizard to automatically configure ZFS-over-DRBD on PERC 6/i controllers.
FR2: System must auto-tune ZFS ARC size based on detected RAM (16GB vs 32GB) range.
FR3: User can select a previous Ganache System Version from the GRUB Boot Menu to rollback a failed update.
FR4: System can sustain a single-node power loss with <30s failover time (RTO).
FR5: System must enforce a 90% Hard Quota on the ZFS Pool to prevent CoW lockup.
FR6: User can create/delete ZFS Datasets for file sharing separation.
FR7: System must record every configuration change (Network, Users, Shares) as a Git commit.
FR8: Administrator can view a timeline of configuration changes (Who, When, What).
FR9: Administrator can "Rollback" the system configuration to any previous Git commit from the UI.
FR10: Auditor Users (Permission Restricted) can search/filter file access logs via the "Visual Audit Manager".
FR11: System must log all SSH command executions with timestamps and usernames ("Deep Bash Audit").
FR12: Administrator can enable a "Break-Glass" local admin account for emergency access during AD failure.
FR13: User can join the appliance to an Active Directory Domain via the UI.
FR14: System must map AD Groups to SMB Share Permissions implementing the TrueNAS NFSv4 ACL logic.

### NonFunctional Requirements

NFR1: (SMB Throughput) System must saturate a 1GbE network link (110MB/s) for sequential large file writes.
NFR2: (Boot Time) Appliance must boot from "Power On" to "Ready" in < 3 minutes on Dell 2950 hardware.
NFR3: (Resource Cap) Middleware + OS must not exceed 4GB RAM usage.
NFR4: (Failover Speed) High Availability failover must complete in < 30 seconds upon primary node failure.
NFR5: (Recovery) A clear "Split Brain" degraded state must be visible in the UI if the cluster interconnect fails.
NFR6: (Audit Integrity) Audit logs must be immutable (User cannot edit them via UI).
NFR7: (SSH Session) All interactive SSH sessions must display a "This system is audited" banner upon login.
NFR8: (Wizard Clarity) 100% of "Destructive Actions" must require a typed confirmation ("CONFIRM").
NFR9: (Error Messages) Errors must provide a "Human Readable" explanation + a "Technical Code".

### Additional Requirements

From Architecture:

- Initialize project using T3-Lite scaffold (Next.js, tRPC, Tailwind) via `npm create t3-app@latest`.
- Implement security model using sudo allow-list in `/etc/sudoers.d/ganache`.
- Implement Real-time state synchronization via Short Polling (2-5s) using React Query.
- Implement "Panic Mode" recovery flow for emergency failover.
- API Strategy: Use tRPC + React Query for Type-Safe API layer.
- Components to be implemented in `src/components/features` (Smart) vs `src/components/ui` (Dumb).

From UX Design:

- Implement "Ganache SAFE" theme (Slate Blue/Emerald) with Dark Mode support.
- Implement Custom Component: Server Blade Card (with drag & drop).
- Implement Custom Component: Twin-View Sync Ring (Visualizing DRBD/ZFS health).
- Implement Custom Component: Zpool Topology Tree (Visual VDEV hierarchy).
- Ensure WCAG AA compliance (Accessibility).
- Setup Wizard must be 100% navigable via Keyboard.
- Implement "Twin-View Topology" visualization for Cluster Setup.

### FR Coverage Map

FR1: Epic 1 - Wizard de Instalação Compatível
FR2: Epic 1 - Auto-Tune de RAM/ARC
FR3: Epic 1 - Rollback de Boot via GRUB
FR4: Epic 2 - Failover de Nó (<30s)
FR5: Epic 2 - Cotas Rígidas de 90%
FR6: Epic 2 - Gestão de Datasets ZFS
FR7: Epic 3 - Backend Git para Configuração
FR8: Epic 3 - Timeline de Auditoria
FR9: Epic 3 - Rollback de UI
FR10: Epic 5 - Visual Audit Manager
FR11: Epic 5 - Deep Bash Audit (SSH)
FR12: Epic 5 - Conta Break-Glass
FR13: Epic 4 - Join no Active Directory
FR14: Epic 4 - Mapeamento de ACLs Winbind

## Epic List

### Epic 1: The Trustable Appliance Core

Enable users to transform legacy hardware into a secure "Compatibility Mode" cluster with clear visual feedback and automatic hardware tuning.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Resilient HA Storage

Establish a robust storage layer that ensures data survival during hardware failures through ZFS over DRBD and automated failover.
**FRs covered:** FR4, FR5, FR6

### Epic 3: Config Time-Machine

Eliminate configuration anxiety by treating system state as versioned code, providing full history and instant rollback capabilities.
**FRs covered:** FR7, FR8, FR9

### Epic 4: Enterprise Integration

Seamlessly integrate with existing Windows networks, ensuring correct authentication and permission mapping without friction.
**FRs covered:** FR13, FR14

### Epic 5: Compliance Shield

Provide HIPAA-grade traceability for all system access and modifications, ensuring accountability and emergency access integrity.
**FRs covered:** FR10, FR11, FR12

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: The Trustable Appliance Core

Enable users to transform legacy hardware into a secure "Compatibility Mode" cluster with clear visual feedback and automatic hardware tuning.

### Story 1.1: Detect RAID Hardware & Recommend Mode

As a Junior SysAdmin,
I want the system to detect if I'm running on any RAID Controller,
So that I am automatically guided to the safe "Compatibility Mode" without needing to know hardware specifics.

**Acceptance Criteria:**

**Given** the system is booting for the first time
**When** the hardware scan detects ANY supported RAID controller (e.g., PERC 6/i, H700, etc.)
**Then** the Wizard welcome screen should default to recommending "Compatibility Mode"
**And** display a "Hardware Detected: [Controller Name]" badge
**And** show a tooltip explaining why Compatibility Mode is recommended (RAID detected)

### Story 1.2: Compatibility Mode Setup Wizard

As a System Administrator,
I want a guided explanation of the "Compatibility Mode" architecture,
So that I understand and trust the safety of ZFS-over-DRBD before confirming.

**Acceptance Criteria:**

**Given** the user selects "Compatibility Mode"
**When** proceeding through the setup steps
**Then** the UI must display "Educational Tooltips" explaining the architecture (RAID -> DRBD -> ZFS)
**And** require a typed "CONFIRM" action before creating the cluster
**And** visualize the twin-nodes connecting in real-time

### Story 1.3: System Resource Auto-Tuning

As a System Administrator,
I want the system to automatically tune ZFS ARC limits based on my installed RAM,
So that the system remains stable without manual memory tuning.

**Acceptance Criteria:**

**Given** the system boot process
**When** RAM is detected
**Then** set ZFS ARC Max to 50% of Total RAM if < 32GB
**And** set ZFS ARC Max to 2GB less than Total RAM if > 32GB
**And** ensure at least 4GB is reserved for the OS/Middleware

### Story 1.4: Boot Environment Rollback

As a System Administrator,
I want to select previous system versions from the boot menu,
So that I can recover from a failed update immediately.

**Acceptance Criteria:**

**Given** a failed system update or configuration
**When** the server reboots and the GRUB menu appears
**Then** I should see a list of previous "Boot Environments" (snapshots)
**And** selecting one should boot the system exactly as it was at that point
**And** the UI should indicate "Booted from [Snapshot Name]" after login

## Epic 2: Resilient HA Storage

Establish a robust storage layer that ensures data survival during hardware failures through ZFS over DRBD and automated failover.

### Story 2.1: Twin-Node Cluster Initialization

As a System Administrator,
I want to initialize the replication link between my two nodes,
So that they start behaving as a single High Availability cluster.

**Acceptance Criteria:**

**Given** two provisioned nodes with static IPs
**When** I initiate the "Cluster Join" process
**Then** the System should verify SSH key exchange
**And** configure the DRBD resources on the secondary disk
**And** start the initial block-level synchronization

### Story 2.2: ZFS Pool Creation on DRBD

As a System Administrator,
I want the ZFS storage pool to be created on top of the replicated device,
So that all my data is automatically mirrored to the second node.

**Acceptance Criteria:**

**Given** the DRBD resource is UpToDate
**When** the system initiates "Storage Format"
**Then** it must execute `zpool create` targeting `/dev/drbdX` (NOT the raw disk)
**And** enable compression (lz4) by default
**And** verify the pool is visible only on the Primary node

### Story 2.3: 90% Hard Quota Enforcement

As a System Administrator,
I want the system to prevent me from filling the disk above 90%,
So that ZFS Copy-on-Write logic never fails due to lack of space (Death Spiral).

**Acceptance Criteria:**

**Given** the ZFS pool is active
**When** the pool is created or resized
**Then** the system must automatically apply `refquota=90%` to the root dataset
**And** the UI dashboard must show free space based on this quota, not raw disk capacity

### Story 2.4: Dataset Management

As a Storage Admin,
I want to create, rename, and destroy ZFS datasets,
So that I can organize my data logically (e.g., separating Departments or Backups).

**Acceptance Criteria:**

**Given** an active storage pool
**When** I create a new "Share" in the UI
**Then** the backend must create a corresponding ZFS child dataset
**And** inherit default properties (compression, acls) from the parent

### Story 2.5: Automated Failover (Panic Logic)

As a Business Owner,
I want the system to automatically switch to the backup node if the primary fails,
So that my employees can continue working with minimal interruption (<30s).

**Acceptance Criteria:**

**Given** a healthy cluster state
**When** the Primary node loses power (Simulated "Plug Pull")
**Then** the Secondary node must detect the loss within 5 seconds
**And** promote itself to Primary
**And** import the ZFS pool
**And** take over the Virtual IP address
**And** the total downtime must be less than 30 seconds

## Epic 3: Config Time-Machine

Eliminate configuration anxiety by treating system state as versioned code, providing full history and instant rollback capabilities.

### Story 3.1: Git-Backed Configuration Engine

As a System Developer/Admin,
I want the system to automatically commit every configuration change to a local Git repository,
So that I have an immutable history of who changed what and when, without manual effort.

**Acceptance Criteria:**

**Given** the system middleware is running
**When** any configuration file in `/etc/ganache` or database entry is modified via the UI/API
**Then** the system must trigger a `git commit` operation
**And** include the authenticated username and timestamp in the commit message
**And** ensure the repository remains consistent even if concurrent edits occur

### Story 3.2: Configuration Timeline UI

As a System Administrator,
I want to view a chronological timeline of all system changes,
So that I can audit recent activity or troubleshoot when a problem started.

**Acceptance Criteria:**

**Given** the "History" dashboard page
**When** I load the view
**Then** I should see a list of commits with Date, Author, and a brief summary
**And** clicking a commit should show a simple "Diff" (Visual comparison of changes)
**And** the view should allow filtering by user or date range

### Story 3.3: One-Click Config Rollback

As a System Administrator,
I want to revert the system configuration to a previous point in time,
So that I can instantly recover from a breaking configuration change (e.g., bad network setting).

**Acceptance Criteria:**

**Given** a selected commit in the Timeline UI
**When** I click the "Rollback to this Point" button and confirm
**Then** the system must checkout that specific git commit state
**And** apply the configuration files to the live system
**And** restart any services that were affected by the changes
**And** create a new "Rollback Commit" to document this action

## Epic 4: Enterprise Integration

Seamlessly integrate with existing Windows networks, ensuring correct authentication and permission mapping without friction, using high-performance System Integration layers.

### Story 4.1: Active Directory Domain Join (Rust Middleware)

As a SysAdmin,
I want to join the Ganache appliance to an existing Active Directory domain via the UI,
So that I can assign existing AD users and groups to SMB shares without manual user management.

**Acceptance Criteria:**

**Given** valid Domain Controller credentials and DNS settings
**When** I submit the "Join Domain" form
**Then** the System Integration Layer must execute the join sequence securely
**And** update the Samba configuration (`smb.conf`) to "ADS" security mode
**And** refactor/port the proven Domain Join logic from TrueNAS SCALE (Python) into Rust (Ganache Core)
**And** the caching logic must be implemented in the efficient tRPC backend for performance
**And** persist the AD service state across reboots

### Story 4.2: ACL Mapper (Rust Core Implementation)

As a SysAdmin,
I want to browse Active Directory groups when configuring share permissions,
So that I can easily restrict access to specific departments (e.g., "Finance-Group").

**Acceptance Criteria:**

**Given** a successfully joined AD domain
**When** I configure a Dataset's "ACL Manager"
**Then** I should see a searchable list of AD Users and Groups via a backend API
**And** the ACL application logic must be ported from TrueNAS SCALE (Python) to Rust to ensure correctness
**And** permissions applied must be validated against `getfacl` outputterns)
**And** list "Domain Admins" and other groups without timeouts

### Story 4.3: ACL Management for Shares

As a System Administrator,
I want to apply Windows-compatible permissions (ACLs) to my datasets,
So that access control works exactly like a native Windows Server.

**Acceptance Criteria:**

**Given** a dataset shared via SMB
**When** I edit permissions in the UI
**Then** the backend must apply NFSv4/POSIX ACLs compatible with Windows Explorer
**And** the ACL application logic must be ported from TrueNAS SCALE (Python) to Rust to ensure correctness
**And** support recursive application of permissions efficiently

## Epic 5: Compliance Shield

Provide HIPAA-grade traceability for all system access and modifications, ensuring accountability and emergency access integrity.

### Story 5.1: Deep SSH Audit Logging

As a Security Officer,
I want the system to record every command executed in the terminal (SSH/Console), not just login events,
So that I can perform a complete forensic analysis in case of a breach or accident.

**Acceptance Criteria:**

**Given** an active SSH session by any user
**When** a command is executed (e.g., `rm -rf`, `sudo vi`)
**Then** the system must capture the command, arguments, timestamp, and real user ID
**And** send this data to the tamper-proof system audit log
**And** capture commands even if the user tries to evade logging (e.g., inside scripts or sub-shells)

### Story 5.2: Visual Audit Manager

As an Auditor,
I want a search engine for file access logs to answer "Who accessed sensitive file X?",
So that I can quickly respond to compliance requests without grep-ing text files.

**Acceptance Criteria:**

**Given** the "Audit" dashboard page
**When** I search for a filename (e.g., "patient_records.xls")
**Then** the results must show every Open/Read/Write/Delete event for that file
**And** display the User, Client IP, and Timestamp for each event
**And** allow exporting the report as PDF/CSV

### Story 5.3: Break-Glass Emergency Admin

As a CIO/IT Director,
I want a secure local admin account that is normally disabled but can be activated if Active Directory is down,
So that we are never locked out of our own storage system during a disaster.

**Acceptance Criteria:**

**Given** the AD controller is unreachable
**When** an admin triggers the "Break-Glass" activation (physical console or specific secret URL)
**Then** the system must enable the local `emergency_admin` account
**And** force a password reset on first login
**And** send a critical "High Priority" alert to all configured notification channels (Email/SMS)
**And** log firmly who triggered the activation
