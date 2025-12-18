# Story 2.1: Twin-Node Cluster Initialization

## Description

As a System Administrator, I want to initialize the replication link between my two nodes, so that they start behaving as a single High Availability cluster.

## Status: done

## Acceptance Criteria

- [ ] **Given** two provisioned nodes with static IPs
- [ ] **When** I initiate the "Cluster Join" process
- [ ] **Then** the System should verify SSH key exchange
- [ ] **And** configure the DRBD resources on the secondary disk
- [ ] **And** start the initial block-level synchronization

## Technical Notes

- Uses `ClusterService` in `ganache-lib`.
- Requires backend endpoints for `POST /api/v1/cluster/join`.
- Frontend should visualize the "Twin-View Topology" as per UX requirements.
- Simulation/Mock: DRBD and SSH operations should be simulated for the dev environment.
